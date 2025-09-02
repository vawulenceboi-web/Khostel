'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  UserCheck,
  UserX,
  Timer,
  Phone,
  MapPin,
  Building,
  FileText,
  RefreshCw
} from "lucide-react"
import { toast } from 'sonner'
import Link from 'next/link'

interface PendingAgent {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  cac_number?: string
  profile_image_url?: string
  registered_at: string
  submitted_at: string
  decision_deadline: string
  queue_status: string
  minutes_remaining: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [processingAgent, setProcessingAgent] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Safer initialization with error boundaries
    const initializeAdmin = async () => {
      try {
        await checkAdminAuth()
        await fetchPendingAgents()
      } catch (error) {
        console.error('Admin initialization error:', error)
        setLoading(false)
      }
    }

    initializeAdmin()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (authChecked) {
        fetchPendingAgents()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [authChecked])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/simple-verify', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        console.log('❌ Admin auth failed, redirecting to login')
        router.push('/admin/login')
        return
      }
      
      console.log('✅ Admin authenticated successfully')
      setAuthChecked(true)
    } catch (error) {
      console.error('❌ Admin auth error:', error)
      router.push('/admin/login')
    }
  }

  const fetchPendingAgents = async () => {
    try {
      const response = await fetch('/api/admin/pending-agents', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const agents = Array.isArray(data.data) ? data.data : []
        setPendingAgents(agents)
        console.log('📋 Loaded pending agents:', agents.length)
      } else {
        console.error('Failed to fetch pending agents:', response.status)
        setPendingAgents([])
      }
    } catch (error) {
      console.error('Error fetching pending agents:', error)
      setPendingAgents([])
    } finally {
      setLoading(false)
    }
  }

  const handleAgentDecision = async (agentId: string, action: 'approve' | 'reject' | 'ban', reason?: string) => {
    if (!agentId || !action) {
      toast.error('Invalid agent or action')
      return
    }

    setProcessingAgent(agentId)
    
    try {
      const response = await fetch('/api/admin/verify-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agentId,
          action,
          reason: reason || `Agent ${action}d by admin`
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Agent ${action}d successfully`)
        await fetchPendingAgents() // Refresh list
      } else {
        toast.error(result.message || `Failed to ${action} agent`)
      }
    } catch (error) {
      console.error(`Error ${action}ing agent:`, error)
      toast.error(`Failed to ${action} agent`)
    } finally {
      setProcessingAgent(null)
    }
  }

  const formatTimeRemaining = (minutes: number): string => {
    try {
      if (minutes <= 0) return 'Expired'
      if (minutes < 60) return `${Math.floor(minutes)}m remaining`
      const hours = Math.floor(minutes / 60)
      const mins = Math.floor(minutes % 60)
      return `${hours}h ${mins}m remaining`
    } catch (error) {
      return 'Unknown'
    }
  }

  const safeFormatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-2xl font-bold text-foreground mb-2">k-H Admin</div>
          <div className="text-muted-foreground">Loading verification queue...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-foreground">k-H Admin</div>
              <Badge variant="default" className="bg-red-600 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/admin/history">
                <Button variant="ghost">
                  <Users className="w-4 h-4 mr-2" />
                  Agent History
                </Button>
              </Link>
              <Button variant="outline" onClick={fetchPendingAgents}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/login')}>
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
            Agent Verification Center
          </h1>
          <p className="text-muted-foreground">
            Review and verify agent applications within 30-minute decision windows
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAgents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Agents awaiting decision</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingAgents?.filter(a => a?.minutes_remaining < 10).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Less than 10 minutes left</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingAgents?.filter(a => a?.minutes_remaining < 30 && a?.minutes_remaining >= 10).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Within 30 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fresh Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingAgents?.filter(a => a?.minutes_remaining > 25).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Recently submitted</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Agents List */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Verification Queue</CardTitle>
            <CardDescription>
              Review agent applications and make verification decisions within 30 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!pendingAgents || pendingAgents.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Pending Verifications</h3>
                <p className="text-muted-foreground">
                  All agent applications have been processed. New applications will appear here.
                </p>
                <div className="mt-4">
                  <Link href="/admin/history">
                    <Button variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      View Agent History
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingAgents.map((agent) => {
                  // Safe data handling with fallbacks
                  const agentId = agent?.id || ''
                  const firstName = agent?.first_name || 'Unknown'
                  const lastName = agent?.last_name || ''
                  const email = agent?.email || 'No email'
                  const phone = agent?.phone || 'Not provided'
                  const address = agent?.address || 'Not provided'
                  const cacNumber = agent?.cac_number || 'Not provided'
                  const profileImage = agent?.profile_image_url
                  const minutesRemaining = agent?.minutes_remaining || 0
                  const registeredAt = agent?.registered_at || agent?.submitted_at || new Date().toISOString()

                  return (
                    <Card key={agentId} className={`border-2 ${
                      minutesRemaining < 10 ? 'border-red-500' :
                      minutesRemaining < 30 ? 'border-yellow-500' :
                      'border-border'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Agent Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                {profileImage && (
                                  <img 
                                    src={profileImage} 
                                    alt={`${firstName} ${lastName}`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                )}
                                <div>
                                  <h3 className="text-xl font-bold">
                                    {firstName} {lastName}
                                  </h3>
                                  <p className="text-muted-foreground">{email}</p>
                                  <Badge variant={
                                    minutesRemaining < 10 ? 'destructive' :
                                    minutesRemaining < 30 ? 'secondary' :
                                    'outline'
                                  }>
                                    <Timer className="w-3 h-3 mr-1" />
                                    {formatTimeRemaining(minutesRemaining)}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Agent Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    <strong>Phone:</strong> {phone}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    <strong>Address:</strong> {address}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Building className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    <strong>CAC Number:</strong> {cacNumber}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    <strong>Registered:</strong> {safeFormatDate(registeredAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* CAC Verification Helper */}
                            {cacNumber && cacNumber !== 'Not provided' && (
                              <Card className="bg-secondary/50 mb-4">
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-2 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    CAC Verification Helper
                                  </h4>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Manually verify this CAC number using the official CAC portal:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => window.open('https://search.cac.gov.ng/', '_blank')}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Check CAC Portal
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(cacNumber)
                                        toast.success('CAC number copied to clipboard')
                                      }}
                                    >
                                      Copy: {cacNumber}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="lg:w-64 flex lg:flex-col gap-3">
                            <Button
                              onClick={() => handleAgentDecision(agentId, 'approve')}
                              disabled={processingAgent === agentId || !agentId}
                              className="flex-1 lg:w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingAgent === agentId ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Approve Agent
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => handleAgentDecision(agentId, 'reject', 'Failed verification requirements')}
                              disabled={processingAgent === agentId || !agentId}
                              className="flex-1 lg:w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>

                            <Button
                              variant="destructive"
                              onClick={() => handleAgentDecision(agentId, 'ban', 'Fraudulent or suspicious activity')}
                              disabled={processingAgent === agentId || !agentId}
                              className="flex-1 lg:w-full"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Ban Agent
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Verification Guidelines</CardTitle>
            <CardDescription>
              How to properly verify agent applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">✅ Approve If:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• CAC number format is valid (RC followed by 6-7 digits)</li>
                  <li>• Business name matches CAC portal search</li>
                  <li>• Contact information seems legitimate</li>
                  <li>• Address is specific and verifiable</li>
                  <li>• Profile photo looks professional</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-red-600">❌ Reject/Ban If:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• CAC number doesn't exist or is invalid</li>
                  <li>• Business name doesn't match CAC records</li>
                  <li>• Suspicious or fake contact information</li>
                  <li>• Generic or vague business address</li>
                  <li>• Profile photo looks fake or inappropriate</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>⏱️ Decision Window:</strong> You have 30 minutes from when an agent registers to make a decision. 
                After 30 minutes, the application expires and the agent must re-apply.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}