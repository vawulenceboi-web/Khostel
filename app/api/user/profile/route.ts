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
    let customUser = await db.users.findByEmail(session.email)

    if (!customUser) {
      console.log('⚠️ User not found in custom table, creating from Supabase Auth data:', session.email)
      
      // Get user from Supabase Auth to create custom table entry
      const { data: { user: authUser }, error: authError } = await db.supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('❌ User not found in either system:', session.email)
        return NextResponse.json(
          { success: false, message: 'User profile not found in any system' },
          { status: 404 }
        )
      }

      console.log('✅ Found user in Supabase Auth, creating custom table entry...')
      console.log('👤 PROFILE API DEBUG: Auth user metadata:', JSON.stringify(authUser.user_metadata, null, 2))
      console.log('👤 PROFILE API DEBUG: Auth user role from metadata:', authUser.user_metadata?.role)
      console.log('👤 PROFILE API DEBUG: Auth user user_metadata:', JSON.stringify(authUser.user_metadata, null, 2))
      
      // Create user in custom table using Supabase Auth data
      try {
        const { data: newCustomUser, error: createError } = await db.supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            password_hash: 'supabase-auth', // Placeholder
            first_name: authUser.user_metadata?.first_name || 'User',
            last_name: authUser.user_metadata?.last_name || null,
            phone: authUser.phone || authUser.user_metadata?.phone || null,
            role: authUser.user_metadata?.role || 'student',
            school_id: authUser.user_metadata?.school_id || null,
            business_reg_number: authUser.user_metadata?.business_reg_number || null,
            address: authUser.user_metadata?.address || null,
            profile_image_url: authUser.user_metadata?.profile_image_url || null,
            face_photo_url: authUser.user_metadata?.face_photo_url || null,
            terms_accepted: authUser.user_metadata?.terms_accepted || true,
            terms_accepted_at: authUser.user_metadata?.terms_accepted_at || authUser.created_at,
            verified_status: authUser.user_metadata?.role === 'student' ? true : (authUser.user_metadata?.verified_status || false),
            email_verified: true,
            created_at: authUser.created_at,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Failed to create custom table entry:', createError)
          return NextResponse.json(
            { success: false, message: 'Failed to create user profile: ' + createError.message },
            { status: 500 }
          )
        }

        console.log('✅ Created custom table entry for user:', newCustomUser.email)
        customUser = newCustomUser
        
      } catch (createException) {
        console.error('❌ Exception creating custom table entry:', createException)
        return NextResponse.json(
          { success: false, message: 'Failed to initialize user profile' },
          { status: 500 }
        )
      }
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

    console.log('👤 PROFILE API DEBUG: Final role being returned:', customUser.role)
    console.log('👤 PROFILE API DEBUG: Verified status being returned:', customUser.verified_status)

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

    console.log('👤 PROFILE API DEBUG: Final profile data being returned:')
    console.log('👤 PROFILE API DEBUG: - Role:', profileData.role)
    console.log('👤 PROFILE API DEBUG: - Verified Status:', profileData.verifiedStatus)
    console.log('👤 PROFILE API DEBUG: - Email Verified:', profileData.emailVerified)

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