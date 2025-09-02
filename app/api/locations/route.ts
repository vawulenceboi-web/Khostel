import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📍 Fetching locations...')
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')
    
    let result
    if (schoolId) {
      console.log('🔍 Fetching locations for school:', schoolId)
      result = await db.locations.findBySchool(schoolId)
    } else {
      // For now, return empty array if no school specified
      result = []
    }
    
    console.log('✅ Locations fetched successfully:', result.length)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}