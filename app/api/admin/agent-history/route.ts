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

    console.log('📋 Admin fetching agent history...')

    // Get all agents (verified and unverified) with their history
    const { data: allAgents, error } = await db.supabase
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
        verified_status,
        created_at,
        updated_at
      `)
      .eq('role', 'agent')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching agent history:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch agent history' },
        { status: 500 }
      )
    }

    // Get admin actions for each agent
    const { data: adminActions, error: actionsError } = await db.supabase
      .from('admin_actions')
      .select('*')
      .order('created_at', { ascending: false })

    if (actionsError) {
      console.warn('⚠️ Could not fetch admin actions:', actionsError)
    }

    // Combine agent data with their action history
    const agentsWithHistory = (allAgents || []).map(agent => {
      const agentActions = (adminActions || []).filter(action => action.agent_id === agent.id)
      const lastAction = agentActions[0] // Most recent action
      
      return {
        ...agent,
        cac_number: agent.business_reg_number,
        status: agent.verified_status ? 'verified' : 'pending',
        lastAction: lastAction ? {
          type: lastAction.action_type,
          reason: lastAction.reason,
          date: lastAction.created_at,
          admin: lastAction.admin_email
        } : null,
        actionHistory: agentActions,
        canBeBanned: agent.verified_status, // Only verified agents can be banned
        registrationAge: Math.floor((new Date().getTime() - new Date(agent.created_at).getTime()) / (1000 * 60 * 60 * 24)) // Days since registration
      }
    })

    console.log(`✅ Found ${agentsWithHistory.length} agents with history`)

    return NextResponse.json({
      success: true,
      data: agentsWithHistory,
      stats: {
        total: agentsWithHistory.length,
        verified: agentsWithHistory.filter(a => a.verified_status).length,
        pending: agentsWithHistory.filter(a => !a.verified_status).length,
        recentActions: (adminActions || []).length
      }
    })

  } catch (error) {
    console.error('❌ Error in agent history API:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch agent history' },
      { status: 500 }
    )
  }
}