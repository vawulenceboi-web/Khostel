import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { createBookingSchema } from '@/lib/schema'
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

    console.log('📅 Fetching bookings for user:', session.user.email, session.user.role)
    
    const result = await db.bookings.findByUser(session.user.id, session.user.role)
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
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