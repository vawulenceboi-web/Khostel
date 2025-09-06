import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔧 MIDDLEWARE: Request to:', request.nextUrl.pathname)
  
  // Debug cookies
  const allCookies = request.cookies.getAll()
  console.log('🔧 MIDDLEWARE: Total cookies:', allCookies.length)
  console.log('🔧 MIDDLEWARE: Cookie names:', allCookies.map(c => c.name))
  
  // Look for Supabase session cookies specifically
  const supabaseCookies = allCookies.filter(c => 
    c.name.includes('supabase') || 
    c.name.includes('sb-') ||
    c.name.includes('auth')
  )
  console.log('🔧 MIDDLEWARE: Supabase cookies found:', supabaseCookies.length)
  supabaseCookies.forEach(cookie => {
    console.log('🔧 MIDDLEWARE: Supabase cookie:', cookie.name, '=', cookie.value.substring(0, 20) + '...')
  })
  
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('🔧 MIDDLEWARE: getAll() called, returning', cookies.length, 'cookies')
          return cookies
        },
        setAll(cookiesToSet) {
          console.log('🔧 MIDDLEWARE: setAll() called with', cookiesToSet.length, 'cookies')
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log('🔧 MIDDLEWARE: Setting cookie:', name)
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  console.log('🔧 MIDDLEWARE: Getting session...')
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()
  
  console.log('🔧 MIDDLEWARE: Session result:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    error: error?.message,
    path: request.nextUrl.pathname
  })

  // Public paths that don't require authentication
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

  // Check auth condition
  if (!session && !isPublicPath) {
    // Save the original URL
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Special routes for authenticated users
  if (session && ['/auth/login', '/auth/register'].some(path => 
    request.nextUrl.pathname.startsWith(path)
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
