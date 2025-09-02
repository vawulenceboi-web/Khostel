import * as React from "react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  verified: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function VerificationBadge({ 
  verified, 
  size = 'md', 
  className 
}: VerificationBadgeProps) {
  if (!verified) return null

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <svg
        className={cn(
          "text-blue-500 fill-current",
          sizeClasses[size]
        )}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Instagram/Facebook style verification badge */}
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          fill="#1DA1F2"
        />
        <path
          d="M10 14.17l7.59-7.59L19 8l-9 9-5-5 1.41-1.41z"
          fill="white"
        />
      </svg>
    </div>
  )
}

// Alternative Instagram-style badge with more accurate design
export function InstagramVerificationBadge({ 
  verified, 
  size = 'md', 
  className 
}: VerificationBadgeProps) {
  if (!verified) return null

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <svg
        className={cn(
          "drop-shadow-sm",
          sizeClasses[size]
        )}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue circle background */}
        <circle
          cx="12"
          cy="12"
          r="11"
          fill="#1DA1F2"
          stroke="white"
          strokeWidth="1"
        />
        {/* White checkmark */}
        <path
          d="M9 12l2 2 4-4"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}