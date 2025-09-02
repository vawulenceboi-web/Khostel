import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envStatus = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    }

    const envDetails = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 
        `${process.env.SUPABASE_URL.substring(0, 30)}...` : 'Not set',
      DATABASE_URL: process.env.DATABASE_URL ? 
        `${process.env.DATABASE_URL.substring(0, 40)}...` : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
    }

    // Test database connection
    let dbConnectionStatus = 'Not tested'
    try {
      const { getDb } = await import('@/lib/db')
      const db = getDb()
      // Simple query to test connection
      await db.select().from(await import('@/lib/schema').then(m => m.users)).limit(1)
      dbConnectionStatus = 'Connected successfully'
    } catch (dbError) {
      dbConnectionStatus = `Connection failed: ${dbError.message}`
    }

    return NextResponse.json({
      success: true,
      environment: envStatus,
      details: envDetails,
      database: dbConnectionStatus,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}