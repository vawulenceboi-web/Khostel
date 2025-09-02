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
        console.log('✅ API Response:', data)
        
        if (data.success && Array.isArray(data.data)) {
          setHostels(data.data)
          console.log('✅ Hostels loaded:', data.data.length)
        } else {
          console.error('❌ Invalid API response structure:', data)
          setHostels([])
        }
      } else {
        console.error('❌ Hostels API failed:', response.status)
        setHostels([])
      }
    } catch (error) {
      console.error('❌ Error fetching hostels:', error)
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
      {/* Navigation */}
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
                    {session.user.firstName}
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

        {/* Debug Information */}
        <div className="mb-4 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm">
            <strong>Debug:</strong> API Status: Working ✅ | Hostels in State: {hostels.length}
          </p>
        </div>

        {/* Hostels Display */}
        {hostels.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">No Hostels Available</h3>
              <p className="text-muted-foreground">
                No hostels found. Check if locations are properly set up in the database.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel, index) => {
              // Log each hostel being rendered
              console.log(`🏠 Rendering hostel ${index + 1}:`, hostel)
              
              return (
                <Card key={hostel?.id || `hostel-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Hostel Image */}
                  {hostel?.images && Array.isArray(hostel.images) && hostel.images.length > 0 && (
                    <img 
                      src={hostel.images[0]} 
                      alt={hostel?.title || 'Hostel'}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">
                      {hostel?.title || 'Untitled Hostel'}
                    </h3>
                    
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {hostel?.location?.name || 'Location not specified'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-bold text-primary">
                        ₦{(hostel?.price || 0).toLocaleString()}
                        <span className="text-sm text-muted-foreground font-normal">
                          /{hostel?.price_type || 'semester'}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {hostel?.room_type || 'Unknown'}
                      </Badge>
                    </div>

                    {hostel?.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {hostel.description}
                      </p>
                    )}

                    {/* Book Inspection Button */}
                    <div className="mb-3">
                      <Button 
                        className="w-full"
                        onClick={() => handleBookInspection(hostel?.id || '')}
                        disabled={!session?.user || session.user.role !== 'student'}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {!session?.user ? 'Sign In to Book' : 'Book Inspection'}
                      </Button>
                    </div>

                    {/* Agent and Time Info */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        {hostel?.agent?.verified_status && (
                          <Link href={`/agents/${hostel.agent.id}`}>
                            <div className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <span className="font-medium">
                                {hostel.agent.first_name} {hostel.agent.last_name}
                              </span>
                              <InstagramVerificationBadge 
                                verified={hostel.agent.verified_status} 
                                size="sm" 
                                className="ml-1"
                              />
                            </div>
                          </Link>
                        )}
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Posted recently
                        </div>
                      </div>
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