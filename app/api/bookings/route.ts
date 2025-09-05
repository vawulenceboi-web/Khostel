import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { db } from '@/lib/db'
import { createBookingSchema } from '@/lib/schema'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('📅 Fetching bookings for user:', session.user.email, session.user.role)
    
    const result = await db.bookings.findByUser(
      session.user.id as string,
      session.user.user_metadata?.role || 'student'
    )
    console.log('✅ Bookings fetched successfully:', result.length)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Student role required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)
    
    console.log('📅 Creating booking for student:', session.user.id)
    
    const newBooking = await db.bookings.create({
      student_id: session.user.id,
      hostel_id: validatedData.hostelId,
      preferred_date: validatedData.preferredDate ? new Date(validatedData.preferredDate).toISOString() : null,
      preferred_time: validatedData.preferredTime,
      message: validatedData.message,
    })
    
    console.log('✅ Booking created successfully')

    return NextResponse.json({
      success: true,
      data: newBooking,
      message: 'Booking created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Allow agents to manage all bookings, students to cancel their own
    if (session.user.role !== 'agent' && session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Agent or student role required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, status } = body
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and status are required' },
        { status: 400 }
      )
    }

    // If student, only allow cancelling their own bookings
    if (session.user.role === 'student') {
      if (status !== 'cancelled') {
        return NextResponse.json(
          { success: false, message: 'Students can only cancel bookings' },
          { status: 403 }
        )
      }
      
      // Verify this booking belongs to the student
      const { data: booking } = await db.supabase
        .from('bookings')
        .select('student_id')
        .eq('id', id)
        .single()
      
      if (!booking || booking.student_id !== session.user.id) {
        return NextResponse.json(
          { success: false, message: 'You can only cancel your own bookings' },
          { status: 403 }
        )
      }
    }
    
    console.log('📅 Updating booking:', id, 'to status:', status)
    
    const updatedBooking = await db.bookings.updateStatus(id, status)
    console.log('✅ Booking updated successfully')

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully'
    })

  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}