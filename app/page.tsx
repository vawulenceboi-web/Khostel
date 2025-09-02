"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Shield, Search, Star, Calendar, Map } from "lucide-react"
import HostelMap from "@/components/hostel-map"

export default function HomePage() {
  const [userRole, setUserRole] = useState<"student" | "agent" | "admin" | null>(null)

  const LoginForm = ({ role }: { role: string }) => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">K-H Platform</CardTitle>
        <CardDescription>
          Sign in as {role === "student" ? "Student" : role === "agent" ? "Agent/Owner" : "Admin"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" />
        </div>
        {role === "agent" && (
          <div className="space-y-2">
            <Label htmlFor="cac">CAC Registration Number</Label>
            <Input id="cac" placeholder="Enter CAC number for verification" />
          </div>
        )}
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Sign In</Button>
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto text-accent">
            Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const StudentDashboard = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">K-H</h1>
            <Badge variant="secondary">Student</Badge>
          </div>
          <Button variant="outline" onClick={() => setUserRole(null)}>
            Logout
          </Button>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-balance">Find Your Perfect Hostel</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Discover verified hostels around Nigerian universities
          </p>
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input placeholder="Search by university or location..." className="flex-1" />
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Maps Integration Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">Explore Hostel Areas</h3>
              <p className="text-muted-foreground">Interactive map showing hostel locations around universities</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Map className="w-4 h-4" />
              <span>KWASU Campus Areas</span>
            </div>
          </div>
          <HostelMap />
        </div>
      </section>

      {/* Featured Hostels */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8">Featured Hostels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-muted flex items-center justify-center">
                  <img
                    src={`/modern-hostel-room-.png?height=200&width=300&query=modern hostel room ${i}`}
                    alt={`Hostel ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">Westend Lodge {i}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-accent text-accent mr-1" />
                      4.{i}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    KWASU, Westend Area
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">₦{(150 + i * 25).toLocaleString()}/semester</span>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      Book Inspection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* My Bookings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8">My Bookings</h3>
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Safari Heights {i}</h4>
                      <p className="text-sm text-muted-foreground">Inspection booked for Dec {20 + i}, 2024</p>
                    </div>
                    <Badge variant={i === 1 ? "default" : "secondary"}>{i === 1 ? "Confirmed" : "Pending"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  const AgentDashboard = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">K-H</h1>
            <Badge variant="secondary">Agent</Badge>
          </div>
          <Button variant="outline" onClick={() => setUserRole(null)}>
            Logout
          </Button>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Pending Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">This Month Views</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">4.2</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Management Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Hostel Listings</h3>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Add New Listing</Button>
              </div>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                            <img
                              src={`/hostel-building-.png?height=64&width=64&query=hostel building ${i}`}
                              alt={`Listing ${i}`}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold">Chapel Road Lodge {i}</h4>
                            <p className="text-sm text-muted-foreground">₦{(180 + i * 20).toLocaleString()}/semester</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={i === 1 ? "default" : "secondary"}>
                            {i === 1 ? "Available" : "Not Available"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <h3 className="text-xl font-semibold">Booking Requests</h3>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">John Doe {i}</h4>
                          <p className="text-sm text-muted-foreground">
                            Wants to inspect Chapel Road Lodge {i} on Dec {25 + i}, 2024
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Decline
                          </Button>
                          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )

  const AdminDashboard = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">K-H</h1>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <Button variant="outline" onClick={() => setUserRole(null)}>
            Logout
          </Button>
        </div>
      </header>

      {/* Admin Stats */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Verified Agents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Pending Verifications</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Admin Management */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="verification" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="verification">Agent Verification</TabsTrigger>
              <TabsTrigger value="listings">Manage Listings</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="verification" className="space-y-4">
              <h3 className="text-xl font-semibold">Pending Agent Verifications</h3>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">Agent Name {i}</h4>
                          <p className="text-sm text-muted-foreground">
                            CAC: RC{1234567 + i} | Email: agent{i}@example.com
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Reject
                          </Button>
                          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <Shield className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="listings" className="space-y-4">
              <h3 className="text-xl font-semibold">All Hostel Listings</h3>
              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">University Lodge {i}</h4>
                          <p className="text-sm text-muted-foreground">
                            By Agent {i} | ₦{(200 + i * 15).toLocaleString()}/semester
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                            {i % 2 === 0 ? "Active" : "Under Review"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <h3 className="text-xl font-semibold">Platform Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">142</div>
                    <p className="text-sm text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">+28</div>
                    <p className="text-sm text-muted-foreground">New users this month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-balance">K-H Platform</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Connecting Nigerian students with verified hostel accommodations
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
              onClick={() => setUserRole("student")}
            >
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-semibold mb-2">Student</h3>
                <p className="text-muted-foreground">Find and book hostel inspections</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
              onClick={() => setUserRole("agent")}
            >
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-semibold mb-2">Agent/Owner</h3>
                <p className="text-muted-foreground">List and manage your hostels</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
              onClick={() => setUserRole("admin")}
            >
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-semibold mb-2">Admin</h3>
                <p className="text-muted-foreground">Manage platform and verify agents</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (userRole === "student") return <StudentDashboard />
  if (userRole === "agent") return <AgentDashboard />
  if (userRole === "admin") return <AdminDashboard />

  return <LoginForm role={userRole} />
}
