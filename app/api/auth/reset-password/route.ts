export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { supabase } from '@/lib/supabase'


const resetPasswordSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  console.log('🔄 RESET PASSWORD API: ===== PASSWORD RESET STARTED =====')
  console.log('🔄 RESET PASSWORD API: Timestamp:', new Date().toISOString())
  console.log('🔄 RESET PASSWORD API: Environment check:')
  console.log('🔄 RESET PASSWORD API: - NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('🔄 RESET PASSWORD API: - SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  try {
    const body = await request.json()
    console.log('🔄 RESET PASSWORD API: Request body received')
    console.log('🔄 RESET PASSWORD API: Access token length:', body.accessToken?.length || 0)
    console.log('🔄 RESET PASSWORD API: Refresh token length:', body.refreshToken?.length || 0)
    console.log('🔄 RESET PASSWORD API: New password length:', body.newPassword?.length || 0)
    
    const validatedData = resetPasswordSchema.parse(body)
    console.log('✅ RESET PASSWORD API: Input validation passed')

    // First, set the session using the provided tokens
    console.log('🔄 RESET PASSWORD API: Setting session with provided tokens...')
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: validatedData.accessToken,
      refresh_token: validatedData.refreshToken
    })

    console.log('🔄 RESET PASSWORD API: Session setup response:')
    console.log('🔄 RESET PASSWORD API: - Session present:', !!sessionData.session)
    console.log('🔄 RESET PASSWORD API: - User present:', !!sessionData.user)
    console.log('🔄 RESET PASSWORD API: - Session error:', sessionError)

    if (sessionError || !sessionData.session) {
      console.error('❌ RESET PASSWORD API ERROR: Failed to establish session')
      console.error('❌ RESET PASSWORD API ERROR: Session error:', sessionError)
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset tokens' },
        { status: 400 }
      )
    }

    console.log('✅ RESET PASSWORD API: Session established successfully')
    console.log('✅ RESET PASSWORD API: User ID:', sessionData.user?.id)

    // Update password using Supabase Auth
    console.log('🔄 RESET PASSWORD API: Updating user password...')
    const startTime = Date.now()
    
    const { error } = await supabase.auth.updateUser({
      password: validatedData.newPassword
    })

    const endTime = Date.now()
    console.log('🔄 RESET PASSWORD API: Password update completed in', endTime - startTime, 'ms')
    console.log('🔄 RESET PASSWORD API: Update error present:', !!error)

    if (error) {
      console.error('❌ RESET PASSWORD API ERROR: Password update failed')
      console.error('❌ RESET PASSWORD API ERROR: Error name:', error.name)
      console.error('❌ RESET PASSWORD API ERROR: Error message:', error.message)
      console.error('❌ RESET PASSWORD API ERROR: Error status:', error.status)
      console.error('❌ RESET PASSWORD API ERROR: Full error:', JSON.stringify(error, null, 2))
      
      return NextResponse.json(
        { success: false, message: error.message, errorCode: error.status },
        { status: 400 }
      )
    }

    console.log('✅ RESET PASSWORD API SUCCESS: Password updated successfully')
    console.log('✅ RESET PASSWORD API SUCCESS: User ID:', sessionData.user?.id)
    console.log('✅ RESET PASSWORD API SUCCESS: Completed at:', new Date().toISOString())

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in with your new password.',
      debug: {
        userId: sessionData.user?.id,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}