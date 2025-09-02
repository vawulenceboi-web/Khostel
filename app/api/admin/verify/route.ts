import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const adminSessionCookie = cookieStore.get('admin-session')

    if (!adminSessionCookie) {
      return NextResponse.json(
        { success: false, message: 'No admin session found' },
        { status: 401 }
      )
    }

    const adminSession = JSON.parse(adminSessionCookie.value)
    
    // Check if session is valid (not expired)
    const loginTime = new Date(adminSession.loginTime)
    const now = new Date()
    const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLogin > 8) { // 8 hour session limit
      return NextResponse.json(
        { success: false, message: 'Admin session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        email: adminSession.email,
        role: adminSession.role
      }
    })

  } catch (error) {
    console.error('❌ Admin verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Invalid admin session' },
      { status: 401 }
    )
  }
}