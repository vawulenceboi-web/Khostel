import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { createHostelSchema } from '@/lib/schema'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🏠 Fetching hostels...')
    const { searchParams } = new URL(request.url)
    
    // Build filters object
    const filters: any = {}
    
    const locationId = searchParams.get('locationId')
    if (locationId) filters.locationId = locationId

    const minPrice = searchParams.get('minPrice')
    if (minPrice) filters.minPrice = parseInt(minPrice)

    const maxPrice = searchParams.get('maxPrice')
    if (maxPrice) filters.maxPrice = parseInt(maxPrice)

    const roomType = searchParams.get('roomType')
    if (roomType) filters.roomType = roomType

    const availability = searchParams.get('availability')
    if (availability !== null) filters.availability = availability === 'true'

    const search = searchParams.get('search')
    if (search) filters.search = search

    console.log('🔍 Applying filters:', filters)

    const result = await db.hostels.findAll(filters)
    console.log('✅ Hostels fetched successfully:', result.length)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Get hostels error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'agent') {
      return NextResponse.json(
        { success: false, message: 'Agent role required' },
        { status: 403 }
      )
    }

    if (!session.user.verifiedStatus) {
      return NextResponse.json(
        { success: false, message: 'Agent verification required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createHostelSchema.parse(body)
    
    const db = getDb()
    const [newHostel] = await db
      .insert(hostels)
      .values({
        ...validatedData,
        agentId: session.user.id,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newHostel,
      message: 'Hostel created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create hostel error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}