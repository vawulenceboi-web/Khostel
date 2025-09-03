import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, generateWelcomeEmail } from '@/lib/email'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  verificationCode: z.string().min(6, 'Verification code must be 6 digits')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifyEmailSchema.parse(body)
    
    console.log('📧 Email verification attempt for:', validatedData.email)

    // Check if user exists and verification code is valid
    const { data: user, error } = await db.supabase
      .from('users')
      .select('id, email, first_name, last_name, role, email_verified, verification_code, verification_code_expires')
      .eq('email', validatedData.email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or verification code' },
        { status: 400 }
      )
    }

    if (user.email_verified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Check if verification code matches
    if (user.verification_code !== validatedData.verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Check if verification code has expired
    if (!user.verification_code_expires || new Date() > new Date(user.verification_code_expires)) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    console.log('✅ Verification code verified, updating user...')

    // Mark email as verified and clear verification code
    const { error: updateError } = await db.supabase
      .from('users')
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error verifying email:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Send welcome email
    const userName = `${user.first_name} ${user.last_name || ''}`.trim()
    const welcomeEmailResult = await sendEmail({
      to: user.email,
      subject: 'Welcome to k-H Platform!',
      html: generateWelcomeEmail(userName, user.role)
    })

    if (!welcomeEmailResult.success) {
      console.error('❌ Failed to send welcome email')
      // Don't fail the verification because of welcome email
    }

    console.log('✅ Email verified successfully and welcome email sent')

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Welcome to k-H.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Email verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}