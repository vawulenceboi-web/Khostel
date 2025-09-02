import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20

    console.log('👥 Fetching verified agents...')

    // Get all verified agents with their public information
    const { data: agents, error } = await db.supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        profile_image_url,
        face_photo_url,
        verified_status,
        face_verification_status,
        created_at
      `)
      .eq('role', 'agent')
      .eq('verified_status', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching agents:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch agents' },
        { status: 500 }
      )
    }

    // Get hostel counts for each agent
    const agentsWithStats = await Promise.all(
      (agents || []).map(async (agent) => {
        const { data: hostels } = await db.supabase
          .from('hostels')
          .select('id, availability, created_at')
          .eq('agent_id', agent.id)
          .eq('status', 'published')

        const hostelCount = hostels?.length || 0
        const availableCount = hostels?.filter(h => h.availability).length || 0
        const recentCount = hostels?.filter(h => {
          const createdAt = new Date(h.created_at)
          const daysDiff = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 7
        }).length || 0

        return {
          id: agent.id,
          firstName: agent.first_name,
          lastName: agent.last_name,
          fullName: `${agent.first_name} ${agent.last_name || ''}`.trim(),
          email: agent.email,
          phone: agent.phone,
          address: agent.address,
          profileImage: agent.profile_image_url,
          facePhoto: agent.face_photo_url,
          isVerified: agent.verified_status,
          isFaceVerified: agent.face_verification_status === 'approved',
          joinedDate: agent.created_at,
          stats: {
            totalListings: hostelCount,
            availableListings: availableCount,
            recentListings: recentCount
          }
        }
      })
    )

    console.log(`✅ Found ${agentsWithStats.length} verified agents`)

    return NextResponse.json({
      success: true,
      data: agentsWithStats,
      total: agentsWithStats.length
    })

  } catch (error) {
    console.error('❌ Agents API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}