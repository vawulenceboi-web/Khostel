export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
  type: z.enum(['signup', 'email_change']).default('signup')
})

export async function POST(request: NextRequest) {
  console.log('🔐 VERIFY OTP API: ===== OTP VERIFICATION STARTED =====')
  console.log('🔐 VERIFY OTP API: Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('🔐 VERIFY OTP API: Request body received')
    console.log('🔐 VERIFY OTP API: Email:', body.email)
    console.log('🔐 VERIFY OTP API: Token length:', body.token?.length || 0)
    console.log('🔐 VERIFY OTP API: Type:', body.type)
    
    const validatedData = verifyOtpSchema.parse(body)
    console.log('✅ VERIFY OTP API: Input validation passed')

    console.log('🔐 VERIFY OTP API: Calling supabase.auth.verifyOtp...')
    const startTime = Date.now()
    
    const { data, error } = await supabase.auth.verifyOtp({
      email: validatedData.email,
      token: validatedData.token,
      type: validatedData.type
    })

    const endTime = Date.now()
    console.log('🔐 VERIFY OTP API: Supabase call completed in', endTime - startTime, 'ms')
    console.log('🔐 VERIFY OTP API: Response data present:', !!data)
    console.log('🔐 VERIFY OTP API: Response error present:', !!error)

    if (data) {
      console.log('🔐 VERIFY OTP API: Data details:')
      console.log('🔐 VERIFY OTP API: - User present:', !!data.user)
      console.log('🔐 VERIFY OTP API: - Session present:', !!data.session)
      
      if (data.user) {
        console.log('🔐 VERIFY OTP API: - User ID:', data.user.id)
        console.log('🔐 VERIFY OTP API: - User email:', data.user.email)
        console.log('🔐 VERIFY OTP API: - User role:', data.user.user_metadata?.role)
        console.log('🔐 VERIFY OTP API: - Email confirmed:', !!data.user.email_confirmed_at)
      }
    }

    if (error) {
      console.error('❌ VERIFY OTP API ERROR: OTP verification failed')
      console.error('❌ VERIFY OTP API ERROR: Error name:', error.name)
      console.error('❌ VERIFY OTP API ERROR: Error message:', error.message)
      console.error('❌ VERIFY OTP API ERROR: Error status:', error.status)
      console.error('❌ VERIFY OTP API ERROR: Full error:', JSON.stringify(error, null, 2))
      
      // Handle specific OTP errors
      if (error.message.includes('Invalid token')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid OTP code. Please check and try again.',
            errorCode: 'invalid_otp'
          },
          { status: 400 }
        )
      } else if (error.message.includes('expired')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'OTP code has expired. Please request a new one.',
            errorCode: 'expired_otp'
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: error.message,
          errorCode: error.status
        },
        { status: 400 }
      )
    }

    if (!data.user || !data.session) {
      console.error('❌ VERIFY OTP API ERROR: No user or session in successful response')
      return NextResponse.json(
        { success: false, message: 'OTP verification failed - no user data' },
        { status: 400 }
      )
    }

    // Check user role to determine next steps
    const userRole = data.user.user_metadata?.role || 'student'
    const isStudent = userRole === 'student'
    const isAgent = userRole === 'agent'

    console.log('✅ VERIFY OTP API SUCCESS: OTP verified successfully')
    console.log('✅ VERIFY OTP API SUCCESS: User ID:', data.user.id)
    console.log('✅ VERIFY OTP API SUCCESS: User role:', userRole)
    console.log('✅ VERIFY OTP API SUCCESS: Is student:', isStudent)
    console.log('✅ VERIFY OTP API SUCCESS: Is agent:', isAgent)

    return NextResponse.json({
      success: true,
      message: isStudent 
        ? 'Account verified! You can now access your dashboard.' 
        : 'Account verified! Your agent application is pending admin approval.',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userRole,
        emailConfirmed: true,
        metadata: data.user.user_metadata
      },
      session: {
        accessToken: data.session.access_token.substring(0, 20) + '...',
        expiresAt: data.session.expires_at
      },
      nextStep: isStudent ? 'dashboard' : 'pending_approval',
      dashboardAccess: isStudent,
      debug: {
        userId: data.user.id,
        role: userRole,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ VERIFY OTP API EXCEPTION:', error)
    console.error('❌ VERIFY OTP API EXCEPTION Details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data',
          errors: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    console.log('🔐 VERIFY OTP API: ===== OTP VERIFICATION COMPLETED =====')
  }
}