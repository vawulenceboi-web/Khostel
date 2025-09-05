'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Shield, Clock, Users, Star, Search, GraduationCap, Building, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'

export default function HomePage() {
  const { session } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalHostels: 0,
    availableHostels: 0,
    totalUniversities: 0,
    totalStudents: 0,
  })

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch real platform stats for landing page
  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await fetch('/api/public-stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.data)
        }
      } catch (error) {
        console.error('Error fetching public stats:', error)
      }
    }

    fetchPublicStats()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-foreground">
                k-H
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/hostels" className="text-foreground hover:text-primary transition-colors font-medium">
                Browse Hostels
              </Link>
              <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
                Find Agents
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/hostels">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight cursor-pointer hover:opacity-80 transition-opacity">
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Find Your Perfect
                </span>
                <br />
                <span className="text-foreground">Student Hostel</span>
              </h1>
            </Link>
            <Link href="/auth/register">
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed cursor-pointer hover:text-foreground transition-colors">
                Discover verified, affordable accommodation near Nigerian universities. 
                Book inspections instantly with trusted agents.
              </p>
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/hostels">
                <Button size="lg" className="text-lg px-8 py-4 h-14 min-w-[200px]">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Hostels
                </Button>
              </Link>
              <Link href="/auth/register?role=agent">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-14 min-w-[200px]">
                  <Building className="mr-2 h-5 w-5" />
                  List Your Property
                </Button>
              </Link>
            </div>

            {/* Clickable Real-Time Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              <Link href="/hostels">
                <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.totalHostels || 0}
                  </div>
                  <div className="text-muted-foreground">Total Hostels</div>
                </div>
              </Link>
              
              <Link href="/hostels">
                <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.totalUniversities || 0}
                  </div>
                  <div className="text-muted-foreground">Universities</div>
                </div>
              </Link>
              
              <Link href="/auth/register">
                <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.totalStudents || 0}
                  </div>
                  <div className="text-muted-foreground">Students</div>
                </div>
              </Link>
              
              <Link href="/hostels">
                <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats.availableHostels || 0}
                  </div>
                  <div className="text-muted-foreground">Available Now</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Choose Your Path</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select your role to get started with k-H
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">I&apos;m a Student</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Find and book affordable hostels near your university. Browse verified listings and schedule inspections.
                </p>
                <Link href="/auth/register?role=student">
                  <Button className="w-full h-12 text-base font-semibold">
                    Get Started as Student
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Building className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">I&apos;m an Agent/Owner</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  List your properties and connect with students. Manage bookings and grow your hostel business.
                </p>
                <Link href="/auth/register?role=agent">
                  <Button className="w-full h-12 text-base font-semibold">
                    Get Started as Agent
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-border/50 hover:border-green-500/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">I&apos;m an Individual</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Looking for accommodation as an individual? Browse hostels and connect directly with agents.
                </p>
                <Link href="/auth/register-individual">
                  <Button className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700">
                    Get Started as Individual
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Admin Access */}
          <div className="mt-16 text-center">
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                <Shield className="w-3 h-3 mr-1" />
                Admin Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Why Choose k-H?</h2>
            <p className="text-xl text-muted-foreground">
              We make finding student accommodation simple, safe, and reliable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Verified Agents</h3>
              <p className="text-muted-foreground leading-relaxed">
                All agents are verified with CAC business registration before they can list properties
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Location-Based Search</h3>
              <p className="text-muted-foreground leading-relaxed">
                Find hostels in specific areas around your university with integrated Google Maps
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Booking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Book hostel inspections instantly and get email confirmations from verified agents
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to find your perfect hostel</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Search &amp; Filter</h3>
              <p className="text-muted-foreground">Browse hostels by university, location, price range, and amenities</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Book Inspection</h3>
              <p className="text-muted-foreground">Schedule a visit with verified agents and get instant confirmation</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Move In</h3>
              <p className="text-muted-foreground">Complete your booking and enjoy your new home away from home</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Find Your Perfect Hostel?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of Nigerian students who have found their ideal accommodation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-4 h-14 min-w-[200px]">
                Get Started Free
              </Button>
            </Link>
            <Link href="/hostels">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-14 min-w-[200px]">
                Browse Hostels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <Link href="/" className="text-3xl font-bold text-foreground">
                k-H
              </Link>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed max-w-md">
                Making student accommodation search easier and safer across Nigerian universities.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">For Students</h3>
              <ul className="space-y-2">
                <li><Link href="/hostels" className="text-muted-foreground hover:text-foreground transition-colors">Browse Hostels</Link></li>
                <li><Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">Find Agents</Link></li>
                <li><Link href="/auth/register" className="text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">For Agents</h3>
              <ul className="space-y-2">
                <li><Link href="/auth/register?role=agent" className="text-muted-foreground hover:text-foreground transition-colors">List Property</Link></li>
                <li><Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Agent Login</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground">
              &copy; 2024 k-H. All rights reserved. Made for Nigerian students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
