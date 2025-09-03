import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const submitRatingSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  reviewText: z.string().optional(),
  bookingId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Only students can rate agents' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = submitRatingSchema.parse(body)
    
    console.log('⭐ Student rating agent:', validatedData.agentId, 'Rating:', validatedData.rating)

    // Check if agent exists and is verified
    const { data: agent, error: agentError } = await db.supabase
      .from('users')
      .select('id, first_name, last_name, verified_status, banned')
      .eq('id', validatedData.agentId)
      .eq('role', 'agent')
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { success: false, message: 'Agent not found' },
        { status: 404 }
      )
    }

    if (!agent.verified_status || agent.banned) {
      return NextResponse.json(
        { success: false, message: 'Cannot rate unverified or banned agents' },
        { status: 400 }
      )
    }

    // Check if student already rated this agent
    const { data: existingRating } = await db.supabase
      .from('agent_ratings')
      .select('id, rating')
      .eq('agent_id', validatedData.agentId)
      .eq('student_id', session.user.id)
      .single()

    if (existingRating) {
      // Update existing rating
      const { data: updatedRating, error: updateError } = await db.supabase
        .from('agent_ratings')
        .update({
          rating: validatedData.rating,
          review_text: validatedData.reviewText || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error updating rating:', updateError)
        return NextResponse.json(
          { success: false, message: 'Failed to update rating' },
          { status: 500 }
        )
      }

      console.log('✅ Rating updated successfully')
      return NextResponse.json({
        success: true,
        message: 'Rating updated successfully',
        data: updatedRating
      })
    } else {
      // Create new rating
      const { data: newRating, error: createError } = await db.supabase
        .from('agent_ratings')
        .insert({
          agent_id: validatedData.agentId,
          student_id: session.user.id,
          booking_id: validatedData.bookingId || null,
          rating: validatedData.rating,
          review_text: validatedData.reviewText || null
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating rating:', createError)
        return NextResponse.json(
          { success: false, message: 'Failed to submit rating' },
          { status: 500 }
        )
      }

      console.log('✅ Rating created successfully')
      return NextResponse.json({
        success: true,
        message: 'Rating submitted successfully',
        data: newRating
      }, { status: 201 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid rating data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Rating submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    
    if (!agentId) {
      return NextResponse.json(
        { success: false, message: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Get all ratings for the agent
    const { data: ratings, error } = await db.supabase
      .from('agent_ratings')
      .select(`
        id,
        rating,
        review_text,
        created_at,
        student:users(first_name, last_name)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching ratings:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch ratings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ratings || []
    })

  } catch (error) {
    console.error('❌ Get ratings error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}