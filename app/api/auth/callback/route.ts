import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// This route handles callbacks from Supabase Auth (email verification, password reset, etc.)
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Auth callback error:', error.message)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/error?error=${encodeURIComponent(error.message)}`)
    }
    
    // Redirect to the dashboard or home page after successful auth
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`)
  }

  // If no code is present, redirect to the home page
  return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL!)
}
