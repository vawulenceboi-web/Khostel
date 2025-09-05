export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'

import { cookies } from 'next/headers'

import { db } from '@/lib/db'

import { getAdminEmail } from '@/lib/adminAuth'


export async function POST(request: NextRequest) {
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

    const { agentId, action, reason } = await request.json()
    
    if (!agentId || !action || !['approve', 'reject', 'ban', 'unban'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification data' },
        { status: 400 }
      )
    }

    console.log(`🔍 Admin ${action}ing agent:`, agentId)
    console.log('🔍 Action type:', action, 'Will bypass 30min window?', action === 'ban' || action === 'unban')

    // Check if agent exists and is pending
    const { data: agent, error: fetchError } = await db.supabase
      .from('users')
      .select('id, email, first_name, last_name, role, verified_status, created_at')
      .eq('id', agentId)
      .eq('role', 'agent')
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { success: false, message: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check 30-minute window only for approve/reject, not for ban/unban
    if (action !== 'ban' && action !== 'unban') {
      const registeredAt = new Date(agent.created_at)
      const deadline = new Date(registeredAt.getTime() + (30 * 60 * 1000))
      const now = new Date()

      if (now > deadline) {
        return NextResponse.json(
          { success: false, message: 'Verification window expired (30 minutes)' },
          { status: 400 }
        )
      }
    }

    // Update agent verification status
    let updateData: any = { updated_at: new Date().toISOString() }
    
    if (action === 'approve') {
      updateData.verified_status = true
    } else if (action === 'reject') {
      updateData.verified_status = false
      // Keep agent account but unverified
    } else if (action === 'ban') {
      updateData.verified_status = false
      updateData.banned = true
    } else if (action === 'unban') {
      updateData.verified_status = true  // Restore verification when unbanning
      updateData.banned = false
    }

    console.log('🔍 Final update data:', JSON.stringify(updateData))

    const { data: updatedAgent, error: updateError } = await db.supabase
      .from('users')
      .update(updateData)
      .eq('id', agentId)
      .select('id, email, first_name, last_name, verified_status, banned, updated_at')
      .single()

    if (updateError) {
      console.error('❌ Error updating agent:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update agent status' },
        { status: 500 }
      )
    }

    console.log('✅ Database update successful. Updated agent:', JSON.stringify(updatedAgent))
    console.log('🔍 Action was:', action, 'Agent banned status now:', updatedAgent.banned)

    // Log admin action
    try {
      const adminSession = JSON.parse(adminSessionCookie.value)
      
      const { error: logError } = await db.supabase
        .from('admin_actions')
        .insert({
          admin_email: adminSession.email,
          agent_id: agentId,
          action_type: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'banned',
          reason: reason || `Agent ${action}d by admin`,
          created_at: new Date().toISOString()
        })

      if (logError) {
        console.warn('⚠️ Failed to log admin action:', logError)
        // Don't fail the main operation for logging issues
      }
    } catch (logError) {
      console.warn('⚠️ Failed to parse admin session for logging:', logError)
    }

    const actionMessages = {
      approve: `✅ Agent ${agent.first_name} ${agent.last_name} has been approved and can now list hostels`,
      reject: `❌ Agent ${agent.first_name} ${agent.last_name} has been rejected`,
      ban: `🚫 Agent ${agent.first_name} ${agent.last_name} has been banned from the platform`,
      unban: `✅ Agent ${agent.first_name} ${agent.last_name} has been unbanned and can access their account`
    }

    console.log(actionMessages[action as keyof typeof actionMessages])

    return NextResponse.json({
      success: true,
      message: actionMessages[action as keyof typeof actionMessages],
      data: {
        agentId,
        action,
        agentName: `${agent.first_name} ${agent.last_name}`,
        newStatus: action === 'approve' ? 'verified' : 'unverified'
      }
    })

  } catch (error) {
    console.error('❌ Agent verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    )
  }
}