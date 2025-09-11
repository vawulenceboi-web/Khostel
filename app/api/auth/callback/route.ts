export const runtime = 'nodejs';
import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'


// This route handles callbacks from Supabase Auth (email verification, password reset, etc.)
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  
  console.log('🔗 AUTH CALLBACK DEBUG: Received callback request')
  console.log('🔗 AUTH CALLBACK DEBUG: Full URL:', requestUrl.toString())
  console.log('🔗 AUTH CALLBACK DEBUG: Code present:', !!code)
  console.log('🔗 AUTH CALLBACK DEBUG: Type:', type)
  console.log('🔗 AUTH CALLBACK DEBUG: All params:', Object.fromEntries(requestUrl.searchParams))
  console.log('🔗 AUTH CALLBACK DEBUG: Site URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('🔗 AUTH CALLBACK DEBUG: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  if (code) {
    console.log('🔗 AUTH CALLBACK DEBUG: Exchanging code for session...')
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('🔗 AUTH CALLBACK DEBUG: Exchange response received')
    console.log('🔗 AUTH CALLBACK DEBUG: Data:', data)
    console.log('🔗 AUTH CALLBACK DEBUG: Error:', error)
    console.log('🔗 AUTH CALLBACK DEBUG: Session present:', !!data?.session)
    console.log('🔗 AUTH CALLBACK DEBUG: User present:', !!data?.user)
    
    if (error) {
      console.error('❌ AUTH CALLBACK ERROR:', error.message)
      console.error('❌ AUTH CALLBACK ERROR Details:', {
        name: error.name,
        message: error.message,
        status: error.status,
        statusCode: error.status
      })
      
      const errorUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/error?error=${encodeURIComponent(error.message)}`
      console.log('🔗 AUTH CALLBACK DEBUG: Redirecting to error page:', errorUrl)
      return NextResponse.redirect(errorUrl)
    }
    
    // Handle different callback types
    if (type === 'recovery' && data.session) {
      console.log('🔄 AUTH CALLBACK DEBUG: Password recovery flow detected')
      console.log('🔄 AUTH CALLBACK DEBUG: Session access token length:', data.session.access_token.length)
      console.log('🔄 AUTH CALLBACK DEBUG: Session refresh token length:', data.session.refresh_token.length)
      
      // Password reset flow - redirect to reset password page with session tokens
      const redirectUrl = new URL('/auth/reset-password', process.env.NEXT_PUBLIC_SITE_URL)
      redirectUrl.searchParams.set('access_token', data.session.access_token)
      redirectUrl.searchParams.set('refresh_token', data.session.refresh_token)
      
      console.log('🔄 AUTH CALLBACK DEBUG: Password recovery redirect URL:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    // Default: email verification or other - redirect to dashboard
    console.log('✅ AUTH CALLBACK DEBUG: Default flow - redirecting to verified page')
    const verifiedUrl = new URL('/auth/verified', process.env.NEXT_PUBLIC_SITE_URL)
    verifiedUrl.searchParams.set('email', data.user?.email || '')
    console.log('✅ AUTH CALLBACK DEBUG: Verified page URL:', verifiedUrl.toString())
    return NextResponse.redirect(verifiedUrl.toString())
  }

  // If no code is present, redirect to the home page
  console.log('🔗 AUTH CALLBACK DEBUG: No code present - redirecting to home')
  const homeUrl = process.env.NEXT_PUBLIC_SITE_URL!
  console.log('🔗 AUTH CALLBACK DEBUG: Home URL:', homeUrl)
  return NextResponse.redirect(homeUrl)
}
