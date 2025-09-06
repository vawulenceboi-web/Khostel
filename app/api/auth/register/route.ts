export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { registerUserSchema } from '@/lib/schema'

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

    // Register user with Supabase Auth using OTP verification
    console.log('📝 REGISTER API: Calling supabase.auth.signUp with OTP...')
    const startTime = Date.now()
    
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
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
        },
        // No email redirect needed for OTP flow
        emailRedirectTo: undefined
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
      return NextResponse.json(
        { success: false, message: 'Registration failed - no user data' },
        { status: 400 }
      )
    }

    const userRole = data.user?.user_metadata?.role || 'student'
    const isStudent = userRole === 'student'
    const requiresOtp = !data.session
    
    console.log('✅ REGISTER API SUCCESS: User registered successfully')
    console.log('✅ REGISTER API SUCCESS: User ID:', data.user.id)
    console.log('✅ REGISTER API SUCCESS: User role:', userRole)
    console.log('✅ REGISTER API SUCCESS: OTP verification required:', requiresOtp)
    console.log('✅ REGISTER API SUCCESS: Is student:', isStudent)
    console.log('✅ REGISTER API SUCCESS: Completed at:', new Date().toISOString())
    
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