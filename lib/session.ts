import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.generated'

export type SessionUser = {
  id: string
  email: string
  phone?: string | null
  role: 'student' | 'agent' | 'admin'
  verified?: boolean
  user_metadata?: {
    role?: string
    name?: string
    verified?: boolean
  }
}

export type Session = {
  user: SessionUser
  access_token: string
  refresh_token?: string
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  console.log('🔐 SESSION: getCurrentUser called')
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔐 SESSION: Session check result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      error: error?.message
    })

    if (error) {
      console.error('❌ SESSION ERROR:', error)
      return null
    }

    if (!session?.user) {
      console.log('❌ SESSION: No session or user found')
      return null
    }

    console.log('✅ SESSION: User found:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.user_metadata?.role
    })

    return {
      id: session.user.id,
      email: session.user.email!,
      phone: session.user.phone,
      role: (session.user.user_metadata?.role as SessionUser['role']) || 'student',
      verified: session.user.user_metadata?.verified || false,
      user_metadata: session.user.user_metadata
    }
  } catch (error) {
    console.error('❌ SESSION EXCEPTION:', error)
    return null
  }
}

export async function getServerSession(): Promise<Session | null> {
  console.log('🔐 SESSION: getServerSession called')
  
  const user = await getCurrentUser()
  if (!user) return null

  console.log('✅ SESSION: Server session created for:', user.email)

  return {
    user,
    access_token: 'server-session', // Placeholder
    refresh_token: undefined
  }
}
