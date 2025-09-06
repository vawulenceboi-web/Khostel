export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Debug endpoint to check user status
export async function POST(request: NextRequest) {
  console.log('🔍 USER STATUS DEBUG: ===== USER STATUS CHECK STARTED =====')
  
  try {
    const { email, adminKey } = await request.json()
    
    // Simple admin check
    if (adminKey !== 'debug-user-status-2024') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 USER STATUS DEBUG: Checking status for:', email)

    // Method 1: Try to get user via password reset (works without service role)
    console.log('🔍 USER STATUS DEBUG: Testing user existence via password reset...')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
    })

    console.log('🔍 USER STATUS DEBUG: Password reset response:', resetError)

    let userExists = false
    let userStatusFromReset = 'unknown'

    if (!resetError) {
      userExists = true
      userStatusFromReset = 'exists_and_can_receive_reset'
    } else if (resetError.message.includes('User not found')) {
      userExists = false
      userStatusFromReset = 'does_not_exist'
    } else {
      userExists = true // Likely exists but has other issues
      userStatusFromReset = `exists_but_error: ${resetError.message}`
    }

    // Method 2: Try a login with a dummy password to see the exact error
    console.log('🔍 USER STATUS DEBUG: Testing login with dummy password...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy-password-12345'
    })

    console.log('🔍 USER STATUS DEBUG: Dummy login response:', { loginData, loginError })

    let loginStatus = 'unknown'
    if (loginError) {
      if (loginError.message.includes('Invalid login credentials')) {
        loginStatus = 'user_exists_but_wrong_password'
      } else if (loginError.message.includes('Email not confirmed')) {
        loginStatus = 'user_exists_but_email_not_confirmed'
      } else {
        loginStatus = `other_error: ${loginError.message}`
      }
    } else {
      loginStatus = 'unexpected_success_with_dummy_password'
    }

    const debugInfo = {
      email,
      timestamp: new Date().toISOString(),
      userExists,
      userStatusFromReset,
      loginStatus,
      resetError: resetError ? {
        message: resetError.message,
        status: resetError.status,
        name: resetError.name
      } : null,
      loginError: loginError ? {
        message: loginError.message,
        status: loginError.status,
        name: loginError.name
      } : null
    }

    console.log('🔍 USER STATUS DEBUG: Complete analysis:', JSON.stringify(debugInfo, null, 2))

    return NextResponse.json({
      success: true,
      data: debugInfo
    })

  } catch (error) {
    console.error('❌ USER STATUS DEBUG ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Debug failed', error: (error as Error).message },
      { status: 500 }
    )
  }
}