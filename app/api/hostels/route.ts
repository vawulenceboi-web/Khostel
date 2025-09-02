import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDb } from '@/lib/db'
import { hostels, locations, users, createHostelSchema } from '@/lib/schema'
import { eq, and, gte, lte, ilike } from 'drizzle-orm'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const db = getDb()
    
    // Build query with filters
    let query = db
      .select({
        id: hostels.id,
        title: hostels.title,
        description: hostels.description,
        price: hostels.price,
        priceType: hostels.priceType,
        roomType: hostels.roomType,
        images: hostels.images,
        amenities: hostels.amenities,
        availability: hostels.availability,
        address: hostels.address,
        createdAt: hostels.createdAt,
        location: {
          id: locations.id,
          name: locations.name,
          latitude: locations.latitude,
          longitude: locations.longitude,
        },
        agent: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          verifiedStatus: users.verifiedStatus,
        }
      })
      .from(hostels)
      .leftJoin(locations, eq(hostels.locationId, locations.id))
      .leftJoin(users, eq(hostels.agentId, users.id))

    // Apply filters
    const filters = []
    
    const locationId = searchParams.get('locationId')
    if (locationId) {
      filters.push(eq(hostels.locationId, locationId))
    }

    const minPrice = searchParams.get('minPrice')
    if (minPrice) {
      filters.push(gte(hostels.price, parseInt(minPrice)))
    }

    const maxPrice = searchParams.get('maxPrice')
    if (maxPrice) {
      filters.push(lte(hostels.price, parseInt(maxPrice)))
    }

    const roomType = searchParams.get('roomType')
    if (roomType) {
      filters.push(eq(hostels.roomType, roomType as any))
    }

    const availability = searchParams.get('availability')
    if (availability !== null) {
      filters.push(eq(hostels.availability, availability === 'true'))
    }

    const search = searchParams.get('search')
    if (search) {
      filters.push(ilike(hostels.title, `%${search}%`))
    }

    if (filters.length > 0) {
      query = query.where(and(...filters))
    }

    const result = await query

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