import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can rate agents' },
        { status: 403 }
      )
    }

    const { agentId, stars, feedback } = await request.json()

    if (!agentId || !stars) {
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
        student_id: session.user.id,
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