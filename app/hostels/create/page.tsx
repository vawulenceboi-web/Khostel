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
import SimpleMediaUpload from '@/components/SimpleMediaUpload'

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
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<string[]>([])
  const [uploadedMediaTypes, setUploadedMediaTypes] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

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
        console.log('📍 Locations API response:', locationsData)
        setLocations(locationsData.data || [])
        console.log('📍 Locations set in state:', locationsData.data?.length || 0)
      } else {
        console.error('❌ Locations API failed:', locationsRes.status)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
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

    console.log('📊 Validation check - uploadedMediaUrls:', uploadedMediaUrls)
    console.log('📊 Validation check - uploadedMediaTypes:', uploadedMediaTypes)
    
    if (uploadedMediaUrls.length === 0) {
      toast.error('At least one photo or video is required')
      console.log('❌ Validation failed: No uploaded media URLs found')
      return
    }

    setIsLoading(true)

    try {
      const hostelData = {
        ...formData,
        price: parseFloat(formData.price),
        agentId: session?.user?.id,
        images: uploadedMediaUrls, // Backward compatibility
        mediaUrls: uploadedMediaUrls,
        mediaTypes: uploadedMediaTypes
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
    <div className="min-h-screen bg-gray-50">
      {/* Modern Dynamic Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6">
            {/* Left Section */}
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Create Hostel Listing</h1>
                  <p className="text-xs sm:text-sm text-gray-500">Add your property to attract students</p>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">
                <Plus className="w-3 h-3 mr-1" />
                New Listing
              </Badge>
              <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready to publish</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">List Your Hostel</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                  Create a detailed listing to attract students. Include high-quality photos and videos.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Basic Information</h3>
                </div>
                
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
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Location & Pricing</h3>
                </div>
                
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
                            {location.name} {location.school?.name && `(${location.school.name})`}
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
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">3</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Photos & Videos</h3>
                </div>
                
                <SimpleMediaUpload 
                  uploadedUrls={uploadedMediaUrls}
                  uploadedTypes={uploadedMediaTypes}
                  onUrlsChange={(urls, types) => {
                    console.log('📊 SimpleMediaUpload - URLs received:', urls)
                    console.log('📊 SimpleMediaUpload - Types received:', types)
                    setUploadedMediaUrls(urls)
                    setUploadedMediaTypes(types)
                  }}
                />
              </div>

              {/* Amenities */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">4</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Amenities</h3>
                </div>
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
              <div className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mt-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="hidden sm:inline">Creating Listing...</span>
                        <span className="sm:hidden">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Publish Hostel Listing</span>
                        <span className="sm:hidden">Publish Listing</span>
                      </>
                    )}
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  By publishing, you agree to our terms and conditions
                </p>
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