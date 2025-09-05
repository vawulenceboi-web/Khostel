import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import { z } from 'zod'

export const runtime = 'nodejs'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

const resetPasswordSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)
    
    console.log('🔑 Processing password reset...')

    // Update password using Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: validatedData.newPassword
    })

    if (error) {
      console.error('❌ Error updating password:', error.message)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    console.log('✅ Password updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in with your new password.'
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