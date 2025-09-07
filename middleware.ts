import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔧 MIDDLEWARE: Request to:', request.nextUrl.pathname)

  // Debug cookies
  const allCookies = request.cookies.getAll()
  console.log('🔧 MIDDLEWARE: Total cookies:', allCookies.length)
  console.log('🔧 MIDDLEWARE: Cookie names:', allCookies.map(c => c.name))

  // Short-circuit OTP routes
  const otpPaths = ['/auth/reset-password-otp']
  if (otpPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    console.log('🔧 MIDDLEWARE: OTP route detected, skipping session check')
    return NextResponse.next()
  }

  // Public paths that don’t require auth
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/',
    '/privacy',
    '/terms',
  ]
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )
  if (isPublicPath) {
    console.log('🔧 MIDDLEWARE: Public path, allowing through without auth check')
    return NextResponse.next()
  }

  // Check for auth flow states (code verifier / callback)
  const hasCodeVerifier = allCookies.some(cookie =>
    cookie.name.includes('auth-token-code-verifier') || 
    (cookie.name.startsWith('sb-') && cookie.name.includes('code-verifier'))
  )
  const hasAuthCode = request.nextUrl.searchParams.has('code')
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback'
  if (hasCodeVerifier || hasAuthCode || isAuthCallback) {
    console.log('🔧 MIDDLEWARE: Auth flow in progress (code verifier/callback), allowing through')
    return NextResponse.next()
  }

  // Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            return cookiesToSet
          })
        },
      },
    }
  )

  console.log('🔧 MIDDLEWARE: Getting user (secure method)...')
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('🔧 MIDDLEWARE: User result:', {
    hasUser: !!user,
    email: user?.email,
    emailConfirmed: !!user?.email_confirmed_at,
    role: user?.user_metadata?.role,
    error: error?.message,
    path: request.nextUrl.pathname
  })

  // Redirect unauthenticated users from protected routes
  if (!user) {
    console.log('🔧 MIDDLEWARE: No user found, redirecting to login')
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle users with unconfirmed emails (legacy users)
  if (user && !user.email_confirmed_at) {
    console.log('🔧 MIDDLEWARE: User email not confirmed, allowing access for now')
    // Optionally, redirect to a confirmation page:
    // return NextResponse.redirect(new URL('/auth/confirm-email', request.url))
    return NextResponse.next()
  }

  // Redirect authenticated users away from auth pages
  if (user && ['/auth/login', '/auth/register'].some(path =>
    request.nextUrl.pathname.startsWith(path)
  )) {
    console.log('🔧 MIDDLEWARE: Authenticated user accessing auth pages, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}