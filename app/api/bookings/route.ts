import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDb } from '@/lib/db'
import { bookings, hostels, users, createBookingSchema } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
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

    const { searchParams } = new URL(request.url)
    const db = getDb()
    
    let query = db
      .select({
        id: bookings.id,
        preferredDate: bookings.preferredDate,
        preferredTime: bookings.preferredTime,
        message: bookings.message,
        status: bookings.status,
        agentNotes: bookings.agentNotes,
        createdAt: bookings.createdAt,
        hostel: {
          id: hostels.id,
          title: hostels.title,
          price: hostels.price,
          priceType: hostels.priceType,
          images: hostels.images,
        },
        student: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
        }
      })
      .from(bookings)
      .leftJoin(hostels, eq(bookings.hostelId, hostels.id))
      .leftJoin(users, eq(bookings.studentId, users.id))

    // Filter based on user role
    if (session.user.role === 'student') {
      query = query.where(eq(bookings.studentId, session.user.id))
    } else if (session.user.role === 'agent') {
      query = query.where(eq(hostels.agentId, session.user.id))
    }
    // Admins can see all bookings

    const result = await query

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
    
    const db = getDb()
    const [newBooking] = await db
      .insert(bookings)
      .values({
        ...validatedData,
        studentId: session.user.id,
        preferredDate: validatedData.preferredDate ? new Date(validatedData.preferredDate) : null,
      })
      .returning()

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