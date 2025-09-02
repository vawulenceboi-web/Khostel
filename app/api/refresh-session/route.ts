import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🔄 Refreshing session data for:', session.user.email)

    // Get updated user data from database
    const { data: updatedUser, error } = await db.supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        address,
        profile_image_url,
        face_photo_url,
        role,
        verified_status,
        school_id
      `)
      .eq('id', session.user.id)
      .single()

    if (error || !updatedUser) {
      console.error('❌ Error fetching updated user data:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to refresh session' },
        { status: 500 }
      )
    }

    // Return updated user data for client-side session update
    const refreshedUserData = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: `${updatedUser.first_name} ${updatedUser.last_name || ''}`.trim(),
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      profileImage: updatedUser.profile_image_url,
      facePhoto: updatedUser.face_photo_url,
      role: updatedUser.role,
      verifiedStatus: updatedUser.verified_status,
      schoolId: updatedUser.school_id
    }

    console.log('✅ Session data refreshed successfully')

    return NextResponse.json({
      success: true,
      data: refreshedUserData,
      message: 'Session refreshed successfully'
    })

  } catch (error) {
    console.error('❌ Session refresh error:', error)
    return NextResponse.json(
      { success: false, message: 'Session refresh failed' },
      { status: 500 }
    )
  }
}