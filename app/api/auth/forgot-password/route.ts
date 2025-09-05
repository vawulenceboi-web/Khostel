export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { supabase } from '@/lib/supabase'


const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)
    
    console.log('🔑 Password reset requested for:', validatedData.email)

    // Use Supabase Auth to send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error('❌ Error sending reset email:', error.message)
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive a password reset link.'
      })
    }

    console.log('✅ Password reset email sent successfully')

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive a password reset link.'
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