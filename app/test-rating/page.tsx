'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import StarRating from '@/components/StarRating'

export default function TestRatingPage() {
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)

  const submitRating = async (rating: number, reviewText: string) => {
    setSubmittingRating(true)
    
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'test-agent-id',
          rating,
          reviewText: reviewText || undefined
        })
      })

      if (response.ok) {
        alert(`Rating submitted: ${rating} stars!`)
        setShowRatingForm(false)
      } else {
        const errorData = await response.json()
        alert(`Failed: ${errorData.message}`)
      }
    } catch (error) {
      alert('Network error')
    } finally {
      setSubmittingRating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Test Rating Interface</h1>
      
      {/* Mock Completed Booking */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium text-black">Modern Student Apartment</h3>
              <p className="text-sm text-gray-500">Covenant Gate</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
              completed
            </span>
          </div>

          {/* Status Message */}
          <div className="border-t pt-3">
            <div className="bg-blue-50 p-3 rounded-md mb-3">
              <p className="text-blue-700 text-sm font-medium">
                🎉 Inspection completed! Hope you found your perfect hostel!
              </p>
            </div>
            
            {/* Rating Section - Simplified Test */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Rate Your Experience</h4>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                How was your experience with agent Iko Nki?
              </p>
              
              {showRatingForm ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Your Rating:</p>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className="text-yellow-400 hover:text-yellow-500"
                          onClick={() => submitRating(star, 'Test review')}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowRatingForm(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowRatingForm(true)}
                  size="sm"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Star className="w-3 h-3 mr-2" />
                  Rate Agent
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
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