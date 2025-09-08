export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { supabase } from '@/lib/supabase'


const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  console.log('🔑 FORGOT PASSWORD API: ===== RESET REQUEST STARTED =====')
  console.log('🔑 FORGOT PASSWORD API: Timestamp:', new Date().toISOString())
  console.log('🔑 FORGOT PASSWORD API: Environment check:')
  console.log('🔑 FORGOT PASSWORD API: - NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('🔑 FORGOT PASSWORD API: - NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔑 FORGOT PASSWORD API: - SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('🔑 FORGOT PASSWORD API: - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...')
  }
  
  try {
    const body = await request.json()
    console.log('🔑 FORGOT PASSWORD API: Request body received')
    console.log('🔑 FORGOT PASSWORD API: Email:', body.email)
    
    const validatedData = forgotPasswordSchema.parse(body)
    console.log('✅ FORGOT PASSWORD API: Input validation passed')
    
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`
    console.log('🔑 FORGOT PASSWORD API: Redirect URL constructed:', redirectUrl)

    // Send OTP for password reset instead of magic link
    console.log('🔑 FORGOT PASSWORD API: Calling supabase.auth.signInWithOtp for password reset...')
    const startTime = Date.now()
    
    const { error } = await supabase.auth.signInWithOtp({
      email: validatedData.email,
      options: {
        shouldCreateUser: false, // Don't create new users during password reset
        data: {
          type: 'password_reset',
          timestamp: new Date().toISOString()
        }
      }
    })

    const endTime = Date.now()
    console.log('🔑 FORGOT PASSWORD API: Supabase call completed in', endTime - startTime, 'ms')
    console.log('🔑 FORGOT PASSWORD API: Response error present:', !!error)

    if (error) {
      console.error('❌ FORGOT PASSWORD API ERROR: Supabase request failed')
      console.error('❌ FORGOT PASSWORD API ERROR: Error name:', error.name)
      console.error('❌ FORGOT PASSWORD API ERROR: Error message:', error.message)
      console.error('❌ FORGOT PASSWORD API ERROR: Error status:', error.status)
      console.error('❌ FORGOT PASSWORD API ERROR: Full error:', JSON.stringify(error, null, 2))
      
      // Check for specific error types
      if (error.message.includes('SMTP')) {
        console.error('❌ FORGOT PASSWORD API ERROR: Email delivery issue detected')
      }
      if (error.message.includes('rate limit')) {
        console.error('❌ FORGOT PASSWORD API ERROR: Rate limiting detected')
      }
      if (error.message.includes('Invalid')) {
        console.error('❌ FORGOT PASSWORD API ERROR: Invalid configuration detected')
      }
      
      // Don't reveal if email exists for security, but log the actual error
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive a password reset link.',
        debug: {
          actualError: error.message,
          errorCode: error.status,
          timestamp: new Date().toISOString()
        }
      })
    }

    console.log('✅ FORGOT PASSWORD API SUCCESS: Reset email request completed successfully')
    console.log('✅ FORGOT PASSWORD API SUCCESS: Email:', validatedData.email)
    console.log('✅ FORGOT PASSWORD API SUCCESS: Redirect URL:', redirectUrl)
    console.log('✅ FORGOT PASSWORD API SUCCESS: Completed at:', new Date().toISOString())

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive a password reset link.',
      debug: {
        emailSent: true,
        redirectUrl: redirectUrl,
        timestamp: new Date().toISOString()
      }
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