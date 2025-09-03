'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showText = true 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const handleClick = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (newRating: number) => {
    if (!readonly) {
      setHoverRating(newRating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating
  const ratingText = getRatingText(displayRating)

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating
          const isHalfFilled = star - 0.5 <= displayRating && star > displayRating
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} 
                         transition-transform duration-150 ${readonly ? '' : 'active:scale-95'}`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors duration-200 ${
                  isFilled 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : isHalfFilled 
                    ? 'fill-yellow-200 text-yellow-400'
                    : readonly 
                    ? 'text-gray-300' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
              />
            </button>
          )
        })}
      </div>
      
      {showText && (
        <div className="flex items-center space-x-2">
          <span className={`font-medium text-gray-900 ${textSizeClasses[size]}`}>
            {displayRating.toFixed(1)}
          </span>
          {!readonly && (
            <span className={`text-gray-600 ${textSizeClasses[size]}`}>
              {ratingText}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function getRatingText(rating: number): string {
  if (rating === 0) return 'No rating'
  if (rating <= 1) return 'Poor'
  if (rating <= 2) return 'Fair' 
  if (rating <= 3) return 'Good'
  if (rating <= 4) return 'Very Good'
  return 'Excellent'
}