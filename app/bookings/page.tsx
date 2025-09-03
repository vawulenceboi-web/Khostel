'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, X, Star } from 'lucide-react'
import VirusMorphLoader from '@/components/VirusMorphLoader'
import StarRating from '@/components/StarRating'

interface StudentBooking {
  id: string
  hostel_id: string
  student_id: string
  preferred_date: string
  status: string
  created_at: string
  hostel?: {
    title: string
    agent_id: string
    location: {
      name: string
    }
  }
  agent?: {
    id: string
    first_name: string
    last_name: string
  }
}

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<StudentBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [showRatingForm, setShowRatingForm] = useState<string | null>(null)
  const [submittingRating, setSubmittingRating] = useState(false)

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
        const data = await response.json()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <VirusMorphLoader size={130} color="#EC4899" duration={1800} />
          <div className="mt-6">
            <div className="text-xl font-bold text-white mb-2">My Bookings</div>
            <div className="text-gray-300">Loading your requests...</div>
          </div>
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
                  <div className="border-t pt-3">
                    <div className="bg-blue-50 p-3 rounded-md mb-3">
                      <p className="text-blue-700 text-sm font-medium">
                        🎉 Inspection completed! Hope you found your perfect hostel!
                      </p>
                    </div>
                    
                    {/* Rating Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Rate Your Experience</h4>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      
                      {showRatingForm === booking.id ? (
                        <RatingForm
                          agentId={booking.hostel?.agent_id || ''}
                          agentName={booking.agent ? `${booking.agent.first_name} ${booking.agent.last_name}` : 'Agent'}
                          onSubmit={(rating, review) => submitRating(booking.hostel?.agent_id || '', rating, review)}
                          onCancel={() => setShowRatingForm(null)}
                          isSubmitting={submittingRating}
                        />
                      ) : (
                        <Button
                          onClick={() => setShowRatingForm(booking.id)}
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

// Rating Form Component
function RatingForm({ 
  agentId, 
  agentName, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: {
  agentId: string
  agentName: string
  onSubmit: (rating: number, review: string) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }
    onSubmit(rating, review)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">Rate {agentName}:</p>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          readonly={false}
          size="lg"
          showText={true}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Review (Optional):
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this agent..."
          className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{review.length}/500 characters</p>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
          size="sm"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
          ) : (
            <Star className="w-3 h-3 mr-2" />
          )}
          Submit Rating
        </Button>
        
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}