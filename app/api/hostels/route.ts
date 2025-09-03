import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    console.log('🏠 Fetching hostels with your filtering method...')
    
    const { searchParams } = new URL(req.url)
    
    // Your clean filtering method
    const q = searchParams.get("q") || ""
    const location = searchParams.get("location") || ""
    const maxPrice = parseInt(searchParams.get("priceMax") || "0")
    const roomType = searchParams.get("roomType") || ""
    const verified = searchParams.get("verified")

    console.log('🔍 Search params:', { q, location, maxPrice, roomType, verified })

    // Build Supabase query using your method
    let query = db.supabase
      .from('hostels')
      .select(`
        *,
        location:locations(id, name, latitude, longitude, school_id),
        agent:users(id, first_name, last_name, phone, verified_status, profile_image_url)
      `)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    // Apply location filter
    if (location) {
      query = query.eq('locations.name', location)
    }

    // Apply price filter
    if (maxPrice > 0) {
      query = query.lte('price_per_semester', maxPrice)
    }

    // Apply room type filter
    if (roomType) {
      query = query.eq('room_type', roomType)
    }

    // Apply verified agent filter
    if (verified === 'true') {
      query = query.eq('users.verified_status', true)
    } else if (verified === 'false') {
      query = query.eq('users.verified_status', false)
    }

    const { data: result, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch hostels' },
        { status: 500 }
      )
    }

    console.log('✅ Hostels fetched successfully:', result?.length || 0)

    // Add rating data to each hostel's agent using your method
    const hostelsWithRatings = await Promise.all(
      (result || []).map(async (hostel) => {
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

    const body = await request.json()
    console.log('📝 Creating hostel listing...')

    const hostelData = {
      title: body.title,
      description: body.description,
      price_per_semester: parseFloat(body.price),
      price_type: body.priceType || 'semester',
      room_type: body.roomType,
      location_id: body.locationId,
      address: body.address,
      amenities: body.amenities || [],
      media_urls: body.mediaUrls || [],
      media_types: body.mediaTypes || [],
      availability: body.availability !== false,
      agent_id: session.user.id,
      status: 'published',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }

    const { data, error } = await db.supabase
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

    console.log('✅ Hostel created successfully:', data.title)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Hostel listing created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create hostel error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}