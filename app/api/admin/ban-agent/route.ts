export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { cookies } from 'next/headers'

import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const adminSessionCookie = cookieStore.get('admin-session')

    if (!adminSessionCookie) {
      return NextResponse.json(
        { success: false, message: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { agentId, banned } = await request.json()
    
    if (!agentId || typeof banned !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Agent ID and banned status required' },
        { status: 400 }
      )
    }

    console.log(`🔄 ${banned ? 'Banning' : 'Unbanning'} agent:`, agentId)

    // Direct database update - no complex logic
    const { data: updatedAgent, error } = await db.supabase
      .from('users')
      .update({ 
        banned: banned,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId)
      .eq('role', 'agent')
      .select('id, email, first_name, last_name, banned')
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Database update failed', error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Direct database update successful:', updatedAgent)

    return NextResponse.json({
      success: true,
      data: updatedAgent,
      message: banned ? 'Agent banned successfully' : 'Agent unbanned successfully'
    })

  } catch (error) {
    console.error('❌ Ban/unban error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}