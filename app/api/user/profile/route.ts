import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('👤 Fetching fresh profile data for:', session.user.email)

    // Get fresh user data from database (bypasses session cache)
    const { data: user, error } = await db.supabase
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
        face_verification_status,
        school_id,
        created_at,
        updated_at
      `)
      .eq('id', session.user.id)
      .single()

    if (error || !user) {
      console.error('❌ Error fetching user profile:', error)
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }

    console.log('✅ Fresh profile data loaded:', {
      email: user.email,
      hasProfileImage: !!user.profile_image_url,
      hasFacePhoto: !!user.face_photo_url,
      profileImageUrl: user.profile_image_url
    })

    // Return fresh user data
    const profileData = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      address: user.address,
      profileImage: user.profile_image_url,
      facePhoto: user.face_photo_url,
      role: user.role,
      verifiedStatus: user.verified_status,
      faceVerificationStatus: user.face_verification_status,
      schoolId: user.school_id,
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