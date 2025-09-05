import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const agentId = params.agentId

    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      )
    }

    console.log('👤 Fetching agent profile:', agentId)

    // Get agent public information (only safe, public data)
    const { data: agent, error: agentError } = await db.supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        business_reg_number,
        profile_image_url,
        face_photo_url,
        verified_status,
        banned,
        face_verification_status,
        created_at
      `)
      .eq('id', agentId)
      .eq('role', 'agent')
      .eq('verified_status', true) // Only show verified agents
      .neq('banned', true) // Don't show banned agents
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, message: 'Verified agent not found' },
        { status: 404 }
      )
    }

    // Get agent's hostel listings
    const { data: hostels, error: hostelsError } = await db.supabase
      .from('hostels')
      .select(`
        id,
        title,
        description,
        price,
        price_type,
        room_type,
        images,
        media_urls,
        media_types,
        amenities,
        availability,
        address,
        created_at,
        last_updated,
        location:locations(id, name, latitude, longitude)
      `)
      .eq('agent_id', agentId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (hostelsError) {
      console.error('❌ Error fetching agent hostels:', hostelsError)
      // Don't fail the request, just return empty hostels
    }

    console.log('🏠 Hostels query result:', hostels?.length || 0, 'hostels found for agent:', agentId)
    console.log('🔍 First hostel (if any):', hostels?.[0])

    // Calculate profile stats
    const hostelsData = hostels || []
    const profileStats = {
      totalListings: hostelsData.length,
      availableListings: hostelsData.filter(h => h.availability).length,
      averagePrice: hostelsData.length > 0 
        ? Math.round(hostelsData.reduce((sum, h) => sum + h.price, 0) / hostelsData.length)
        : 0,
      locations: [...new Set(hostelsData.map(h => h.location?.name).filter(Boolean))],
      hasVideo: hostelsData.some(h => h.media_types?.includes('video')),
      joinedDate: agent.created_at
    }

    // Prepare safe public agent data
    const publicAgentData = {
      id: agent.id,
      firstName: agent.first_name,
      lastName: agent.last_name,
      fullName: `${agent.first_name} ${agent.last_name || ''}`.trim(),
      email: agent.email,
      phone: agent.phone,
      address: agent.address,
      cacNumber: agent.business_reg_number,
      profileImage: agent.profile_image_url,
      facePhoto: agent.face_photo_url,
      isVerified: agent.verified_status,
      isFaceVerified: agent.face_verification_status === 'approved',
      joinedDate: agent.created_at,
      stats: profileStats,
      hostels: hostelsData.map(hostel => ({
        id: hostel.id,
        title: hostel.title,
        description: hostel.description,
        price: hostel.price,
        priceType: hostel.price_type,
        roomType: hostel.room_type,
        images: hostel.images || [],
        mediaUrls: hostel.media_urls || [],
        mediaTypes: hostel.media_types || [],
        amenities: hostel.amenities || [],
        availability: hostel.availability,
        address: hostel.address,
        createdAt: hostel.created_at,
        lastUpdated: hostel.last_updated,
        location: hostel.location,
        // Calculate time ago
        timeAgo: calculateTimeAgo(hostel.created_at),
        isNew: isWithinLast24Hours(hostel.created_at)
      }))
    }

    // Get agent ratings using your method
    const { data: ratingsData } = await db.supabase
      .from('ratings')
      .select('stars')
      .eq('agent_id', agentId)

    const avgRating = ratingsData && ratingsData.length > 0 
      ? Number((ratingsData.reduce((sum, r) => sum + r.stars, 0) / ratingsData.length).toFixed(1))
      : 0

    const finalAgentData = {
      ...publicAgentData,
      avg_rating: avgRating,
      total_reviews: ratingsData?.length || 0
    }

    console.log(`✅ Agent profile loaded: ${finalAgentData.fullName} with ${hostelsData.length} listings, ${avgRating} avg rating`)

    return NextResponse.json({
      success: true,
      data: finalAgentData
    })

  } catch (error) {
    console.error('❌ Agent profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load agent profile' },
      { status: 500 }
    )
  }
}

// Helper functions for time calculations
function calculateTimeAgo(dateString: string): string {
  if (!dateString) return 'Unknown'
  
  try {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    return `${Math.floor(diffInSeconds / 31536000)}y ago`
  } catch (error) {
    return 'Unknown'
  }
}

function isWithinLast24Hours(dateString: string): boolean {
  if (!dateString) return false
  
  try {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24
  } catch (error) {
    return false
  }
}