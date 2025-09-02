'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Plus, 
  X, 
  MapPin, 
  Camera, 
  Video, 
  Home,
  ArrowLeft,
  Save,
  Eye,
  Trash2
} from "lucide-react"
import { toast } from 'sonner'
import Link from 'next/link'

export default function CreateHostelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'semester' as 'semester' | 'year',
    roomType: 'single' as 'single' | 'shared' | 'self-contain',
    locationId: '',
    address: '',
    amenities: [] as string[],
    mediaUrls: [] as string[],
    mediaTypes: [] as string[],
    availability: true
  })
  const [locations, setLocations] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'agent') {
        toast.error('Only agents can create hostel listings')
        router.push('/dashboard')
        return
      }

      if (!session?.user?.verifiedStatus) {
        toast.error('You must be verified to create hostel listings')
        router.push('/dashboard')
        return
      }

      fetchSchoolsAndLocations()
    }
  }, [status, session, router])

  const fetchSchoolsAndLocations = async () => {
    try {
      const [schoolsRes, locationsRes] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/locations')
      ])

      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json()
        setSchools(schoolsData.data || [])
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json()
        setLocations(locationsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const addMedia = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Please enter a valid media URL')
      return
    }

    // Basic URL validation
    try {
      new URL(newMediaUrl)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, newMediaUrl.trim()],
      mediaTypes: [...prev.mediaTypes, newMediaType]
    }))

    setNewMediaUrl('')
    toast.success(`${newMediaType === 'image' ? 'Photo' : 'Video'} added successfully`)
  }

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index),
      mediaTypes: prev.mediaTypes.filter((_, i) => i !== index)
    }))
    toast.success('Media removed')
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Hostel title is required')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required')
      return
    }

    if (!formData.locationId) {
      toast.error('Location is required')
      return
    }

    if (formData.mediaUrls.length === 0) {
      toast.error('At least one photo or video is required')
      return
    }

    setIsLoading(true)

    try {
      const hostelData = {
        ...formData,
        price: parseFloat(formData.price),
        agentId: session?.user?.id,
        images: formData.mediaUrls, // Backward compatibility
        media_urls: formData.mediaUrls,
        media_types: formData.mediaTypes
      }

      const response = await fetch('/api/hostels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hostelData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Hostel listing created successfully!')
        router.push('/dashboard')
      } else {
        toast.error(result.message || 'Failed to create hostel listing')
      }
    } catch (error) {
      console.error('Error creating hostel:', error)
      toast.error('Failed to create hostel listing')
    } finally {
      setIsLoading(false)
    }
  }

  const commonAmenities = [
    'WiFi', 'Air Conditioning', 'Kitchen', 'Laundry', 'Security', 'Parking',
    'Study Room', 'Common Area', 'Backup Generator', 'Water Supply', 
    'Cleaning Service', 'CCTV', 'Furnished', 'Balcony'
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="text-2xl font-bold text-foreground">Create Hostel Listing</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="default">
                <Home className="w-3 h-3 mr-1" />
                New Listing
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>List Your Hostel</CardTitle>
            <CardDescription>
              Create a detailed listing to attract students. Include high-quality photos and videos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Hostel Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Modern Student Apartment at Westend"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomType">Room Type *</Label>
                    <Select value={formData.roomType} onValueChange={(value: any) => 
                      setFormData(prev => ({ ...prev, roomType: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Room</SelectItem>
                        <SelectItem value="shared">Shared Room</SelectItem>
                        <SelectItem value="self-contain">Self-Contain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your hostel, its features, and what makes it special..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              {/* Location & Pricing */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Location & Pricing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationId">Location *</Label>
                    <Select value={formData.locationId} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, locationId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hostel area" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="Complete street address"
                        className="pl-10"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₦) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="150000"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceType">Price Period *</Label>
                    <Select value={formData.priceType} onValueChange={(value: any) => 
                      setFormData(prev => ({ ...prev, priceType: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semester">Per Semester</SelectItem>
                        <SelectItem value="year">Per Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Media Upload */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Photos & Videos</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Paste photo or video URL here"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={newMediaType} onValueChange={(value: any) => setNewMediaType(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">
                            <div className="flex items-center">
                              <Camera className="w-4 h-4 mr-2" />
                              Photo
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center">
                              <Video className="w-4 h-4 mr-2" />
                              Video
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addMedia}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Media Preview */}
                  {formData.mediaUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.mediaUrls.map((url, index) => (
                        <Card key={index} className="relative">
                          <CardContent className="p-4">
                            <div className="aspect-video bg-secondary rounded-lg mb-3 overflow-hidden">
                              {formData.mediaTypes[index] === 'video' ? (
                                <video 
                                  src={url} 
                                  className="w-full h-full object-cover"
                                  controls
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Hostel media ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                {formData.mediaTypes[index] === 'video' ? (
                                  <Video className="w-3 h-3 mr-1" />
                                ) : (
                                  <Camera className="w-3 h-3 mr-1" />
                                )}
                                {formData.mediaTypes[index]}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMedia(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tips:</strong> Use high-quality photos and videos. Include room interiors, 
                    bathrooms, kitchen, and exterior views. Videos are great for virtual tours!
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {commonAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availability"
                    checked={formData.availability}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, availability: checked as boolean }))
                    }
                  />
                  <Label htmlFor="availability">
                    Available for booking
                  </Label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Creating Listing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Publish Hostel Listing
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const commonAmenities = [
  'WiFi', 'Air Conditioning', 'Kitchen', 'Laundry', 'Security', 'Parking',
  'Study Room', 'Common Area', 'Backup Generator', 'Water Supply', 
  'Cleaning Service', 'CCTV', 'Furnished', 'Balcony'
]