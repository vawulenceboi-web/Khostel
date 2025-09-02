import { NextRequest, NextResponse } from 'next/server'
import { validateAdminCredentials, createAdminSession, getAdminEmail } from '@/lib/adminAuth'
import { adminLoginSchema } from '@/lib/schema'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = adminLoginSchema.parse(body)
    
    console.log('🔐 Admin login attempt for:', validatedData.username)

    // Validate admin credentials
    const isValid = await validateAdminCredentials(
      validatedData.username, 
      validatedData.password
    )

    if (!isValid) {
      console.log('❌ Invalid admin credentials')
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Create admin session
    const adminSession = createAdminSession()
    
    // Set admin session cookie (secure, httpOnly)
    const cookieStore = cookies()
    cookieStore.set('admin-session', JSON.stringify(adminSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/admin'
    })

    console.log('✅ Admin login successful:', adminSession.email)

    return NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        email: adminSession.email,
        username: adminSession.username,
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