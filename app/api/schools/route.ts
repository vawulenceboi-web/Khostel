import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { schools } from '@/lib/schema'

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const result = await db.select().from(schools)

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