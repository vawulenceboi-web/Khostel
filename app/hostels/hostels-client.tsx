'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  MapPin, 
  Search, 
  Filter, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  AlertTriangle 
} from "lucide-react"
import { toast } from 'sonner'
import { InstagramVerificationBadge } from '@/components/ui/verification-badge'

export default function HostelsClient() {
  const { data: session } = useSession()
  const [hostels, setHostels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<any[]>([])
  const [filters, setFilters] = useState({
    search: '',
    locationId: '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    availability: 'true'
  })

  useEffect(() => {
    fetchHostels()
    fetchLocations()
  }, [])

  const fetchHostels = async () => {
    try {
      console.log('🏠 Fetching hostels from API...')
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value)
      })

      const response = await fetch(`/api/hostels?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response successful')
        console.log('✅ Hostels count:', data.data?.length || 0)
        
        if (data.success && Array.isArray(data.data)) {
          setHostels(data.data)
        } else {
          console.error('❌ Invalid API response structure')
          setHostels([])
        }
      } else {
        console.error('❌ API failed:', response.status)
        setHostels([])
      }
    } catch (error) {
      console.error('❌ Fetch error:', error)
      setHostels([])
    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const handleBookInspection = async (hostelId: string) => {
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
      console.error('Booking error:', error)
      toast.error('Failed to book inspection')
    }
  }

  // Safe time formatting function
  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return 'Recently posted'
    
    try {
      const now = new Date()
      const date = new Date(dateString)
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 1) return 'Just posted'
      if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
      return 'Posted recently'
    } catch {
      return 'Recently posted'
    }
  }

  // Safe new post detection
  const isNewPost = (dateString: string): boolean => {
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading hostels...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-xl font-bold">k-H</span>
              </Link>
              <span className="text-lg font-semibold text-muted-foreground">Browse Hostels</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/agents">
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">View Agents</span>
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 ml-auto">
              {session?.user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {session.user.firstName || session.user.name}
                  </span>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hostels..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            <Select value={filters.locationId} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, locationId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.roomType} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, roomType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="single">Single Room</SelectItem>
                <SelectItem value="shared">Shared Room</SelectItem>
                <SelectItem value="self-contain">Self-Contain</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchHostels} className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Professional Hostels Display */}
        {hostels.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">No Hostels Available</h3>
              <p className="text-muted-foreground">
                No hostels found. Please check back later or adjust your search filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel, index) => {
              // CAREFULLY extract each property with EXACT field names from API
              const hostelId = hostel?.id || `hostel-${index}`
              const title = hostel?.title || 'Untitled Hostel'
              const description = hostel?.description || ''
              const price = hostel?.price || 0
              const priceType = hostel?.price_type || 'semester'  // EXACT: price_type from API
              const roomType = hostel?.room_type || 'Unknown'     // EXACT: room_type from API
              const address = hostel?.address || ''
              const availability = hostel?.availability || false
              const images = hostel?.images || []
              const amenities = hostel?.amenities || []
              const createdAt = hostel?.created_at || ''
              
              // CAREFULLY extract location data
              const location = hostel?.location || {}
              const locationName = location?.name || 'Location not specified'
              
              // CAREFULLY extract agent data with EXACT field names
              const agent = hostel?.agent || {}
              const agentId = agent?.id || ''
              const agentFirstName = agent?.first_name || ''      // EXACT: first_name from API
              const agentLastName = agent?.last_name || ''        // EXACT: last_name from API
              const agentVerified = agent?.verified_status || false // EXACT: verified_status from API
              const agentProfileImage = agent?.profile_image_url || ''

              console.log(`🏠 Rendering hostel ${index + 1}: ${title}`)

              return (
                <Card key={hostelId} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Professional Hostel Image */}
                  {images && Array.isArray(images) && images.length > 0 && (
                    <div className="relative">
                      <img 
                        src={images[0]} 
                        alt={title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {isNewPost(createdAt) && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="default" className="bg-green-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant={availability ? 'default' : 'secondary'}>
                          {availability ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Hostel Title */}
                    <h3 className="font-bold text-xl mb-3 line-clamp-2">
                      {title}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {locationName}
                      </span>
                    </div>

                    {/* Price and Room Type */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary">
                        ₦{price.toLocaleString()}
                        <span className="text-sm text-muted-foreground font-normal ml-1">
                          /{priceType}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {roomType}
                      </Badge>
                    </div>

                    {/* Description */}
                    {description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {description}
                      </p>
                    )}

                    {/* Amenities */}
                    {amenities && Array.isArray(amenities) && amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {amenities.slice(0, 4).map((amenity, amenityIndex) => (
                          <Badge key={amenityIndex} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {amenities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{amenities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Book Inspection Button */}
                    <div className="mb-4">
                      <Button 
                        className="w-full h-12"
                        onClick={() => handleBookInspection(hostelId)}
                        disabled={!session?.user || session.user.role !== 'student' || !availability}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {!session?.user ? 'Sign In to Book' : 
                         !availability ? 'Currently Unavailable' :
                         'Book Inspection'}
                      </Button>
                    </div>

                    {/* Agent Information and Time */}
                    <div className="border-t border-border pt-4 space-y-3">
                      {/* Agent Profile with Instagram Badge */}
                      <div className="flex items-center justify-between">
                        {agentVerified && agentId && (
                          <Link href={`/agents/${agentId}`}>
                            <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                              <span className="font-medium">
                                {agentFirstName} {agentLastName}
                              </span>
                              <InstagramVerificationBadge 
                                verified={agentVerified} 
                                size="sm" 
                                className="ml-2"
                              />
                            </div>
                          </Link>
                        )}
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(createdAt)}
                        </div>
                      </div>
                      
                      {/* Professional Trust Indicator */}
                      {agentVerified && !agentProfileImage && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-yellow-800">
                                Agent is verified but no profile photo
                              </p>
                              <p className="text-xs text-yellow-700">
                                We advise you to get to know them better in person before booking
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}