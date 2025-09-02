'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  MapPin, 
  Star, 
  Plus,
  Eye,
  Building,
  GraduationCap,
  Shield,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { signOut } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hostels, setHostels] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      // Fetch hostels and bookings based on user role
      const [hostelsRes, bookingsRes] = await Promise.all([
        fetch('/api/hostels'),
        fetch('/api/bookings')
      ])

      if (hostelsRes.ok) {
        const hostelsData = await hostelsRes.json()
        setHostels(hostelsData.data || [])
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">k-H</div>
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-foreground">
                k-H
              </Link>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.role === 'student' && <GraduationCap className="w-3 h-3 mr-1" />}
                {user.role === 'agent' && <Building className="w-3 h-3 mr-1" />}
                {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {user.firstName}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'student' && 'Manage your hostel bookings and find new accommodations'}
            {user.role === 'agent' && 'Manage your hostel listings and booking requests'}
            {user.role === 'admin' && 'Oversee platform operations and verify agents'}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            {user.role === 'student' && (
              <>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">My Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="hostels" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Browse</span>
                </TabsTrigger>
              </>
            )}
            {user.role === 'agent' && (
              <>
                <TabsTrigger value="listings" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">My Listings</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Requests</span>
                </TabsTrigger>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <TabsTrigger value="agents" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Agents</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {user.role === 'student' && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{bookings.length}</div>
                      <p className="text-xs text-muted-foreground">All time bookings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {bookings.filter((b: any) => b.status === 'pending').length}
                      </div>
                      <p className="text-xs text-muted-foreground">Awaiting response</p>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {user.role === 'agent' && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Listings</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{hostels.length}</div>
                      <p className="text-xs text-muted-foreground">Active properties</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Booking Requests</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{bookings.length}</div>
                      <p className="text-xs text-muted-foreground">Total requests</p>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.verifiedStatus ? 'Verified' : 'Pending'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.role === 'agent' && !user.verifiedStatus 
                      ? 'Awaiting admin verification'
                      : 'Account in good standing'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest {user.role === 'student' ? 'bookings' : 'activities'} and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {user.role === 'student' 
                        ? 'Start by browsing hostels and making your first booking'
                        : 'Your booking requests will appear here'
                      }
                    </p>
                    {user.role === 'student' && (
                      <Link href="/hostels">
                        <Button>Browse Hostels</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{booking.hostel?.title || 'Hostel Booking'}</h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.preferredDate 
                                ? new Date(booking.preferredDate).toLocaleDateString()
                                : 'Date not specified'
                              }
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student-specific tabs */}
          {user.role === 'student' && (
            <>
              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Bookings</CardTitle>
                    <CardDescription>
                      Manage your hostel inspection bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start by browsing hostels and booking inspections
                        </p>
                        <Link href="/hostels">
                          <Button>Browse Hostels</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking: any) => (
                          <Card key={booking.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-2">
                                    {booking.hostel?.title || 'Hostel Booking'}
                                  </h3>
                                  <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      {booking.preferredDate 
                                        ? new Date(booking.preferredDate).toLocaleDateString()
                                        : 'Date not specified'
                                      }
                                      {booking.preferredTime && ` at ${booking.preferredTime}`}
                                    </div>
                                    {booking.message && (
                                      <p className="mt-2">{booking.message}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant={
                                  booking.status === 'confirmed' ? 'default' :
                                  booking.status === 'pending' ? 'secondary' :
                                  'outline'
                                }>
                                  {booking.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hostels" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Browse Hostels</CardTitle>
                    <CardDescription>
                      Find and book hostel inspections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Explore Available Hostels</h3>
                      <p className="text-muted-foreground mb-4">
                        Browse through verified hostels near your university
                      </p>
                      <Link href="/hostels">
                        <Button size="lg">
                          <Search className="w-4 h-4 mr-2" />
                          Browse Hostels
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Agent-specific tabs */}
          {user.role === 'agent' && (
            <>
              <TabsContent value="listings" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Hostel Listings</CardTitle>
                      <CardDescription>
                        Manage your property listings
                      </CardDescription>
                    </div>
                    <Link href="/hostels/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Hostel
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {hostels.length === 0 ? (
                      <div className="text-center py-8">
                        <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start by adding your first hostel listing
                        </p>
                        <Link href="/hostels/create">
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Hostel
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hostels.map((hostel: any) => (
                          <Card key={hostel.id} className="overflow-hidden">
                            {hostel.images?.[0] && (
                              <img 
                                src={hostel.images[0]} 
                                alt={hostel.title}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-2">{hostel.title}</h3>
                              <div className="flex items-center text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{hostel.location?.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold">₦{hostel.price?.toLocaleString()}</span>
                                <Badge variant={hostel.availability ? 'default' : 'secondary'}>
                                  {hostel.availability ? 'Available' : 'Unavailable'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Requests</CardTitle>
                    <CardDescription>
                      Manage inspection requests from students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                        <p className="text-muted-foreground">
                          Booking requests from students will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking: any) => (
                          <Card key={booking.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-2">
                                    {booking.student?.firstName} {booking.student?.lastName}
                                  </h3>
                                  <div className="space-y-2 text-sm text-muted-foreground">
                                    <div>Email: {booking.student?.email}</div>
                                    <div>Phone: {booking.student?.phone}</div>
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Preferred: {booking.preferredDate 
                                        ? new Date(booking.preferredDate).toLocaleDateString()
                                        : 'Flexible'
                                      }
                                      {booking.preferredTime && ` at ${booking.preferredTime}`}
                                    </div>
                                    {booking.message && (
                                      <p className="mt-2 italic">"{booking.message}"</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  <Badge variant={
                                    booking.status === 'confirmed' ? 'default' :
                                    booking.status === 'pending' ? 'secondary' :
                                    'outline'
                                  }>
                                    {booking.status}
                                  </Badge>
                                  {booking.status === 'pending' && (
                                    <Button size="sm">Respond</Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Role:</strong> {user.role}</div>
                      <div><strong>Status:</strong> 
                        <Badge variant={user.verifiedStatus ? 'default' : 'secondary'} className="ml-2">
                          {user.verifiedStatus ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Account Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}