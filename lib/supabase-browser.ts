import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.generated'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Browser client that properly handles SSR with cookies
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

console.log('🔧 BROWSER SUPABASE: Client initialized for SSR with cookies')