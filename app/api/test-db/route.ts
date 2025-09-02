import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { users } from '@/lib/schema'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Check environment variables
    const envCheck = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    }
    
    console.log('📊 Environment variables:', envCheck)
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        message: 'DATABASE_URL not configured',
        envCheck
      }, { status: 500 })
    }

    // Test database connection
    const db = getDb()
    console.log('✅ Database instance created')
    
    // Try to query users table
    const userCount = await db.select().from(users).limit(1)
    console.log('✅ Database query successful, users table exists')
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount: userCount.length,
      envCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}