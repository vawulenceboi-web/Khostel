import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Only validate environment variables at runtime, not build time
function validateEnv() {
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL must be set')
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_ANON_KEY must be set')
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set')
  }
}

// Create Supabase client (only when needed)
export function getSupabaseClient() {
  validateEnv()
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
}

// Create database connection (only when needed)
export function getDb() {
  validateEnv()
  const client = postgres(process.env.DATABASE_URL!)
  return drizzle(client, { schema })
}

// For backward compatibility
export const supabase = process.env.SUPABASE_URL ? getSupabaseClient() : null
export const db = process.env.DATABASE_URL ? getDb() : null