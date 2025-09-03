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

    // Add rating data to each hostel's agent using your method
    const hostelsWithRatings = await Promise.all(
      result.map(async (hostel) => {
        if (hostel.agent?.id) {
          // Get ratings for this agent
          const { data: ratings } = await db.supabase
            .from('ratings')
            .select('stars')
            .eq('agent_id', hostel.agent.id)

          if (ratings && ratings.length > 0) {
            const avgRating = Number((ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1))
            hostel.agent.average_rating = avgRating
            hostel.agent.total_ratings = ratings.length
          } else {
            hostel.agent.average_rating = 0
            hostel.agent.total_ratings = 0
          }
        }
        return hostel
      })
    )

    console.log('🔍 First hostel with rating:', hostelsWithRatings[0]?.agent)

    return NextResponse.json({
      success: true,
      data: hostelsWithRatings
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
    
    // Create hostel using Supabase client
    const hostelData = {
      title: body.title,
      description: body.description || null,
      price: parseFloat(body.price),
      price_type: body.priceType || 'semester',
      room_type: body.roomType || 'single',
      location_id: body.locationId,
      agent_id: session.user.id,
      images: body.mediaUrls || body.images || [],
      amenities: body.amenities || [],
      address: body.address || null,
      availability: body.availability !== false,
      media_urls: body.mediaUrls || [],
      media_types: body.mediaTypes || [],
      status: 'published'
    }

    const { data: newHostel, error } = await db.supabase
      .from('hostels')
      .insert(hostelData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating hostel:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create hostel listing' },
        { status: 500 }
      )
    }

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