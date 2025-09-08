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
  const { user: authUser, session, isLoading, signOut } = useAuth()
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
      setRecentHostels([])
      setRecentBookings([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchFreshUserData = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        setFreshUserData(data.data)
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
        setTimeout(() => window.location.reload(), 2000)
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
      setFreshUserData((prev: any) => ({ ...prev, profileImage: photoUrl }))
      await fetchFreshUserData()
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

  if (!authUser || !session) return null

  const user = freshUserData || authUser

  if (!user?.id || !user?.email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Error</h2>
          <p className="text-muted-foreground mb-4">There was an issue loading your session. Please sign in again.</p>
          <Button onClick={signOut}>Sign In Again</Button>
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
              <Link href="/" className="text-2xl font-bold text-foreground">k-H</Link>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.role === 'student' && <GraduationCap className="w-3 h-3 mr-1" />}
                {user.role === 'agent' && <Building className="w-3 h-3 mr-1" />}
                {user.role === 'individual' && <Users className="w-3 h-3 mr-1" />}
                {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                {user.verifiedStatus && <InstagramVerificationBadge verified size="sm" className="ml-1" />}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.firstName || user.name || 'User'}</span>
              <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {user.role !== 'agent' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.firstName || user.name}</h1>
            <p className="text-muted-foreground">
              {user.role === 'student' && 'Manage your hostel bookings and discover new accommodations'}
              {user.role === 'individual' && 'Find and book accommodations as an individual'}
              {user.role === 'admin' && 'Oversee platform operations and verify agents'}
            </p>
          </div>
        )}

        {/* Individual Profile Card */}
        {user.role === 'individual' && freshUserData && (
          <Card className="mb-8 border-2 border-primary/20">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.firstName || 'Individual'} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-12 h-12 text-muted-foreground"/>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.firstName || user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-Time Stats, Quick Actions, Recent Activity, etc. */}
        {/* Keep all your existing cards and grids here unchanged */}
        {/* ...rest of your dashboard content remains the same... */}
      </div>
    </div>
  )
}