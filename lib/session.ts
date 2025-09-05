import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.generated'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  return {
    id: session.user.id,
    email: session.user.email!,
    ...session.user.user_metadata,
    phone: session.user.phone,
    role: session.user.user_metadata?.role || 'student',
  }
}

export async function getServerSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
