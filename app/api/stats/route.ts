import { NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/lib/session'

import { db } from '@/lib/db'


interface Stats {
  totalHostels: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  availableHostels: number
  totalSchools: number
  myListings: number
  myBookingRequests: number
  pendingRequests: number
  totalUsers: number
  pendingAgents: number
  verifiedAgents: number
  totalStudents: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('📊 Fetching real-time stats for:', session.user.email)

    // Get real counts from database
    const [hostelsData, bookingsData, schoolsData] = await Promise.all([
      db.hostels.findAll(),
      db.bookings.findByUser(session.user.id, session.user.role),
      db.schools.findAll()
    ])

    // Calculate user-specific stats
    const userStats: Stats = {
      totalHostels: hostelsData.length,
      totalBookings: bookingsData.length,
      pendingBookings: bookingsData.filter(b => b.status === 'pending').length,
      confirmedBookings: bookingsData.filter(b => b.status === 'confirmed').length,
      availableHostels: hostelsData.filter(h => h.availability).length,
      totalSchools: schoolsData.length,
      myListings: 0,
      myBookingRequests: 0,
      pendingRequests: 0,
      totalUsers: 0,
      pendingAgents: 0,
      verifiedAgents: 0,
      totalStudents: 0
    }

    // Role-specific stats
    if (session.user.role === 'agent') {
      const agentHostels = hostelsData.filter(h => h.agent_id === session.user.id)
      const agentBookings = bookingsData.filter(b => 
        hostelsData.some(h => h.id === b.hostel_id && h.agent_id === session.user.id)
      )
      
      userStats.myListings = agentHostels.length
      userStats.myBookingRequests = agentBookings.length
      userStats.pendingRequests = agentBookings.filter(b => b.status === 'pending').length
    }

    if (session.user.role === 'admin') {
      // Get all users for admin stats
      const { data: allUsers } = await db.supabase
        .from('users')
        .select('role, verified_status')

      userStats.totalUsers = allUsers?.length || 0
      userStats.pendingAgents = allUsers?.filter(u => u.role === 'agent' && !u.verified_status).length || 0 
      userStats.verifiedAgents = allUsers?.filter(u => u.role === 'agent' && u.verified_status).length || 0
      userStats.totalStudents = allUsers?.filter(u => u.role === 'student').length || 0
    }

    return NextResponse.json({
      success: true,
      data: userStats,
      user: {
        role: session.user.role,
        verifiedStatus: session.user.verifiedStatus,
        name: session.user.firstName || session.user.name
      }
    })

  } catch (error) {
    console.error('❌ Stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}