'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Phone, Mail, User, MapPin, Clock, Star } from 'lucide-react'
import VirusMorphLoader from '@/components/VirusMorphLoader'
import StarRating from '@/components/StarRating'

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
    agent_id: string
    location: {
      name: string
    }
    agent?: {
      id: string
      first_name: string
      last_name: string
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
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null)
  const [showRatingForm, setShowRatingForm] = useState<string | null>(null)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)

  useEffect(() => {
    if (session?.user) {
      fetchBookings()
    } else if (status !== 'loading') {
      setLoading(false)
    }
  }, [session, status])

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
      console.log('🔄 Updating booking:', bookingId, 'to status:', newStatus)
      
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

      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Booking updated successfully:', data)
        
        // Refresh bookings to show updated status
        await fetchBookings()
        
        // Show success feedback
        alert(`Booking ${newStatus === 'completed' ? 'marked as completed' : newStatus} successfully!`)
      } else {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        alert(`Error: ${errorData.message || 'Failed to update booking'}`)
      }
    } catch (error) {
      console.error('❌ Error updating booking:', error)
      alert('Network error: Failed to update booking')
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <VirusMorphLoader size={140} color="#F59E0B" duration={2000} />
          <div className="mt-6">
            <div className="text-xl font-bold text-white mb-2">Booking Management</div>
            <div className="text-gray-300">Loading booking requests...</div>
          </div>
        </div>
      </div>
    )
  }

  const submitRating = async (agentId: string, rating: number, reviewText?: string) => {
    setSubmittingRating(true)
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          rating,
          reviewText: reviewText || undefined
        })
      })

      if (response.ok) {
        alert(`Rating submitted: ${rating} stars!`)
        setShowRatingForm(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to submit rating: ${errorData.message}`)
      }
    } catch (error) {
      alert('Network error: Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  // Allow both students and agents, but show different content

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <VirusMorphLoader size={140} color="#F59E0B" duration={2000} />
          <div className="mt-6">
            <div className="text-xl font-bold text-white mb-2">Booking Management</div>
            <div className="text-gray-300">Loading booking requests...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          {session?.user?.role === 'agent' ? 'Booking Requests' : 'My Booking Status'}
        </h1>
        <p className="text-gray-600 mt-2">
          {session?.user?.role === 'agent' 
            ? 'Manage inspection requests from students'
            : 'Track your hostel inspection requests'
          }
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

                {/* Role-based content */}
                {session?.user?.role === 'agent' ? (
                  // Agent buttons
                  <>
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
                  </>
                ) : (
                  // Student status messages (no buttons)
                  <>
                    {booking.status === 'pending' && (
                      <div className="pt-4 border-t bg-yellow-50 p-3 rounded-md">
                        <p className="text-yellow-800 text-sm font-medium">
                          ⏳ Your request is pending. Waiting for agent confirmation...
                        </p>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="pt-4 border-t bg-green-50 p-3 rounded-md">
                        <p className="text-green-800 text-sm font-medium">
                          ✅ Great! Your inspection has been confirmed. The agent will contact you soon to arrange the visit.
                        </p>
                      </div>
                    )}

                    {booking.status === 'completed' && (
                      <div className="pt-4 border-t">
                        <div className="bg-blue-50 p-3 rounded-md mb-3">
                          <p className="text-blue-800 text-sm font-medium">
                            🎉 Inspection completed! We hope you found your perfect hostel!
                          </p>
                        </div>
                        
                        {/* Student Rating Section */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <h4 className="text-sm font-semibold text-gray-900">Rate Your Experience</h4>
                          </div>
                          
                          {showRatingForm === booking.id ? (
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Rate this agent:</p>
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      className={`transition-colors ${
                                        star <= selectedRating 
                                          ? 'text-yellow-400' 
                                          : 'text-gray-300 hover:text-yellow-400'
                                      }`}
                                      onClick={() => {
                                        console.log('Star clicked:', star)
                                        setSelectedRating(star)
                                        
                                        // Submit after a brief delay to show the filled stars
                                        setTimeout(() => {
                                          const agentId = booking.hostel?.agent_id || 'unknown-agent'
                                          console.log('Using agent ID:', agentId)
                                          submitRating(agentId, star, 'Great agent!')
                                          setSelectedRating(0) // Reset after submission
                                        }, 800)
                                      }}
                                    >
                                      <Star className={`w-5 h-5 ${star <= selectedRating ? 'fill-current' : ''}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <Button
                                onClick={() => setShowRatingForm(null)}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => {
                                console.log('Rate Agent clicked for booking:', booking.id)
                                setShowRatingForm(booking.id)
                              }}
                              size="sm"
                              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                              <Star className="w-3 h-3 mr-2" />
                              Rate Agent
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {booking.status === 'cancelled' && (
                      <div className="pt-4 border-t bg-gray-50 p-3 rounded-md">
                        <p className="text-gray-600 text-sm">
                          ❌ This inspection request was cancelled.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}