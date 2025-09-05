import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.generated'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Initialize Supabase client with anon key for auth operations
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  }
)

// Use this for admin operations only
export const supabaseAdmin = supabaseServiceRole
  ? createClient<Database>(
      supabaseUrl,
      supabaseServiceRole,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        },
        db: {
          schema: 'public'
        }
      }
    )
  : supabase

// Helper function to handle Supabase errors
export function handleSupabaseError(error: Error) {
  console.error('Supabase error:', error)

  if (error.message.includes('JWT expired')) {
    return 'Your session has expired. Please sign in again.'
  }

  if (error.message.includes('Invalid login credentials')) {
    return 'Invalid email or password.'
  }

  if (error.message.includes('Email not confirmed')) {
    return 'Please verify your email address before signing in.'
  }

  return 'An unexpected error occurred. Please try again.'
}
