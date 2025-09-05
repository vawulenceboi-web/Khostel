import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

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
      // Return all locations if no school specified (for hostel creation)
      console.log('🔍 Fetching all locations')
      result = await db.locations.findAll()
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