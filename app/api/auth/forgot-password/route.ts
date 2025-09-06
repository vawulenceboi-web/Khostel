export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { supabase } from '@/lib/supabase'


const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  console.log('🔑 FORGOT PASSWORD API DEBUG: Request received')
  console.log('🔑 FORGOT PASSWORD API DEBUG: Site URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('🔑 FORGOT PASSWORD API DEBUG: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  try {
    const body = await request.json()
    console.log('🔑 FORGOT PASSWORD API DEBUG: Request body:', { ...body, password: '[HIDDEN]' })
    
    const validatedData = forgotPasswordSchema.parse(body)
    console.log('🔑 FORGOT PASSWORD API DEBUG: Validation passed for:', validatedData.email)
    
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`
    console.log('🔑 FORGOT PASSWORD API DEBUG: Redirect URL:', redirectUrl)

    // Use Supabase Auth to send password reset email
    console.log('🔑 FORGOT PASSWORD API DEBUG: Calling supabase.auth.resetPasswordForEmail...')
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: redirectUrl,
    })

    console.log('🔑 FORGOT PASSWORD API DEBUG: Supabase response received')
    console.log('🔑 FORGOT PASSWORD API DEBUG: Error:', error)

    if (error) {
      console.error('❌ FORGOT PASSWORD API ERROR:', error.message)
      console.error('❌ FORGOT PASSWORD API ERROR Details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        statusCode: error.status
      })
      // Don't reveal if email exists for security
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive a password reset link.'
      })
    }

    console.log('✅ FORGOT PASSWORD API SUCCESS: Reset email sent successfully')

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