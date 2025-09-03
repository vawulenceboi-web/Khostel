import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)
    
    console.log('🔑 Password reset requested for:', validatedData.email)

    // Check if user exists
    const { data: user, error } = await db.supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('email', validatedData.email)
      .single()

    if (error || !user) {
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive a password reset code.'
      })
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    console.log('🔑 Generated reset code:', resetCode, 'for user:', user.id)

    // Store reset code in database
    const { error: updateError } = await db.supabase
      .from('users')
      .update({
        reset_code: resetCode,
        reset_code_expires: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error storing reset code:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to process reset request' },
        { status: 500 }
      )
    }

    // Send password reset email
    const userName = `${user.first_name} ${user.last_name || ''}`.trim()
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Reset Your k-H Password',
      html: generatePasswordResetEmail(resetCode, userName)
    })

    if (!emailResult.success) {
      console.error('❌ Failed to send reset email')
      // Still return success to user for security
    }

    console.log('✅ Password reset email sent successfully')

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive a password reset code.'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}