import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const adminSessionCookie = cookieStore.get('admin-session')

    console.log('🔍 Checking admin session:', adminSessionCookie ? 'Cookie found' : 'No cookie')

    if (!adminSessionCookie) {
      return NextResponse.json(
        { success: false, message: 'No admin session found' },
        { status: 401 }
      )
    }

    // Simple validation - just check if cookie exists and has admin email
    try {
      const adminSession = JSON.parse(adminSessionCookie.value)
      
      if (adminSession.email === 'admin@k-h.com' && adminSession.role === 'admin') {
        console.log('✅ Admin session valid')
        return NextResponse.json({
          success: true,
          data: {
            email: adminSession.email,
            role: adminSession.role
          }
        })
      }
    } catch (parseError) {
      console.error('❌ Session parse error:', parseError)
    }

    return NextResponse.json(
      { success: false, message: 'Invalid admin session' },
      { status: 401 }
    )

  } catch (error) {
    console.error('❌ Admin verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Authentication check failed' },
      { status: 500 }
    )
  }
}