export const runtime = 'nodejs';
import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'


// This route handles callbacks from Supabase Auth (email verification, password reset, etc.)
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  
  if (code) {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Auth callback error:', error.message)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/error?error=${encodeURIComponent(error.message)}`)
    }
    
    // Handle different callback types
    if (type === 'recovery' && data.session) {
      // Password reset flow - redirect to reset password page with session tokens
      const redirectUrl = new URL('/auth/reset-password', process.env.NEXT_PUBLIC_SITE_URL)
      redirectUrl.searchParams.set('access_token', data.session.access_token)
      redirectUrl.searchParams.set('refresh_token', data.session.refresh_token)
      
      console.log('🔄 Password recovery callback - redirecting to reset page')
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    // Default: email verification or other - redirect to dashboard
    console.log('✅ Auth callback successful - redirecting to dashboard')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`)
  }

  // If no code is present, redirect to the home page
  return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!)
}
