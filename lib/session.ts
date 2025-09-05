import { createClient } from '@supabase/supabase-js'
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

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCurrentUser(): Promise<SessionUser | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email!,
    ...session.user.user_metadata,
    phone: session.user.phone,
    role: (session.user.user_metadata?.role as SessionUser['role']) || 'student',
    verified: session.user.user_metadata?.verified || false,
  }
}

export async function getServerSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const user: SessionUser = {
    id: session.user.id,
    email: session.user.email!,
    phone: session.user.phone,
    role: (session.user.user_metadata?.role as SessionUser['role']) || 'student',
    verified: session.user.user_metadata?.verified || false,
    user_metadata: session.user.user_metadata
  }

  return {
    user,
    access_token: session.access_token,
    refresh_token: session.refresh_token
  }
}
