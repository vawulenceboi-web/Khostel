import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, generateVerificationEmail } from '@/lib/email'
import { z } from 'zod'

const sendVerificationSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = sendVerificationSchema.parse(body)
    
    console.log('📧 Sending verification email to:', validatedData.email)

    // Check if user exists
    const { data: user, error } = await db.supabase
      .from('users')
      .select('id, email, first_name, last_name, email_verified')
      .eq('email', validatedData.email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (user.email_verified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    console.log('📧 Generated verification code:', verificationCode, 'for user:', user.id)

    // Store verification code in database
    const { error: updateError } = await db.supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_code_expires: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error storing verification code:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to process verification request' },
        { status: 500 }
      )
    }

    // Send verification email
    const userName = `${user.first_name} ${user.last_name || ''}`.trim()
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Verify Your k-H Account',
      html: generateVerificationEmail(verificationCode, userName)
    })

    if (!emailResult.success) {
      console.error('❌ Failed to send verification email')
    }

    console.log('✅ Verification email sent successfully')

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Send verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}