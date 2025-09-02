'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { MdVerified } from "react-icons/md"
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"

export default function HostelsClient() {
  const { data: session } = useSession()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    try {
      const response = await fetch('/api/hostels')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response:', data)
        
        if (data.success && Array.isArray(data.data)) {
          setHostels(data.data)
        }
      }
    } catch (error) {
      console.error('❌ Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Add booking function
  const handleBookInspection = async (hostelId) => {
    if (!session?.user) {
      toast.error('Please sign in to book inspections')
      return
    }

    if (session.user.role !== 'student') {
      toast.error('Only students can book inspections')
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostelId,
          preferredDate: new Date().toISOString().split('T')[0],
          message: 'Inspection booking request'
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Inspection booked successfully!')
      } else {
        toast.error(result.message || 'Booking failed')
      }
    } catch (error) {
      toast.error('Failed to book inspection')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading hostels...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Step 1: Add basic header - TEST IF THIS BREAKS */}
      <div className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Browse Hostels ({hostels.length})</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {hostels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3>No hostels found</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel, index) => (
              <Card key={hostel.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Step 2: Professional image display */}
                {hostel.images && Array.isArray(hostel.images) && hostel.images.length > 0 && (
                  <img 
                    src={hostel.images[0]} 
                    alt={hostel.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                
                <CardContent className="p-6">
                  {/* Step 4: Professional title */}
                  <h3 className="font-bold text-xl mb-3">{hostel.title}</h3>
                  
                  {/* Step 4: Professional location */}
                  <div className="flex items-center text-muted-foreground mb-3">
                    <span className="text-sm">{hostel.location?.name}</span>
                  </div>
                  
                  {/* Step 4: Professional price display */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">
                      ₦{hostel.price?.toLocaleString()}
                      <span className="text-sm text-muted-foreground font-normal ml-1">
                        /{hostel.price_type}
                      </span>
                    </div>
                    <span className="text-sm bg-secondary px-2 py-1 rounded">
                      {hostel.room_type}
                    </span>
                  </div>
                  
                  {/* Step 5: Add booking button */}
                  <div className="mb-4">
                    <Button 
                      className="w-full"
                      onClick={() => handleBookInspection(hostel.id)}
                      disabled={!session?.user || session.user.role !== 'student'}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {!session?.user ? 'Sign In to Book' : 'Book Inspection'}
                    </Button>
                  </div>
                  
                  {/* Step 6: Add amenities display */}
                  {hostel.amenities && Array.isArray(hostel.amenities) && hostel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hostel.amenities.map((amenity, amenityIndex) => (
                        <Badge key={amenityIndex} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Step 3: Agent with verification badge */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>Agent: {hostel.agent?.first_name} {hostel.agent?.last_name}</span>
                    {hostel.agent?.verified_status && (
                      <MdVerified className="text-blue-500 w-4 h-4" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}