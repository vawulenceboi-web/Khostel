'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InstagramVerificationBadge } from "@/components/ui/verification-badge"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Home, 
  Star,
  Clock,
  Eye,
  Building,
  Users,
  TrendingUp,
  Camera,
  Video,
  CheckCircle
} from "lucide-react"
import { toast } from 'sonner'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/timeUtils'
import VirusMorphLoader from '@/components/VirusMorphLoader'

interface AgentProfile {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  address: string
  cacNumber: string
  profileImage: string
  facePhoto: string
  isVerified: boolean
  isFaceVerified: boolean
  joinedDate: string
  stats: {
    totalListings: number
    availableListings: number
    averagePrice: number
    locations: string[]
    hasVideo: boolean
  }
  hostels: any[]
}

export default function AgentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [agent, setAgent] = useState<AgentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'about'>('listings')

  const agentId = params.agentId as string

  useEffect(() => {
    if (agentId) {
      fetchAgentProfile()
    }
  }, [agentId])

  const fetchAgentProfile = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`)
      
      if (response.ok) {
        const data = await response.json()
        setAgent(data.data)
        console.log('👤 Agent profile loaded:', data.data.fullName)
      } else {
        toast.error('Agent not found or not verified')
        router.push('/hostels')
      }
    } catch (error) {
      console.error('Error fetching agent profile:', error)
      toast.error('Failed to load agent profile')
      router.push('/hostels')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <VirusMorphLoader size={150} color="#10B981" duration={2400} />
          <div className="mt-6">
            <div className="text-2xl font-bold text-black mb-2">Agent Profile</div>
            <div className="text-gray-600">Loading agent details...</div>
            <div className="text-sm text-gray-400 mt-2">Fetching listings & verification</div>
          </div>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This agent profile is not available or not verified.
          </p>
          <Link href="/hostels">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hostels
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="text-lg font-semibold truncate mx-4">
              {agent.fullName}
            </div>
            
            <div className="flex items-center space-x-2">
              {agent.isVerified && (
                <InstagramVerificationBadge verified={true} size="sm" />
              )}
              <Badge variant="outline" className="text-xs">
                Agent
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Agent Profile Header - Mobile Optimized */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex justify-center sm:justify-start">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-border bg-secondary">
                    {agent.profileImage || agent.facePhoto ? (
                      <img
                        src={agent.profileImage || agent.facePhoto}
                        alt={agent.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.fullName)}&background=random`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Verification Badge */}
                  {agent.isVerified && (
                    <div className="absolute -bottom-1 -right-1">
                      <InstagramVerificationBadge verified={true} size="lg" />
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">{agent.fullName}</h1>
                  {agent.isVerified && (
                    <div className="flex items-center justify-center sm:justify-start">
                      <InstagramVerificationBadge verified={true} size="md" />
                      <span className="text-sm text-blue-600 font-medium ml-2">Verified Agent</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-6">
                  {agent.phone && (
                    <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{agent.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{agent.email}</span>
                  </div>
                  
                  {agent.cacNumber && (
                    <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm font-mono">CAC: {agent.cacNumber}</span>
                    </div>
                  )}
                  
                  {agent.address && (
                    <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{agent.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center sm:justify-start text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">
                      Joined {new Date(agent.joinedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>

                  {/* Agent Rating Display - YOUR METHOD */}
                  {(agent as any).avg_rating > 0 && (
                    <div className="flex items-center justify-center sm:justify-start mt-2">
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-xl">
                          {"★".repeat(Math.round((agent as any).avg_rating))}
                        </span>
                        <span className="text-gray-400 text-xl">
                          {"★".repeat(5 - Math.round((agent as any).avg_rating))}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {(agent as any).avg_rating} ({(agent as any).total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{agent.stats.totalListings}</div>
                    <div className="text-xs text-muted-foreground">Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{agent.stats.availableListings}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {agent.stats.locations.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Areas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ₦{agent.stats.averagePrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Price</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                className="flex-1"
                onClick={() => window.open(`tel:${agent.phone}`, '_self')}
                disabled={!agent.phone}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Agent
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(`mailto:${agent.email}?subject=k-H Hostel Inquiry`, '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-secondary rounded-lg p-1">
          <Button
            variant={activeTab === 'listings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('listings')}
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Listings ({agent.stats.totalListings})
          </Button>
          <Button
            variant={activeTab === 'about' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('about')}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            About
          </Button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {agent.hostels.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Listings Available</h3>
                  <p className="text-muted-foreground">
                    This agent hasn't posted any hostels yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agent.hostels.map((hostel) => (
                  <Card key={hostel.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <Link href={`/hostels/${hostel.id}`}>
                      {/* Hostel Image */}
                      <div className="aspect-video bg-secondary relative overflow-hidden">
                        {hostel.images?.[0] || hostel.mediaUrls?.[0] ? (
                          <img
                            src={hostel.images?.[0] || hostel.mediaUrls?.[0]}
                            alt={hostel.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Media Type Badges */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {hostel.mediaTypes?.includes('video') && (
                            <Badge variant="secondary" className="text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                          {hostel.isNew && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>

                        {/* Availability Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant={hostel.availability ? 'default' : 'secondary'}>
                            {hostel.availability ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {hostel.title}
                        </h3>
                        
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-sm truncate">
                            {hostel.location?.name || 'Location not specified'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl font-bold text-primary">
                            ₦{hostel.price.toLocaleString()}
                            <span className="text-sm text-muted-foreground font-normal">
                              /{hostel.priceType}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {hostel.roomType}
                          </Badge>
                        </div>

                        {hostel.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {hostel.description}
                          </p>
                        )}

                        {/* Amenities Preview */}
                        {hostel.amenities && hostel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {hostel.amenities.slice(0, 3).map((amenity: string) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {hostel.amenities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{hostel.amenities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {hostel.timeAgo}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Agent</CardTitle>
                <CardDescription>
                  Verified property agent information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Verification Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Business Verified</h4>
                      <p className="text-sm text-green-600">
                        CAC registration confirmed
                      </p>
                    </CardContent>
                  </Card>
                  
                  {agent.isFaceVerified && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-blue-800">Identity Verified</h4>
                        <p className="text-sm text-blue-600">
                          Face verification completed
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Agent Statistics */}
                <div>
                  <h4 className="font-semibold mb-4">Property Statistics</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <div className="text-xl font-bold">{agent.stats.totalListings}</div>
                      <div className="text-xs text-muted-foreground">Total Properties</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{agent.stats.availableListings}</div>
                      <div className="text-xs text-muted-foreground">Available Now</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{agent.stats.locations.length}</div>
                      <div className="text-xs text-muted-foreground">Locations</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        ₦{agent.stats.averagePrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Price</div>
                    </div>
                  </div>
                </div>

                {/* Service Areas */}
                {agent.stats.locations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Service Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.stats.locations.map((location, index) => (
                        <Badge key={index} variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trust Indicators */}
                <div>
                  <h4 className="font-semibold mb-3">Trust & Safety</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span className="font-medium">Business Registration Verified</span>
                      </div>
                      <InstagramVerificationBadge verified={true} size="sm" />
                    </div>
                    
                    {agent.isFaceVerified && (
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-blue-600 mr-3" />
                          <span className="font-medium">Identity Verification Completed</span>
                        </div>
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                        <span className="font-medium">Active Property Agent</span>
                      </div>
                      <Badge variant="default">
                        {Math.floor((new Date().getTime() - new Date(agent.joinedDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}