import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🏫 Fetching schools...')
    const result = await db.schools.findAll()
    console.log('✅ Schools fetched successfully:', result.length)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Get schools error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}