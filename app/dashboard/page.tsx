'use client'


import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Calendar, 
  Users, 
  MapPin, 
  Plus,
  Building,
  GraduationCap,
  Shield,
  Search,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  TrendingUp,
  Phone
} from "lucide-react"
import { InstagramVerificationBadge } from '@/components/ui/verification-badge'
import VirusMorphLoader from '@/components/VirusMorphLoader'
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload'
import Link from "next/link"
import { toast } from 'sonner'

interface Stats {
  totalHostels: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  availableHostels: number
  totalSchools: number
  myListings?: number
  myBookingRequests?: number
  pendingRequests?: number
  totalUsers?: number
  pendingAgents?: number
  verifiedAgents?: number
  totalStudents?: number
}

export default function DashboardPage() {
  const { user: authUser, session, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentHostels, setRecentHostels] = useState<any[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isResubmitting, setIsResubmitting] = useState(false)
  const [showProfileUpload, setShowProfileUpload] = useState(false)
  const [freshUserData, setFreshUserData] = useState<any>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    if (session && authUser) {
      fetchRealTimeData()
      fetchFreshUserData()
    }
  }, [session, authUser, router])

  const fetchRealTimeData = async () => {
    if (!session?.user) return
    
    try {
      console.log('📊 Fetching real-time dashboard data...')
      
      const [statsRes, hostelsRes, bookingsRes] = await Promise.all([
        fetch('/api/stats', { credentials: 'include' }),
        fetch('/api/hostels?limit=6', { credentials: 'include' }),
        fetch('/api/bookings?limit=5', { credentials: 'include' })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (hostelsRes.ok) {
        const hostelsData = await hostelsRes.json()
        setRecentHostels(hostelsData.data || [])
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setRecentBookings(bookingsData.data || [])
      }
      
    } catch (error) {
      console.error('❌ Error fetching real-time data:', error)
      // Don't show error toast, just log it
      setRecentHostels([])
      setRecentBookings([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchFreshUserData = async () => {
    console.log('🔄 DASHBOARD: fetchFreshUserData called')
    try {
      console.log('🔄 DASHBOARD: Fetching /api/user/profile...')
      const response = await fetch('/api/user/profile', {
        credentials: 'include', // Include cookies in request
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('🔄 DASHBOARD: Profile API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔄 DASHBOARD: Profile API response data:', data)
        console.log('🔄 DASHBOARD: Setting freshUserData with role:', data.data?.role)
        setFreshUserData(data.data)
        console.log('✅ DASHBOARD: freshUserData set successfully')
        console.log('🔄 Fresh user data loaded:', data.data.profileImage ? 'Has profile image' : 'No profile image')
        console.log('🔍 User banned status:', data.data.banned)
      } else {
        console.error('❌ DASHBOARD: Profile API failed with status:', response.status)
        const errorText = await response.text()
        console.error('❌ DASHBOARD: Profile API error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching fresh user data:', error)
    }
  }

  const handleResubmitVerification = async () => {
    setIsResubmitting(true)
    
    try {
      const response = await fetch('/api/agent/resubmit-verification', {
        method: 'POST',
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error(result.message || 'Resubmission failed')
      }
    } catch (error) {
      console.error('Resubmission error:', error)
      toast.error('Failed to resubmit verification')
    } finally {
      setIsResubmitting(false)
    }
  }

  const handleProfilePhotoUploaded = async (photoUrl: string) => {
    try {
      toast.success('Profile photo updated! Updating display...')
      
      // Immediately update the fresh user data with new photo
      setFreshUserData((prev: any) => ({
        ...prev,
        profileImage: photoUrl
      }))
      
      // Also refresh from database to be sure
      await fetchFreshUserData()
      
      console.log('✅ Profile photo updated in dashboard display')
      
    } catch (error) {
      console.error('Error updating profile display:', error)
      toast.error('Photo uploaded but display update failed. Please refresh the page.')
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <VirusMorphLoader size={170} color="#3B82F6" duration={2800} />
          <div className="mt-6">
            <div className="text-2xl font-bold text-black mb-2">k-H Dashboard</div>
            <div className="text-gray-600">Loading real-time data...</div>
            <div className="text-sm text-gray-500 mt-2">Syncing your profile & stats</div>
          </div>
        </div>
      </div>
    )
  }

  if (!authUser || !session) {
    return null
  }

  const { signOut } = useAuth()
  
  // Use fresh user data if available, otherwise fall back to session
  const user = freshUserData || authUser

  // DEBUG: Log what user data the dashboard is actually using
  console.log('🎯 DASHBOARD DEBUG: ===== USER DATA ANALYSIS =====')
  console.log('🎯 DASHBOARD DEBUG: freshUserData present:', !!freshUserData)
  console.log('🎯 DASHBOARD DEBUG: authUser present:', !!authUser)
  console.log('🎯 DASHBOARD DEBUG: Using freshUserData:', !!freshUserData)
  console.log('🎯 DASHBOARD DEBUG: Final user object:', {
    id: user?.id,
    email: user?.email,
    role: user?.role,
    verifiedStatus: user?.verifiedStatus,
    source: freshUserData ? 'custom_table' : 'supabase_auth'
  })
  
  if (freshUserData) {
    console.log('🎯 DASHBOARD DEBUG: freshUserData details:', {
      role: freshUserData.role,
      verifiedStatus: freshUserData.verifiedStatus,
      emailVerified: freshUserData.emailVerified
    })
  }
  
  if (authUser) {
    console.log('🎯 DASHBOARD DEBUG: authUser details:', {
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata
    })
  }

  // Safety check for essential user data
  if (!user?.id || !user?.email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Error</h2>
          <p className="text-muted-foreground mb-4">
            There was an issue loading your session. Please sign in again.
          </p>
          <Button onClick={signOut}>
            Sign In Again
          </Button>
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
              <Link href="/" className="text-2xl font-bold text-foreground">
                k-H
              </Link>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.role === 'student' && <GraduationCap className="w-3 h-3 mr-1" />}
                {user.role === 'agent' && <Building className="w-3 h-3 mr-1" />}
                {(user.role === 'student' && freshUserData?.userType === 'individual') && <User className="w-3 h-3 mr-1" />}
                {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                {freshUserData?.userType === 'individual' ? 'Individual' : (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User')}
                {user.verifiedStatus && <InstagramVerificationBadge verified={true} size="sm" className="ml-1" />}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.firstName || user.name || 'User'}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banned Agent Warning */}
        {user.role === 'agent' && freshUserData?.banned && (
          <Card className="mb-8 border-2 border-red-500 bg-red-50">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800">Account Suspended</h2>
                  <p className="text-red-600">Your agent account has been suspended by admin</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 mb-2">
                  <strong>Reason:</strong> Policy violation or administrative action
                </p>
                <p className="text-sm text-red-600">
                  Contact support if you believe this is an error. Your account access is temporarily restricted.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Profile Section (Top Priority) */}
        {user.role === 'agent' && !freshUserData?.banned && (
          <Card className="mb-8 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-secondary">
                    {(user?.profileImage || user?.facePhoto) ? (
                      <img
                        src={user.profileImage || user.facePhoto}
                        alt={user?.firstName || user?.name || 'Agent'}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('✅ Profile image loaded successfully:', user.profileImage || user.facePhoto)}
                        onError={(e) => {
                          console.log('❌ Profile image failed to load:', user.profileImage || user.facePhoto)
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || user?.name || 'Agent')}&background=random`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground" />
                        {/* No profile image found for user: {user?.email} */}
                      </div>
                    )}
                  </div>
                  
                  {/* Instagram-style Verification Badge */}
                  {user.verifiedStatus && (
                    <div className="absolute -bottom-2 -right-2">
                      <InstagramVerificationBadge verified={true} size="lg" />
                    </div>
                  )}
                </div>

                {/* Agent Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {user?.firstName || user?.name || 'Agent'} {user?.lastName || ''}
                    </h1>
                    {user?.verifiedStatus && (
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <InstagramVerificationBadge verified={true} size="md" />
                        <span className="text-sm font-semibold text-blue-600">Verified Agent</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-muted-foreground">{user?.email || 'No email'}</p>
                    {user?.phone && (
                      <p className="text-muted-foreground flex items-center justify-center sm:justify-start">
                        <Phone className="w-4 h-4 mr-2" />
                        {user.phone}
                      </p>
                    )}
                    {user?.address && (
                      <p className="text-muted-foreground flex items-center justify-center sm:justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        {user.address}
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-primary">{stats?.myListings || 0}</div>
                      <div className="text-xs text-muted-foreground">My Listings</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-600">{stats?.myBookingRequests || 0}</div>
                      <div className="text-xs text-muted-foreground">Requests</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">{stats?.pendingRequests || 0}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  {!user.verifiedStatus && (
                    <Card className="bg-yellow-50 border-yellow-200 mt-4">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-center sm:justify-start">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                          <span className="text-sm font-medium text-yellow-800">
                            Pending Verification - You can list properties after admin approval
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Profile Photo Trust Indicator for Agents */}
                  {user?.role === 'agent' && user?.verifiedStatus && !user?.profileImage && !user?.facePhoto && (
                    <Card className="bg-yellow-50 border-yellow-200 mt-4">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">
                              Upload your profile photo to gain more trust
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowProfileUpload(true)}
                          >
                            Upload Photo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Welcome Section for Non-Agents */}
        {user.role !== 'agent' && !freshUserData?.banned && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.firstName || user.name}
            </h1>
            <p className="text-muted-foreground">
              {user.role === 'student' && 'Manage your hostel bookings and discover new accommodations'}
              {(user.role === 'student' && freshUserData?.userType === 'individual') && 'Find and book accommodations as an individual'}
              {user.role === 'admin' && 'Oversee platform operations and verify agents'}
            </p>
          </div>
        )}

        {/* Real-Time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(user.role === 'student' || (user.role === 'student' && freshUserData?.userType === 'individual')) && stats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {freshUserData?.userType === 'individual' ? 'Total accommodation requests' : 'Total inspections booked'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
                  <p className="text-xs text-muted-foreground">Ready to visit</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Hostels</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.availableHostels}</div>
                  <p className="text-xs text-muted-foreground">Ready to book</p>
                </CardContent>
              </Card>
            </>
          )}
          
          {user.role === 'agent' && stats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Listings</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.myListings || 0}</div>
                  <p className="text-xs text-muted-foreground">Properties listed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Booking Requests</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.myBookingRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">Total requests</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">Need response</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.verifiedStatus ? 'Verified' : 'Pending'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.verifiedStatus ? 'Can list properties' : 'Awaiting admin approval'}
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {user.role === 'admin' && stats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Platform users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Agents</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingAgents || 0}</div>
                  <p className="text-xs text-muted-foreground">Need verification</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalHostels}</div>
                  <p className="text-xs text-muted-foreground">Platform listings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">Platform activity</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(user.role === 'student' || (user.role === 'student' && freshUserData?.userType === 'individual')) && (
                <>
                  <Link href="/hostels">
                    <Button className="w-full justify-start h-12">
                      <Search className="w-4 h-4 mr-2" />
                      {freshUserData?.userType === 'individual' ? 'Browse Available Accommodations' : 'Browse Available Hostels'}
                      <Badge variant="outline" className="ml-auto">
                        {stats?.availableHostels || 0} available
                      </Badge>
                    </Button>
                  </Link>
                  <Link href="/dashboard/bookings">
                    <Button variant="outline" className="w-full justify-start h-12">
                      <Calendar className="w-4 h-4 mr-2" />
                      {freshUserData?.userType === 'individual' ? 'Manage My Requests' : 'Manage My Bookings'}
                      <Badge variant="outline" className="ml-auto">
                        {stats?.totalBookings || 0} total
                      </Badge>
                    </Button>
                  </Link>
                </>
              )}
              
              {user.role === 'agent' && (
                <>
                  {user.verifiedStatus ? (
                    <Link href="/hostels/create">
                      <Button className="w-full justify-start h-12">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Hostel Listing
                      </Button>
                    </Link>
                  ) : (
                    <Card className="bg-secondary/50 border-dashed">
                      <CardContent className="p-4 text-center">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Account pending verification. You can list properties after admin approval.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleResubmitVerification}
                          disabled={isResubmitting}
                        >
                          {isResubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                              Resubmitting...
                            </>
                          ) : (
                            'Resubmit for Verification'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  <Link href="/dashboard/bookings">
                    <Button variant="outline" className="w-full justify-start h-12">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Booking Requests
                      <Badge variant="outline" className="ml-auto">
                        {stats?.pendingRequests || 0} pending
                      </Badge>
                    </Button>
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link href="/admin/login">
                    <Button className="w-full justify-start h-12">
                      <Users className="w-4 h-4 mr-2" />
                      Admin Panel
                      <Badge variant="outline" className="ml-auto">
                        {stats?.pendingAgents || 0} pending
                      </Badge>
                    </Button>
                  </Link>
                </>
              )}

              <Button 
                variant="ghost" 
                onClick={fetchRealTimeData} 
                className="w-full justify-start h-12"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                {user.role === 'student' ? 'Your latest booking requests' : 'Recent platform activity'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!recentBookings || recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                  <p className="text-muted-foreground mb-4">
                    {user.role === 'student' 
                      ? 'Start by browsing hostels and booking inspections'
                      : 'Activity will appear here'
                    }
                  </p>
                  {user.role === 'student' && (
                    <Link href="/hostels">
                      <Button>
                        <Search className="w-4 h-4 mr-2" />
                        Browse Hostels
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(recentBookings || []).slice(0, 3).map((booking: any) => (
                    <div key={booking?.id || Math.random()} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {booking?.hostel?.title || 'Hostel Booking'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              try {
                                return booking?.preferred_date 
                                  ? new Date(booking.preferred_date).toLocaleDateString()
                                  : 'Date not specified'
                              } catch (error) {
                                return 'Date not specified'
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        booking?.status === 'confirmed' ? 'default' :
                        booking?.status === 'pending' ? 'secondary' :
                        'outline'
                      }>
                        {booking?.status || 'unknown'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Photo Upload Modal */}
        {showProfileUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Update Profile Photo</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowProfileUpload(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <ProfilePhotoUpload
                  currentPhotoUrl={user?.profileImage || user?.facePhoto || ''}
                  onPhotoUploaded={(photoUrl) => {
                    handleProfilePhotoUploaded(photoUrl)
                    setShowProfileUpload(false)
                  }}
                  userRole={(user?.role as any) || 'student'}
                />
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge variant="outline">
                        {freshUserData?.userType === 'individual' ? 'Individual' : user.role}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.verifiedStatus ? 'default' : 'secondary'}>
                          {user.verifiedStatus ? 'Verified' : 'Pending Verification'}
                        </Badge>
                        {user.verifiedStatus && (
                          <InstagramVerificationBadge verified={true} size="sm" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Platform Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Universities:</span>
                      <span>{stats?.totalSchools || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Hostels:</span>
                      <span>{stats?.totalHostels || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Now:</span>
                      <span>{stats?.availableHostels || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bookings:</span>
                      <span>{stats?.totalBookings || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}