'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Phone, Mail, User, MapPin, Clock } from 'lucide-react'

interface Booking {
  id: string
  hostel_id: string
  student_id: string
  preferred_date: string
  preferred_time: string
  message: string
  status: string
  created_at: string
  hostel?: {
    title: string
    location: {
      name: string
    }
  }
  student?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function BookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Bookings fetched successfully:', data.data?.length || 0)
        
        if (data.success && Array.isArray(data.data)) {
          setBookings(data.data)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus
        })
      })

      if (response.ok) {
        // Refresh bookings
        fetchBookings()
      }
    } catch (error) {
      console.error('❌ Error updating booking:', error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p>Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Booking Requests</h1>
        <p className="text-gray-600 mt-2">
          Manage inspection requests from students
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-black">{bookings.length}</div>
            <p className="text-sm text-gray-600">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-sm text-gray-600">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Booking Requests</h3>
            <p className="text-gray-600">
              Students haven't requested any inspections yet. Keep your hostels updated to attract more bookings!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-black">
                      {booking.hostel?.title || `Hostel ${booking.hostel_id}`}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.hostel?.location?.name || 'Location not available'}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(booking.status)} border-0`}>
                    {booking.status || 'pending'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Student Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-black">Student Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {booking.student 
                            ? `${booking.student.first_name || ''} ${booking.student.last_name || ''}`.trim()
                            : 'Name not available'
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{booking.student?.phone || 'Phone not available'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{booking.student?.email || 'Email not available'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-black">Booking Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {booking.preferred_date 
                            ? formatDate(booking.preferred_date)
                            : 'Date to be scheduled'
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Requested: {formatDate(booking.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Mark Completed
                    </Button>
                    <Button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}