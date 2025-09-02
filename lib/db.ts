import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Auto-generate database URL from Supabase URL if not provided
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  
  if (process.env.SUPABASE_URL) {
    // Extract project ref from Supabase URL
    const supabaseUrl = process.env.SUPABASE_URL
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
    if (match) {
      const projectRef = match[1]
      // Auto-generate database URL (user will need to provide password)
      return `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`
    }
  }
  
  throw new Error('Either DATABASE_URL or SUPABASE_URL must be set')
}

// Validate required environment variables
function validateEnv() {
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL must be set - get this from your Supabase dashboard')
  }

  if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_ANON_KEY must be set - get this from your Supabase dashboard')
  }

  const dbUrl = getDatabaseUrl()
  if (dbUrl.includes('[YOUR-PASSWORD]')) {
    throw new Error('Please replace [YOUR-PASSWORD] in your DATABASE_URL with your actual Supabase database password')
  }
}

// Create Supabase client (only when needed)
export function getSupabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials not configured')
  }
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )
}

// Create database connection (only when needed)
export function getDb() {
  validateEnv()
  const databaseUrl = getDatabaseUrl()
  const client = postgres(databaseUrl)
  return drizzle(client, { schema })
}

// For easy access (validates on first use)
export const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY 
  ? getSupabaseClient() 
  : null

export const db = (() => {
  try {
    return process.env.SUPABASE_URL ? getDb() : null
  } catch {
    return null // Return null during build time
  }
})()