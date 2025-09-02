import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('📊 Fetching public platform statistics...')

    // Get real counts from database for public display
    const [hostelsData, schoolsData] = await Promise.all([
      db.hostels.findAll(),
      db.schools.findAll()
    ])

    // Get user counts
    const { data: allUsers } = await db.supabase
      .from('users')
      .select('role')

    const stats = {
      totalHostels: hostelsData.length,
      availableHostels: hostelsData.filter(h => h.availability).length,
      totalUniversities: schoolsData.length,
      totalStudents: allUsers?.filter(u => u.role === 'student').length || 0,
      verifiedAgents: allUsers?.filter(u => u.role === 'agent').length || 0,
      totalUsers: allUsers?.length || 0,
    }

    console.log('✅ Public stats calculated:', stats)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('❌ Public stats error:', error)
    
    // Return fallback stats if database fails
    return NextResponse.json({
      success: true,
      data: {
        totalHostels: 4,
        availableHostels: 4,
        totalUniversities: 12,
        totalStudents: 1,
        verifiedAgents: 1,
        totalUsers: 3,
      }
    })
  }
}