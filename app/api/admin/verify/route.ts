export const runtime = 'nodejs';
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

    let adminSession
    try {
      adminSession = JSON.parse(adminSessionCookie.value)
    } catch (parseError) {
      console.error('❌ Failed to parse admin session:', parseError)
      return NextResponse.json(
        { success: false, message: 'Invalid admin session format' },
        { status: 401 }
      )
    }
    
    // Check if session is valid (not expired) - extended to 24 hours
    const loginTime = new Date(adminSession.loginTime)
    const now = new Date()
    const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLogin > 24) { // 24 hour session limit (more reasonable)
      console.log(`⏰ Admin session expired: ${hoursSinceLogin.toFixed(1)} hours old`)
      return NextResponse.json(
        { success: false, message: 'Admin session expired' },
        { status: 401 }
      )
    }
    
    console.log(`✅ Admin session valid: ${hoursSinceLogin.toFixed(1)} hours old`)

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