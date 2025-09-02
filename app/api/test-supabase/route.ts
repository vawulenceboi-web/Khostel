import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing Supabase client connection...')
    
    const supabase = getSupabaseClient()
    console.log('✅ Supabase client created')
    
    // Test with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase query error:', error)
      return NextResponse.json({
        success: false,
        message: 'Supabase query failed',
        error: error.message,
        hint: error.hint,
        details: error.details
      }, { status: 500 })
    }
    
    console.log('✅ Supabase query successful')
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Supabase test failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Supabase connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}