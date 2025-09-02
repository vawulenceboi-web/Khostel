import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { locations } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')
    
    const db = getDb()
    
    let query = db.select().from(locations)
    
    if (schoolId) {
      query = query.where(eq(locations.schoolId, schoolId))
    }
    
    const result = await query

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