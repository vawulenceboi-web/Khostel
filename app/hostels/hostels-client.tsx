'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, CheckCircle, Search, Star } from "lucide-react"
import { MdVerified } from "react-icons/md"
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import HostelSearch from "@/components/HostelSearch"

export default function HostelsClient() {
  const { data: session } = useSession()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'price-low', 'price-high'

  // Get unique values from hostels
  const uniqueLocations = [...new Set((hostels || []).map(h => h?.location?.name).filter(Boolean))]
  const uniqueRoomTypes = [...new Set((hostels || []).map(h => h?.room_type).filter(Boolean))]

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
      
      const price = parseFloat(h?.price_per_semester || 0)
      const matchesMinPrice = !minPrice || price >= parseFloat(minPrice)
      const matchesMaxPrice = !maxPrice || price <= parseFloat(maxPrice)
      
      return matchesSearch && matchesLocation && matchesRoomType && matchesMinPrice && matchesMaxPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a?.price_per_semester || 0) - parseFloat(b?.price_per_semester || 0)
        case 'price-high':
          return parseFloat(b?.price_per_semester || 0) - parseFloat(a?.price_per_semester || 0)
        case 'newest':
        default:
          return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
      }
    })

  useEffect(() => {
    fetchHostels()
  }, [])

  // Listen for URL changes to refetch data (your method)
  useEffect(() => {
    const handlePopState = () => {
      fetchHostels()
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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

  // Step 7: Fixed time formatting function
  const formatTimeAgo = (dateString) => {
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

  const isNewPost = (dateString) => {
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
        
        {/* OLD: Existing system (keeping for now) - Comment out to test new one */}
        {/* 
        <div className="mb-6 space-y-4">
          {/* Row 1: Search + Location + Room Type */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hostels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Location Filter */}
            <div className="sm:w-48">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black text-sm"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type Filter */}
            <div className="sm:w-48">
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black text-sm"
              >
                <option value="">All Room Types</option>
                {uniqueRoomTypes.map((roomType) => (
                  <option key={roomType} value={roomType}>
                    {roomType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price Range + Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Price Range */}
            <div className="flex gap-2 flex-1 max-w-md">
              <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="flex-1 h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black text-sm"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="flex-1 h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black text-sm"
              />
            </div>

            {/* Sort Options */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedLocation('')
                setSelectedRoomType('')
                setMinPrice('')
                setMaxPrice('')
                setSortBy('newest')
              }}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 rounded-md transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        */}

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