import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getCurrentUser } from '@/lib/session'


export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('👤 Fetching fresh profile data for:', session.email)

    // Get fresh user data from the Supabase auth session
    const { data: { user }, error: authError } = await db.supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Error fetching user profile:', authError)
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }

    console.log('✅ Fresh profile data loaded:', {
      email: user.email,
      hasProfileImage: !!user.user_metadata?.profile_image_url,
      hasFacePhoto: !!user.user_metadata?.face_photo_url,
      profileImageUrl: user.user_metadata?.profile_image_url
    })

    // Return fresh user data
    const profileData = {
      id: user.id,
      email: user.email,
      name: `${user.user_metadata?.first_name} ${user.user_metadata?.last_name || ''}`.trim(),
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      phone: user.phone || user.user_metadata?.phone,
      address: user.user_metadata?.address,
      profileImage: user.user_metadata?.profile_image_url,
      facePhoto: user.user_metadata?.face_photo_url,
      role: user.user_metadata?.role || 'student',
      verifiedStatus: user.user_metadata?.verified_status || false,
      faceVerificationStatus: user.user_metadata?.face_verification_status || false,
      schoolId: user.user_metadata?.school_id,
      lastUpdated: user.updated_at
    }

    return NextResponse.json({
      success: true,
      data: profileData
    })

  } catch (error) {
    console.error('❌ Profile fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}