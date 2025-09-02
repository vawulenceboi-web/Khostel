'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Star, Wifi, Car, Utensils, Search, Filter, ArrowLeft, Calendar } from "lucide-react"
import { toast } from 'sonner'

interface Hostel {
  id: string
  title: string
  description: string
  price: number
  priceType: 'semester' | 'year'
  roomType: 'single' | 'shared' | 'self-contain'
  images: string[]
  amenities: string[]
  availability: boolean
  address: string
  location: {
    id: string
    name: string
    latitude: string
    longitude: string
  }
  agent: {
    id: string
    firstName: string
    lastName: string
    phone: string
    verifiedStatus: boolean
  }
}

export default function HostelsPage() {
  const { data: session } = useSession()
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
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
  }, [])

  const fetchHostels = async () => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value)
      })

      const response = await fetch(`/api/hostels?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setHostels(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching hostels:', error)
      toast.error('Failed to load hostels')
    } finally {
      setLoading(false)
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostelId,
          message: 'I would like to schedule an inspection for this hostel.',
        }),
      })

      if (response.ok) {
        toast.success('Inspection booked successfully!', {
          description: 'The agent will contact you soon to confirm the appointment.'
        })
      } else {
        const data = await response.json()
        toast.error('Booking failed', {
          description: data.message || 'Please try again'
        })
      }
    } catch (error) {
      toast.error('Booking failed', {
        description: 'An unexpected error occurred'
      })
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />
      case 'parking': return <Car className="h-4 w-4" />
      case 'kitchen': return <Utensils className="h-4 w-4" />
      default: return null
    }
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
            </div>
            
            <div className="flex items-center space-x-4">
              {session?.user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {session.user.firstName}
                  </span>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Find Student Hostels</h1>
          <p className="text-xl text-muted-foreground">
            Discover verified hostels near Nigerian universities
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-2 border-border/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search hostels..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={filters.roomType} onValueChange={(value) => setFilters(prev => ({ ...prev, roomType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any room type</SelectItem>
                    <SelectItem value="single">Single Room</SelectItem>
                    <SelectItem value="shared">Shared Room</SelectItem>
                    <SelectItem value="self-contain">Self Contain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchHostels} className="w-full h-10">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hostels Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading hostels...</div>
          </div>
        ) : hostels.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hostels found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((hostel) => (
              <Card key={hostel.id} className="overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 group">
                {hostel.images?.[0] && (
                  <img 
                    src={hostel.images[0]} 
                    alt={hostel.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-foreground line-clamp-2">{hostel.title}</h3>
                    <Badge variant={hostel.availability ? 'default' : 'secondary'}>
                      {hostel.availability ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{hostel.location?.name || 'Location not specified'}</span>
                  </div>
                  
                  {hostel.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {hostel.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-foreground">
                        ₦{hostel.price?.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm">/{hostel.priceType}</span>
                    </div>
                    <Badge variant="outline">
                      {hostel.roomType}
                    </Badge>
                  </div>
                  
                  {hostel.amenities && hostel.amenities.length > 0 && (
                    <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                      {hostel.amenities.slice(0, 3).map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </div>
                      ))}
                      {hostel.amenities.length > 3 && (
                        <span className="text-xs">+{hostel.amenities.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleBookInspection(hostel.id)}
                      disabled={!hostel.availability || !session?.user || session.user.role !== 'student'}
                      className="flex-1"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {!session?.user ? 'Sign In to Book' : 'Book Inspection'}
                    </Button>
                  </div>

                  {hostel.agent?.verifiedStatus && (
                    <div className="mt-3 flex items-center text-xs text-muted-foreground">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified Agent
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}