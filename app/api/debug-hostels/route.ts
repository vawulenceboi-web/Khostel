import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Fetching hostels for structure analysis...')

    // Get raw hostels data
    const { data: rawHostels, error } = await db.supabase
      .from('hostels')
      .select(`
        *,
        location:locations(*),
        agent:users(id, first_name, last_name, phone, verified_status, profile_image_url)
      `)
      .limit(5)

    if (error) {
      console.error('❌ DEBUG: Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    console.log('✅ DEBUG: Raw hostels data:', rawHostels)

    // Process through the same method as the main API
    const processedHostels = await db.hostels.findAll({})
    console.log('✅ DEBUG: Processed hostels:', processedHostels)

    return NextResponse.json({
      success: true,
      debug: true,
      rawData: rawHostels,
      processedData: processedHostels,
      dataStructure: rawHostels?.[0] ? Object.keys(rawHostels[0]) : [],
      agentStructure: rawHostels?.[0]?.agent ? Object.keys(rawHostels[0].agent) : [],
      locationStructure: rawHostels?.[0]?.location ? Object.keys(rawHostels[0].location) : [],
      totalCount: rawHostels?.length || 0
    })

  } catch (error) {
    console.error('❌ DEBUG: Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}