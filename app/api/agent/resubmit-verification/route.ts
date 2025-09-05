import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== 'agent') {
      return NextResponse.json(
        { success: false, message: 'Agent authentication required' },
        { status: 401 }
      )
    }

    console.log('🔄 Agent resubmitting verification:', session.user.email)

    // Check current agent status
    const { data: agent, error: fetchError } = await db.supabase
      .from('users')
      .select('id, verified_status, verification_attempts, last_verification_attempt, created_at')
      .eq('id', session.user.id)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { success: false, message: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if agent is already verified
    if (agent.verified_status) {
      return NextResponse.json(
        { success: false, message: 'Agent is already verified' },
        { status: 400 }
      )
    }

    // Check if agent can resubmit (max 3 attempts)
    const attempts = agent.verification_attempts || 0
    if (attempts >= 3) {
      return NextResponse.json(
        { success: false, message: 'Maximum verification attempts reached (3). Please contact support.' },
        { status: 400 }
      )
    }

    // Check if enough time has passed since last attempt (1 hour cooldown)
    if (agent.last_verification_attempt) {
      const lastAttempt = new Date(agent.last_verification_attempt)
      const now = new Date()
      const hoursSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastAttempt < 1) {
        const minutesRemaining = Math.ceil((1 - hoursSinceLastAttempt) * 60)
        return NextResponse.json(
          { success: false, message: `Please wait ${minutesRemaining} minutes before resubmitting` },
          { status: 400 }
        )
      }
    }

    // Update agent for resubmission
    const { error: updateError } = await db.supabase
      .from('users')
      .update({
        verification_attempts: attempts + 1,
        last_verification_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('❌ Error updating agent for resubmission:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to resubmit verification' },
        { status: 500 }
      )
    }

    // Add to verification queue (trigger should handle this, but let's be explicit)
    const { error: queueError } = await db.supabase
      .from('verification_queue')
      .insert({
        agent_id: session.user.id,
        submitted_at: new Date().toISOString(),
        decision_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        status: 'pending',
        admin_email: null
      })

    if (queueError) {
      console.warn('⚠️ Could not add to verification queue (might already exist):', queueError)
      // Don't fail the main operation for this
    }

    console.log(`✅ Agent resubmission successful (attempt ${attempts + 1}/3)`)

    return NextResponse.json({
      success: true,
      message: `Verification resubmitted successfully! This is attempt ${attempts + 1} of 3. You will be notified within 30 minutes.`,
      data: {
        attemptNumber: attempts + 1,
        maxAttempts: 3,
        cooldownHours: 1
      }
    })

  } catch (error) {
    console.error('❌ Agent resubmission error:', error)
    return NextResponse.json(
      { success: false, message: 'Resubmission failed' },
      { status: 500 }
    )
  }
}