'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InstagramVerificationBadge } from "@/components/ui/verification-badge"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Home,
  Star,
  TrendingUp,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react"
import { toast } from 'sonner'
import Link from 'next/link'
import { Input } from "@/components/ui/input"

interface Agent {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  address: string
  profileImage: string
  facePhoto: string
  isVerified: boolean
  isFaceVerified: boolean
  joinedDate: string
  stats: {
    totalListings: number
    availableListings: number
    recentListings: number
  }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      
      if (response.ok) {
        const data = await response.json()
        setAgents(data.data || [])
        console.log('👥 Loaded verified agents:', data.data?.length)
      } else {
        toast.error('Failed to load agents')
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading verified agents...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/hostels">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Hostels</span>
                </Button>
              </Link>
              <div className="text-xl font-bold text-foreground">Verified Agents</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Agents Grid/List */}
        {filteredAgents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No Agents Found' : 'No Verified Agents'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No verified agents are available at the moment'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredAgents.map((agent) => (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  viewMode === 'list' ? 'hover:scale-[1.02]' : 'hover:scale-105'
                }`}>
                  <CardContent className={viewMode === 'grid' ? "p-6" : "p-4"}>
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col items-center text-center' : 'flex-row items-center'} gap-4`}>
                      {/* Profile Image */}
                      <div className="relative">
                        <div className={`${viewMode === 'grid' ? 'w-20 h-20' : 'w-16 h-16'} rounded-full overflow-hidden border-3 border-border bg-secondary flex-shrink-0`}>
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
                              <Users className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Instagram-style Verification Badge */}
                        {agent.isVerified && (
                          <div className="absolute -bottom-1 -right-1">
                            <InstagramVerificationBadge verified={true} size="md" />
                          </div>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className={`flex-1 ${viewMode === 'grid' ? 'text-center' : 'text-left'}`}>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                          <h3 className="text-lg font-bold">{agent.fullName}</h3>
                          {agent.isVerified && viewMode === 'list' && (
                            <InstagramVerificationBadge verified={true} size="sm" />
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1 mb-3">
                          {agent.phone && (
                            <div className={`flex items-center ${viewMode === 'grid' ? 'justify-center' : 'justify-start'} text-muted-foreground`}>
                              <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="text-sm">{agent.phone}</span>
                            </div>
                          )}
                          
                          {agent.address && (
                            <div className={`flex items-center ${viewMode === 'grid' ? 'justify-center' : 'justify-start'} text-muted-foreground`}>
                              <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="text-sm truncate">{agent.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className={`grid grid-cols-3 gap-2 ${viewMode === 'grid' ? 'text-center' : ''}`}>
                          <div>
                            <div className="text-lg font-bold text-primary">{agent.stats.totalListings}</div>
                            <div className="text-xs text-muted-foreground">Listings</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">{agent.stats.availableListings}</div>
                            <div className="text-xs text-muted-foreground">Available</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">{agent.stats.recentListings}</div>
                            <div className="text-xs text-muted-foreground">Recent</div>
                          </div>
                        </div>

                        {/* Verification Indicators */}
                        <div className={`flex ${viewMode === 'grid' ? 'justify-center' : 'justify-start'} gap-2 mt-3`}>
                          <Badge variant="default" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Verified Business
                          </Badge>
                          {agent.isFaceVerified && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              ID Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{agents.length}</div>
                <div className="text-sm text-muted-foreground">Verified Agents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {agents.reduce((sum, a) => sum + a.stats.availableListings, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Available Properties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {agents.filter(a => a.isFaceVerified).length}
                </div>
                <div className="text-sm text-muted-foreground">ID Verified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {agents.reduce((sum, a) => sum + a.stats.recentListings, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Recent Posts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Information */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-3">About Verified Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <InstagramVerificationBadge verified={true} size="sm" />
                  <span>Business registration verified</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Identity verification completed</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Active property management</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}