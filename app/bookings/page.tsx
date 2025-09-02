'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, X } from 'lucide-react'

interface Booking {
  id: string
  hostel_id: string
  student_id: string
  preferred_date: string
  status: string
  created_at: string
  hostel?: {
    title: string
    location: {
      name: string
    }
  }
}

export default function StudentBookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/student-bookings')
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setBookings(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelMyBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) {
      return
    }

    try {
      const response = await fetch('/api/student-bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: 'cancelled'
        })
      })
      
      if (response.ok) {
        await fetchBookings()
        alert('Your booking request has been cancelled.')
      } else {
        alert('Failed to cancel booking. Please try again.')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Date not set'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Student Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">My Inspection Requests</h1>
        <p className="text-gray-600 mt-1">
          Track your hostel inspection bookings
        </p>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-gray-900">{bookings.length}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <p className="text-sm text-gray-600">Confirmed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black mb-2">No Inspection Requests</h3>
            <p className="text-gray-600">
              You haven't requested any hostel inspections yet. Browse hostels to book inspections!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-black flex items-center justify-between">
                  <span>{booking.hostel?.title || 'Hostel'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </CardTitle>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {booking.hostel?.location?.name || 'Location not available'}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Inspection: {formatDate(booking.preferred_date)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Requested: {formatDate(booking.created_at)}</span>
                  </div>

                  {/* Status-specific content */}
                  {booking.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-3">
                        Waiting for agent to confirm your inspection request.
                      </p>
                      <Button
                        onClick={() => cancelMyBooking(booking.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel Request
                      </Button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="mt-4 pt-4 border-t bg-green-50 p-3 rounded-md">
                      <p className="text-green-800 text-sm font-medium">
                        ✅ Great! Your inspection has been confirmed. The agent will contact you soon to arrange the visit.
                      </p>
                    </div>
                  )}

                  {booking.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t bg-blue-50 p-3 rounded-md">
                      <p className="text-blue-800 text-sm font-medium">
                        🎉 Inspection completed! We hope you found your perfect hostel. If you liked it, contact the agent to secure your spot!
                      </p>
                    </div>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="mt-4 pt-4 border-t bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-600 text-sm">
                        ❌ This inspection request was cancelled.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}