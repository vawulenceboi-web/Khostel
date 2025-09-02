'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, X } from 'lucide-react'

interface StudentBooking {
  id: string
  hostel_id: string
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
  const [bookings, setBookings] = useState<StudentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const fetchMyBookings = async () => {
    try {
      const response = await fetch('/api/student-bookings')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setBookings(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelRequest = async (bookingId: string) => {
    if (!confirm('Cancel this inspection request?')) return

    try {
      const response = await fetch('/api/student-bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'cancelled' })
      })
      
      if (response.ok) {
        fetchMyBookings()
        alert('Request cancelled')
      } else {
        alert('Failed to cancel')
      }
    } catch {
      alert('Error occurred')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Simple Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-black">My Inspection Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Your hostel booking requests</p>
      </div>

      {/* Simple List */}
      {bookings.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No inspection requests yet</p>
            <p className="text-gray-400 text-sm mt-1">Browse hostels to book inspections</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-black">{booking.hostel?.title || 'Hostel'}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.hostel?.location?.name || 'Location'}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Inspection: {new Date(booking.preferred_date).toLocaleDateString()}
                </div>

                {/* Status Messages */}
                {booking.status === 'pending' && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-3">Waiting for agent confirmation...</p>
                    <Button
                      onClick={() => cancelRequest(booking.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="border-t pt-3 bg-green-50 -mx-4 -mb-4 px-4 pb-4">
                    <p className="text-green-700 text-sm font-medium">
                      ✅ Confirmed! Agent will contact you soon.
                    </p>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="border-t pt-3 bg-blue-50 -mx-4 -mb-4 px-4 pb-4">
                    <p className="text-blue-700 text-sm font-medium">
                      🎉 Inspection done! Hope you found your perfect hostel!
                    </p>
                  </div>
                )}

                {booking.status === 'cancelled' && (
                  <div className="border-t pt-3 bg-gray-50 -mx-4 -mb-4 px-4 pb-4">
                    <p className="text-gray-600 text-sm">❌ Request cancelled</p>
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