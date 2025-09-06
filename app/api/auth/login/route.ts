export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  console.log('🔐 LOGIN API DEBUG: ===== LOGIN REQUEST STARTED =====')
  console.log('🔐 LOGIN API DEBUG: Timestamp:', new Date().toISOString())
  console.log('🔐 LOGIN API DEBUG: Environment check:')
  console.log('🔐 LOGIN API DEBUG: - NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔐 LOGIN API DEBUG: - NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('🔐 LOGIN API DEBUG: - NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('🔐 LOGIN API DEBUG: - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...')
  }

  try {
    const body = await request.json()
    console.log('🔐 LOGIN API DEBUG: Request body received')
    console.log('🔐 LOGIN API DEBUG: Email:', body.email)
    console.log('🔐 LOGIN API DEBUG: Password length:', body.password?.length || 0)
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    console.log('✅ LOGIN API DEBUG: Input validation passed')

    console.log('🔐 LOGIN API DEBUG: Calling supabase.auth.signInWithPassword...')
    console.log('🔐 LOGIN API DEBUG: Email being used:', validatedData.email)
    console.log('🔐 LOGIN API DEBUG: Password length:', validatedData.password.length)
    
    const startTime = Date.now()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    const endTime = Date.now()
    console.log('🔐 LOGIN API DEBUG: Supabase call completed in', endTime - startTime, 'ms')
    console.log('🔐 LOGIN API DEBUG: Response data present:', !!data)
    console.log('🔐 LOGIN API DEBUG: Response error present:', !!error)
    console.log('🔐 LOGIN API DEBUG: Raw response data:', JSON.stringify(data, null, 2))
    console.log('🔐 LOGIN API DEBUG: Raw response error:', JSON.stringify(error, null, 2))
    
    if (data) {
      console.log('🔐 LOGIN API DEBUG: Data details:')
      console.log('🔐 LOGIN API DEBUG: - User present:', !!data.user)
      console.log('🔐 LOGIN API DEBUG: - Session present:', !!data.session)
      
      if (data.user) {
        console.log('🔐 LOGIN API DEBUG: - User ID:', data.user.id)
        console.log('🔐 LOGIN API DEBUG: - User email:', data.user.email)
        console.log('🔐 LOGIN API DEBUG: - User email verified:', data.user.email_confirmed_at ? 'Yes' : 'No')
        console.log('🔐 LOGIN API DEBUG: - User metadata:', JSON.stringify(data.user.user_metadata))
      }
      
      if (data.session) {
        console.log('🔐 LOGIN API DEBUG: - Session access token length:', data.session.access_token.length)
        console.log('🔐 LOGIN API DEBUG: - Session expires at:', data.session.expires_at)
      }
    }

    if (error) {
      console.error('❌ LOGIN API ERROR: Supabase authentication failed')
      console.error('❌ LOGIN API ERROR: Error name:', error.name)
      console.error('❌ LOGIN API ERROR: Error message:', error.message)
      console.error('❌ LOGIN API ERROR: Error status:', error.status)
      console.error('❌ LOGIN API ERROR: Full error object:', JSON.stringify(error, null, 2))
      
      // Additional debugging for invalid credentials
      if (error.message.includes('Invalid login credentials')) {
        console.log('🔍 LOGIN API DEBUG: Checking if user exists in Supabase Auth...')
        
        try {
          // Try to send a password reset to see if user exists (safer than admin API)
          console.log('🔍 LOGIN API DEBUG: Testing if user exists by attempting password reset...')
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
          })
          
          if (!resetError) {
            console.log('🔍 LOGIN API DEBUG: Password reset succeeded - user exists')
            console.log('❌ LOGIN API DEBUG: User exists but login failed')
            console.log('🔍 LOGIN API DEBUG: This might be an old user created when email confirmation was enabled')
            return NextResponse.json(
              { 
                success: false, 
                message: 'Login failed. This might be an old account that needs verification. Try using the password reset to verify your account, or contact support.',
                errorCode: 'invalid_credentials_user_exists',
                userExists: true,
                suggestion: 'Use password reset to verify your account, or check if password is correct'
              },
              { status: 400 }
            )
          } else {
            console.log('🔍 LOGIN API DEBUG: Password reset failed:', resetError.message)
            if (resetError.message.includes('User not found') || resetError.message.includes('Invalid email')) {
              console.log('❌ LOGIN API DEBUG: User does not exist')
              return NextResponse.json(
                { 
                  success: false, 
                  message: 'No account found with this email address. Please sign up first.',
                  errorCode: 'user_not_found',
                  userExists: false
                },
                { status: 400 }
              )
            } else {
              console.log('🔍 LOGIN API DEBUG: Reset failed for other reason - user might exist')
              console.log('❌ LOGIN API DEBUG: Assuming user exists but credentials are wrong')
            }
          }
        } catch (debugError) {
          console.error('❌ LOGIN API DEBUG ERROR:', debugError)
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: error.message,
          errorCode: error.status,
          errorName: error.name
        },
        { status: 400 }
      )
    }

    if (!data.user || !data.session) {
      console.error('❌ LOGIN API ERROR: No user or session in successful response')
      console.error('❌ LOGIN API ERROR: Data user present:', !!data?.user)
      console.error('❌ LOGIN API ERROR: Data session present:', !!data?.session)
      
      return NextResponse.json(
        { success: false, message: 'Authentication failed - no user data' },
        { status: 400 }
      )
    }

    console.log('✅ LOGIN API SUCCESS: User authenticated successfully')
    console.log('✅ LOGIN API SUCCESS: User ID:', data.user.id)
    console.log('✅ LOGIN API SUCCESS: Login completed at:', new Date().toISOString())
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        emailVerified: !!data.user.email_confirmed_at,
        metadata: data.user.user_metadata
      },
      session: {
        accessToken: data.session.access_token.substring(0, 20) + '...',
        expiresAt: data.session.expires_at
      }
    })

  } catch (error) {
    console.error('❌ LOGIN API EXCEPTION: Unexpected error occurred')
    console.error('❌ LOGIN API EXCEPTION: Error type:', typeof error)
    console.error('❌ LOGIN API EXCEPTION: Error name:', (error as Error).name)
    console.error('❌ LOGIN API EXCEPTION: Error message:', (error as Error).message)
    console.error('❌ LOGIN API EXCEPTION: Error stack:', (error as Error).stack)
    
    if (error instanceof z.ZodError) {
      console.error('❌ LOGIN API VALIDATION ERROR: Zod validation failed')
      console.error('❌ LOGIN API VALIDATION ERROR: Issues:', error.issues)
      
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
    console.log('🔐 LOGIN API DEBUG: ===== LOGIN REQUEST COMPLETED =====')
  }
}