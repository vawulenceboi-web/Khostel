import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = cookies()
    const adminSessionCookie = cookieStore.get('admin-session')

    if (!adminSessionCookie) {
      return NextResponse.json(
        { success: false, message: 'Admin authentication required' },
        { status: 401 }
      )
    }

    console.log('📋 Admin fetching pending agents...')

    // Get pending agents with enhanced details
    const { data: pendingAgents, error } = await db.supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        address,
        business_reg_number,
        profile_image_url,
        created_at,
        terms_accepted,
        terms_accepted_at
      `)
      .eq('role', 'agent')
      .eq('verified_status', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error fetching pending agents:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch pending agents' },
        { status: 500 }
      )
    }

    // Calculate time remaining for each agent (30-minute window)
    const enhancedAgents = (pendingAgents || []).map(agent => {
      const registeredAt = new Date(agent.created_at)
      const deadline = new Date(registeredAt.getTime() + (30 * 60 * 1000)) // 30 minutes
      const now = new Date()
      const minutesRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60))

      return {
        ...agent,
        cac_number: agent.business_reg_number,
        registered_at: agent.created_at,
        submitted_at: agent.created_at,
        decision_deadline: deadline.toISOString(),
        queue_status: minutesRemaining > 0 ? 'pending' : 'expired',
        minutes_remaining: minutesRemaining
      }
    })

    // Filter out expired applications (optional - you can keep them for review)
    const activeAgents = enhancedAgents.filter(agent => agent.minutes_remaining > 0)

    console.log(`✅ Found ${activeAgents.length} pending agents (${enhancedAgents.length - activeAgents.length} expired)`)

    return NextResponse.json({
      success: true,
      data: activeAgents,
      total: activeAgents.length,
      expired: enhancedAgents.length - activeAgents.length
    })

  } catch (error) {
    console.error('❌ Error in pending agents API:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pending agents' },
      { status: 500 }
    )
  }
}