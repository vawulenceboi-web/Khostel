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
      // For production, use pooled connection to avoid timeouts
      const isProduction = process.env.NODE_ENV === 'production'
      const host = isProduction ? `aws-0-us-east-1.pooler.supabase.com` : `db.${projectRef}.supabase.co`
      const port = isProduction ? '6543' : '5432'
      
      return `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@${host}:${port}/postgres`
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

// Global connection cache to prevent timeouts
let cachedDb: any = null

// Create database connection (only when needed)
export function getDb() {
  // Return cached connection if available
  if (cachedDb) {
    return cachedDb
  }
  
  validateEnv()
  const databaseUrl = getDatabaseUrl()
  
  // Simplified connection for serverless with timeout protection
  const client = postgres(databaseUrl, {
    prepare: false,
    ssl: 'require',
    max: 1,
    connect_timeout: 5, // Shorter timeout
    command_timeout: 10, // Shorter command timeout
    idle_timeout: 20,
  })
  
  const db = drizzle(client, { schema })
  
  // Cache the connection
  cachedDb = db
  
  return db
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