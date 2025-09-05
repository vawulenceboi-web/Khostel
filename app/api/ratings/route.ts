import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/lib/db'

import { getCurrentUser } from '@/lib/session'


export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body); // 👀 YOUR DEBUG METHOD
    
    const session = await getCurrentUser()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can rate agents' },
        { status: 403 }
      )
    }

    const { agentId, stars, feedback } = body

    if (!agentId || !stars) {
      console.log("❌ Missing fields:", { agentId: !!agentId, stars: !!stars });
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    console.log('⭐ Student rating agent:', agentId, 'Stars:', stars)

    // Save rating using your clean approach
    const { data, error } = await db.supabase
      .from('ratings')
      .upsert({
        agent_id: agentId,
        student_id: session.id,
        stars: stars,
        feedback: feedback || null
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error saving rating:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Rating saved successfully')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Rating submission error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      )
    }

    // Get average rating using your approach
    const { data: ratings, error } = await db.supabase
      .from('ratings')
      .select('stars, feedback, created_at, student:users(first_name)')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching ratings:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Calculate average
    const avgRating = ratings && ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
      : null

    return NextResponse.json({
      success: true,
      data: {
        avgRating,
        totalReviews: ratings?.length || 0,
        ratings: ratings || []
      }
    })

  } catch (error: any) {
    console.error('❌ Get ratings error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}