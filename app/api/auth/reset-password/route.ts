import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  resetCode: z.string().min(6, 'Reset code must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)
    
    console.log('🔑 Password reset verification for:', validatedData.email)

    // Check if user exists and reset code is valid
    const { data: user, error } = await db.supabase
      .from('users')
      .select('id, email, first_name, reset_code, reset_code_expires')
      .eq('email', validatedData.email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or reset code' },
        { status: 400 }
      )
    }

    // Check if reset code matches
    if (user.reset_code !== validatedData.resetCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset code' },
        { status: 400 }
      )
    }

    // Check if reset code has expired
    if (!user.reset_code_expires || new Date() > new Date(user.reset_code_expires)) {
      return NextResponse.json(
        { success: false, message: 'Reset code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    console.log('✅ Reset code verified, updating password...')

    // Hash new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(validatedData.newPassword, saltRounds)

    // Update password and clear reset code
    const { error: updateError } = await db.supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_code: null,
        reset_code_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      )
    }

    console.log('✅ Password reset successfully for user:', user.id)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
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