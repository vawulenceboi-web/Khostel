import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
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
        { success: false, message: 'Student access only' },
        { status: 403 }
      )
    }

    // Simple query - student only needs hostel info, not their own contact details
    const { data, error } = await db.supabase
      .from('bookings')
      .select(`
        id,
        hostel_id,
        preferred_date,
        status,
        created_at,
        hostel:hostels(title, location:locations(name))
      `)
      .eq('student_id', session.user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Get student bookings error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Student access only' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, status } = body
    
    // Students can only cancel
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

    // Update status
    const { data: updatedBooking, error } = await db.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select(`
        id,
        hostel_id,
        preferred_date,
        status,
        created_at,
        hostel:hostels(title, location:locations(name))
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: updatedBooking,
      message: 'Booking cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel student booking error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}