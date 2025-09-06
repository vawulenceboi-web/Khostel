export const runtime = 'nodejs';
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

    // Get fresh user data from custom table (maintains existing dashboard functionality)
    console.log('👤 Fetching user from custom table for session email:', session.email)
    const customUser = await db.users.findByEmail(session.email)

    if (!customUser) {
      console.error('❌ User not found in custom table:', session.email)
      return NextResponse.json(
        { success: false, message: 'User profile not found in database' },
        { status: 404 }
      )
    }

    console.log('✅ Custom table user found:', {
      id: customUser.id,
      email: customUser.email,
      role: customUser.role,
      verifiedStatus: customUser.verified_status,
      hasProfileImage: !!customUser.profile_image_url,
      hasFacePhoto: !!customUser.face_photo_url,
      averageRating: customUser.average_rating,
      totalRatings: customUser.total_ratings
    })

    // Return user data from custom table (maintains all existing dashboard features)
    const profileData = {
      id: customUser.id,
      email: customUser.email,
      name: `${customUser.first_name} ${customUser.last_name || ''}`.trim(),
      firstName: customUser.first_name,
      lastName: customUser.last_name,
      phone: customUser.phone,
      address: customUser.address,
      profileImage: customUser.profile_image_url,
      facePhoto: customUser.face_photo_url,
      role: customUser.role,
      verifiedStatus: customUser.verified_status,
      emailVerified: customUser.email_verified,
      schoolId: customUser.school_id,
      businessRegNumber: customUser.business_reg_number,
      termsAccepted: customUser.terms_accepted,
      banned: customUser.banned,
      averageRating: customUser.average_rating,
      totalRatings: customUser.total_ratings,
      faceVerificationStatus: customUser.face_verification_status,
      profileCompletenessScore: customUser.profile_completeness_score,
      trustLevel: customUser.trust_level,
      lastUpdated: customUser.updated_at,
      createdAt: customUser.created_at
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