export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { registerUserSchema } from '@/lib/schema'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'


export async function POST(request: NextRequest) {
  console.log('📝 REGISTER API: ===== REGISTRATION REQUEST STARTED =====')
  console.log('📝 REGISTER API: Timestamp:', new Date().toISOString())
  console.log('📝 REGISTER API: Request headers:', JSON.stringify({
    host: request.headers.get('host'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    'user-agent': request.headers.get('user-agent')?.substring(0, 50) + '...'
  }, null, 2))
  console.log('📝 REGISTER API: Environment check:')
  console.log('📝 REGISTER API: - NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('📝 REGISTER API: - NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('📝 REGISTER API: - NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('📝 REGISTER API: - VERCEL_URL:', process.env.VERCEL_URL)
  console.log('📝 REGISTER API: - NODE_ENV:', process.env.NODE_ENV)
  
  try {
    const body = await request.json()
    console.log('📝 REGISTER API: Request body received')
    console.log('📝 REGISTER API: Email:', body.email)
    console.log('📝 REGISTER API: Role:', body.role)
    console.log('📝 REGISTER API: First name:', body.firstName)
    console.log('📝 REGISTER API: Password length:', body.password?.length || 0)
    
    // Validate input
    const validatedData = registerUserSchema.parse(body)
    console.log('✅ REGISTER API: Input validation passed')
    console.log('✅ REGISTER API: Validated role:', validatedData.role)
    console.log('✅ REGISTER API: Terms accepted:', validatedData.termsAccepted)

    const emailRedirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    console.log('📝 REGISTER API: Email redirect URL:', emailRedirectUrl)

    // Check for existing user first
    console.log('🔍 REGISTER API: Checking for existing user...')
    try {
      const existingUser = await db.users.findByEmail(validatedData.email)
      if (existingUser) {
        console.log('❌ REGISTER API ERROR: User already exists in custom table:', existingUser.id)
        return NextResponse.json(
          { 
            success: false, 
            message: 'An account with this email already exists. Please try signing in instead.',
            errorCode: 'user_already_exists'
          },
          { status: 400 }
        )
      }
      console.log('✅ REGISTER API: No existing user found, proceeding with registration')
    } catch (checkError) {
      console.log('⚠️ REGISTER API: Could not check for existing user:', checkError)
      // Continue with registration anyway
    }

    // Register user with Supabase Auth using OTP verification
    console.log('📝 REGISTER API: Calling supabase.auth.signUp with OTP...')
    const startTime = Date.now()
    
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: undefined, // Explicitly disable email redirect
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName || null,
          phone: validatedData.phone || null,
          role: validatedData.role,
          school_id: validatedData.schoolId || null,
          business_reg_number: validatedData.businessRegNumber || null,
          address: validatedData.address || null,
          profile_image_url: validatedData.profileImageUrl || null,
          terms_accepted: validatedData.termsAccepted,
          terms_accepted_at: new Date().toISOString(),
          // Students get immediate access after OTP, agents need admin approval
          verified_status: validatedData.role === 'student' ? true : false,
          dashboard_access: validatedData.role === 'student' ? true : false,
          pending_approval: validatedData.role === 'agent' ? true : false,
        }
      }
    })

    const endTime = Date.now()
    console.log('📝 REGISTER API: Supabase call completed in', endTime - startTime, 'ms')
    console.log('📝 REGISTER API: Response data present:', !!data)
    console.log('📝 REGISTER API: Response error present:', !!error)

    if (data) {
      console.log('📝 REGISTER API: Data details:')
      console.log('📝 REGISTER API: - User present:', !!data.user)
      console.log('📝 REGISTER API: - Session present:', !!data.session)
      
      if (data.user) {
        console.log('📝 REGISTER API: - User ID:', data.user.id)
        console.log('📝 REGISTER API: - User email:', data.user.email)
        console.log('📝 REGISTER API: - Email confirmed at:', data.user.email_confirmed_at)
        console.log('📝 REGISTER API: - User metadata:', JSON.stringify(data.user.user_metadata))
        console.log('📝 REGISTER API: - Created at:', data.user.created_at)
      }
    }

    if (error) {
      console.error('❌ REGISTER API ERROR: Supabase registration failed')
      console.error('❌ REGISTER API ERROR: Error name:', error.name)
      console.error('❌ REGISTER API ERROR: Error message:', error.message)
      console.error('❌ REGISTER API ERROR: Error status:', error.status)
      console.error('❌ REGISTER API ERROR: Full error:', JSON.stringify(error, null, 2))
      
      // Check for specific error types
      if (error.message.includes('already registered')) {
        console.error('❌ REGISTER API ERROR: User already exists')
      }
      if (error.message.includes('email')) {
        console.error('❌ REGISTER API ERROR: Email-related error')
        console.error('❌ REGISTER API ERROR: This might be SMTP/domain configuration issue')
        console.error('❌ REGISTER API ERROR: Check Supabase SMTP settings and site URL')
      }
      if (error.message.includes('confirmation')) {
        console.error('❌ REGISTER API ERROR: Email confirmation error - likely SMTP issue')
      }
      if (error.message.includes('SMTP')) {
        console.error('❌ REGISTER API ERROR: SMTP configuration error detected')
      }
      
      return NextResponse.json(
        { success: false, message: error.message, errorCode: error.status },
        { status: 400 }
      )
    }

    if (!data.user) {
      console.error('❌ REGISTER API ERROR: No user in successful response')
      console.error('❌ REGISTER API ERROR: Data object:', JSON.stringify(data, null, 2))
      return NextResponse.json(
        { success: false, message: 'Registration failed - no user data returned from Supabase' },
        { status: 400 }
      )
    }

    // User creation successful - we have the user data from the response
    console.log('✅ REGISTER API: User creation confirmed from response data')
    console.log('✅ REGISTER API: User ID:', data.user.id)
    console.log('✅ REGISTER API: User email:', data.user.email)

    const userRole = data.user?.user_metadata?.role || 'student'
    const isStudent = userRole === 'student'
    const requiresOtp = !data.session
    
    console.log('✅ REGISTER API SUCCESS: User created in Supabase Auth')
    console.log('✅ REGISTER API SUCCESS: User ID:', data.user.id)
    console.log('✅ REGISTER API SUCCESS: User role:', userRole)
    console.log('✅ REGISTER API SUCCESS: OTP verification required:', requiresOtp)
    console.log('✅ REGISTER API SUCCESS: Is student:', isStudent)

    // Now create user in custom table to maintain existing dashboard functionality
    console.log('📝 REGISTER API: Creating user in custom table...')
    console.log('📝 REGISTER API: Custom table data to insert:', {
      id: data.user.id,
      email: validatedData.email,
      role: validatedData.role,
      verified_status: validatedData.role === 'student' ? true : false
    })
    
    try {
      const customTableData = {
        id: data.user.id, // Use same ID as Supabase Auth
        email: validatedData.email,
        password_hash: 'supabase-auth', // Placeholder since auth is handled by Supabase
        first_name: validatedData.firstName,
        last_name: validatedData.lastName || null,
        phone: validatedData.phone || null,
        role: validatedData.role,
        school_id: validatedData.schoolId || null,
        business_reg_number: validatedData.businessRegNumber || null,
        address: validatedData.address || null,
        profile_image_url: validatedData.profileImageUrl || null,
        terms_accepted: validatedData.termsAccepted,
        terms_accepted_at: new Date().toISOString(),
        verified_status: validatedData.role === 'student' ? true : false,
        email_verified: true, // Will be verified via OTP
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add missing fields with defaults
        verification_attempts: 0,
        face_verification_status: 'pending',
        profile_completeness_score: 0,
        trust_level: 'basic',
        banned: false,
        average_rating: 0.0,
        total_ratings: 0
      }
      
      console.log('📝 REGISTER API: Attempting custom table insert...')
      const { data: customUser, error: customError } = await db.supabase
        .from('users')
        .insert(customTableData)
        .select()
        .single()

      if (customError) {
        console.error('❌ REGISTER API ERROR: Failed to create user in custom table:', customError)
        console.error('❌ REGISTER API ERROR: Custom table error details:', JSON.stringify(customError, null, 2))
        
        // This is critical - if custom table fails, the dashboard won't work
        // So we should fail the registration
        return NextResponse.json(
          { 
            success: false, 
            message: 'Registration failed: Could not create user profile. ' + customError.message,
            errorCode: 'custom_table_insert_failed',
            details: customError
          },
          { status: 500 }
        )
      } else {
        console.log('✅ REGISTER API SUCCESS: User created in custom table:', customUser?.id)
      }
    } catch (customTableError) {
      console.error('❌ REGISTER API EXCEPTION: Custom table creation failed:', customTableError)
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Registration failed: Database error during user creation.',
          errorCode: 'custom_table_exception',
          details: (customTableError as Error).message
        },
        { status: 500 }
      )
    }

    console.log('✅ REGISTER API SUCCESS: Registration completed at:', new Date().toISOString())
    
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userRole,
        emailConfirmed: !!data.user.email_confirmed_at,
        metadata: data.user.user_metadata
      },
      session: !!data.session,
      message: requiresOtp 
        ? `Registration successful! Please check your email for the OTP code to verify your account.`
        : `Registration successful! You can now sign in.`,
      nextStep: requiresOtp ? 'otp_verification' : 'login',
      otpRequired: requiresOtp,
      userRole: userRole,
      debug: {
        userId: data.user.id,
        role: userRole,
        otpRequired: requiresOtp,
        isStudent: isStudent,
        timestamp: new Date().toISOString()
      }
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('❌ Registration error:', error)
    
    if (error instanceof Error) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid input data',
            details: (error as any).issues
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}