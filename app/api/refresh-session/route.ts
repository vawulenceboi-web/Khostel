import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getCurrentUser } from '@/lib/session'


export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('🔄 Refreshing session data for:', session.email)

    // Get updated user data from database
    const { data: updatedUser, error } = await db.supabase.auth.getUser()

    if (error || !updatedUser) {
      console.error('❌ Error fetching updated user data:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to refresh session' },
        { status: 500 }
      )
    }

    // Return updated user data for client-side session update
    const refreshedUserData = {
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      name: updatedUser.user.user_metadata?.name,
      firstName: updatedUser.user.user_metadata?.first_name,
      lastName: updatedUser.user.user_metadata?.last_name,
      phone: updatedUser.user.phone || updatedUser.user.user_metadata?.phone,
      address: updatedUser.user.user_metadata?.address,
      profileImage: updatedUser.user.user_metadata?.profile_image_url,
      facePhoto: updatedUser.user.user_metadata?.face_photo_url,
      role: updatedUser.user.user_metadata?.role || 'student',
      verifiedStatus: updatedUser.user.user_metadata?.verified_status || false,
      schoolId: updatedUser.user.user_metadata?.school_id
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