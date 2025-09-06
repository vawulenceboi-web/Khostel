'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, CheckCircle, Search, Star } from "lucide-react"
import { MdVerified } from "react-icons/md"
import { useAuth } from '@/app/providers/auth-provider'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import HostelSearch from "@/components/HostelSearch"

export default function HostelsClient() {
  const { user: authUser, session } = useAuth()
  const searchParams = useSearchParams()

  // Debug what user data we're getting
  console.log('🏠 HOSTELS DEBUG: Auth user:', {
    authUser: !!authUser,
    session: !!session,
    authUserRole: authUser?.user_metadata?.role,
    sessionUserRole: session?.user?.user_metadata?.role
  })

  // Define the hostel type
  interface Hostel {
    id: string
    title: string
    description: string
    price_per_semester: number
    price: number // Used for display
    price_type: string
    room_type: string
    address: string
    amenities: string[]
    images: string[] // From media_urls
    media_urls: string[]
    availability: boolean
    agent_id: string
    created_at: string
    last_updated: string
    location: {
      id: string
      name: string
      latitude: number
      longitude: number
      school_id: string
    }
    agent: {
      id: string
      first_name: string
      last_name: string
      phone: string
      verified_status: boolean
      profile_image_url: string
      average_rating?: number
      total_ratings?: number
    }
  }
  
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'price-low', 'price-high'

  // Get unique values from hostels
  const uniqueLocations = [...new Set(hostels.map(h => h.location?.name).filter(Boolean))]
  const uniqueRoomTypes = [...new Set(hostels.map(h => h.room_type).filter(Boolean))]

  // Complete filter and sort system
  const filteredAndSortedHostels = (hostels || [])
    .filter((h) => {
      const matchesSearch = 
        h?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h?.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h?.agent?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h?.agent?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesLocation = !selectedLocation || h?.location?.name === selectedLocation
      const matchesRoomType = !selectedRoomType || h?.room_type === selectedRoomType
      
      const matchesMinPrice = !minPrice || h.price_per_semester >= Number(minPrice)
      const matchesMaxPrice = !maxPrice || h.price_per_semester <= Number(maxPrice)
      
      return matchesSearch && matchesLocation && matchesRoomType && matchesMinPrice && matchesMaxPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price_per_semester - b.price_per_semester
        case 'price-high':
          return b.price_per_semester - a.price_per_semester
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  useEffect(() => {
    fetchHostels()
  }, [])

  // REAL-TIME: Refetch when search params change (your method)
  useEffect(() => {
    console.log('🔄 URL params changed, refetching hostels...')
    fetchHostels()
  }, [searchParams])

  const fetchHostels = async () => {
    try {
      // Get URL params for your backend filtering method
      const urlParams = new URLSearchParams(window.location.search)
      const apiUrl = `/api/hostels?${urlParams.toString()}`
      
      console.log('🔍 Fetching with URL params:', apiUrl)
      const response = await fetch(apiUrl)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response:', data)
        
        if (data.success && Array.isArray(data.data)) {
          setHostels(data.data)
          console.log('🔍 First hostel agent rating data:', data.data[0]?.agent)
        }
      }
    } catch (error) {
      console.error('❌ Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Add booking function
  const handleBookInspection = async (hostelId: string) => {
    if (!authUser || !session) {
      toast.error('Please sign in to book inspections')
      return
    }

    if (authUser?.user_metadata?.role !== 'student') {
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

  // Step 7: Fixed time formatting function
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Recently posted'
    
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      console.log('⏰ Time calculation:', {
        hostelDate: dateString,
        now: now.toISOString(),
        diffInSeconds,
        diffInHours: Math.floor(diffInSeconds / 3600)
      })

      if (diffInSeconds < 60) return 'Just posted'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
      return 'Posted recently'
    } catch (error) {
      console.log('❌ Time formatting error:', error)
      return 'Recently posted'
    }
  }

  const isNewPost = (dateString: string) => {
    if (!dateString) return false
    
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      return diffInHours <= 24
    } catch {
      return false
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
        {/* NEW: Your Clean Search Method (Testing) */}
        <HostelSearch />
        


        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {hostels.length} hostels
          </p>
        </div>

        {hostels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3>No hostels found</h3>
              {(searchTerm || selectedLocation || selectedRoomType || minPrice || maxPrice) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search terms
                </p>
              )}
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
                      disabled={!session || !authUser || authUser?.user_metadata?.role !== 'student'}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {!session ? 'Sign In to Book' : 'Book Inspection'}
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
                  
                  {/* Step 7: Add timestamp and agent info */}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Agent: {hostel.agent?.first_name} {hostel.agent?.last_name}</span>
                        {hostel.agent?.verified_status && (
                          <MdVerified className="text-blue-500 w-4 h-4" />
                        )}
                        {/* Agent Rating Display - YOUR METHOD */}
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500 text-sm">
                            {"★".repeat(Math.round(hostel.agent?.average_rating || 0))}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {"★".repeat(5 - Math.round(hostel.agent?.average_rating || 0))}
                          </span>
                          <span className="ml-1 text-xs text-gray-600">
                            {hostel.agent?.average_rating || 0} ({hostel.agent?.total_ratings || 0} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(hostel.created_at)}
                        {isNewPost(hostel.created_at) && (
                          <CheckCircle className="w-3 h-3 ml-1 text-green-600" />
                        )}
                      </div>
                    </div>
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