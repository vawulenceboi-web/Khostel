'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Calendar, 
  Settings, 
  MapPin, 
  Plus,
  Building,
  GraduationCap,
  Shield,
  Search
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
      const hostelsRes = await fetch('/api/hostels')
      if (hostelsRes.ok) {
        const hostelsData = await hostelsRes.json()
        setHostels(hostelsData.data || [])
      }

      const bookingsRes = await fetch('/api/bookings')
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground mb-2">k-H</div>
          <div className="text-muted-foreground">Loading...</div>
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
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-foreground">
                k-H
              </Link>
              <Badge variant="secondary">
                {user.role === 'student' && <GraduationCap className="w-3 h-3 mr-1" />}
                {user.role === 'agent' && <Building className="w-3 h-3 mr-1" />}
                {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                {user.role}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {user.firstName || user.name}
              </span>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your k-H dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hostels.length}</div>
              <p className="text-xs text-muted-foreground">Available properties</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">Total bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.verifiedStatus ? 'Verified' : 'Pending'}
              </div>
              <p className="text-xs text-muted-foreground">Account status</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/hostels">
                <Button className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Hostels
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {hostels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Hostels</CardTitle>
              <CardDescription>
                Current hostel listings on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.slice(0, 6).map((hostel: any) => (
                  <Card key={hostel.id} className="overflow-hidden">
                    {hostel.images?.[0] && (
                      <img 
                        src={hostel.images[0]} 
                        alt={hostel.title}
                        className="w-full h-32 object-cover"
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}