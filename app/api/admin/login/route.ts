export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { validateAdminCredentials, createAdminSession, getAdminEmail } from '@/lib/adminAuth'

import { adminLoginSchema } from '@/lib/schema'

import { cookies } from 'next/headers'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = adminLoginSchema.parse(body)
    
    console.log('🔐 Admin login attempt for:', validatedData.email)

    // Validate admin credentials
    console.log('🔐 Validating credentials for:', validatedData.email)
    const isValid = await validateAdminCredentials(
      validatedData.email, 
      validatedData.password
    )

    if (!isValid) {
      console.log('❌ Invalid admin credentials for:', validatedData.email)
      return NextResponse.json(
        { success: false, message: 'Invalid admin email or password' },
        { status: 401 }
      )
    }

    // Create admin session
    const adminSession = createAdminSession()
    
    // Set admin session cookie (secure, httpOnly) - extended duration
    const cookieStore = cookies()
    cookieStore.set('admin-session', JSON.stringify(adminSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours (longer session)
      path: '/', // Available site-wide, not just /admin
    })

    console.log('✅ Admin login successful:', adminSession.email)

    return NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        email: adminSession.email,
        role: adminSession.role
      }
    })

  } catch (error) {
    console.error('❌ Admin login error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Admin login failed' },
      { status: 500 }
    )
  }
}