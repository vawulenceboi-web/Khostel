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
  UserX,
  History,
  Phone,
  MapPin,
  Building,
  FileText,
  RefreshCw,
  ArrowLeft,
  Ban
} from "lucide-react"
import { toast } from 'sonner'
import Link from 'next/link'

interface AgentWithHistory {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  cac_number: string
  profile_image_url: string
  verified_status: boolean
  created_at: string
  updated_at: string
  status: string
  lastAction: {
    type: string
    reason: string
    date: string
    admin: string
  } | null
  actionHistory: any[]
  canBeBanned: boolean
  registrationAge: number
}

export default function AdminHistoryPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentWithHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [processingAgent, setProcessingAgent] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'banned'>('all')

  useEffect(() => {
    checkAdminAuth()
    fetchAgentHistory()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/simple-verify', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchAgentHistory = async () => {
    try {
      const response = await fetch('/api/admin/agent-history', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAgents(data.data || [])
        console.log('📋 Loaded agent history:', data.data?.length)
      }
    } catch (error) {
      console.error('Error fetching agent history:', error)
      toast.error('Failed to load agent history')
    } finally {
      setLoading(false)
    }
  }

  const handleBanAgent = async (agentId: string, reason: string) => {
    setProcessingAgent(agentId)
    
    try {
      const response = await fetch('/api/admin/verify-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agentId,
          action: 'ban',
          reason: reason || 'Policy violation - banned by admin'
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Agent banned successfully')
        fetchAgentHistory() // Refresh list
      } else {
        toast.error(result.message || 'Failed to ban agent')
      }
    } catch (error) {
      console.error('Error banning agent:', error)
      toast.error('Failed to ban agent')
    } finally {
      setProcessingAgent(null)
    }
  }

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true
    if (filter === 'verified') return agent.verified_status
    if (filter === 'pending') return !agent.verified_status
    return false
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-2xl font-bold text-foreground mb-2">k-H Admin</div>
          <div className="text-muted-foreground">Loading agent history...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Mobile-Friendly Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6">
            {/* Left Section */}
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Agent History</h1>
                  <p className="text-xs sm:text-sm text-gray-500">Management & verification records</p>
                </div>
              </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs sm:text-sm">
                <Shield className="w-3 h-3 mr-1" />
                Admin Panel
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchAgentHistory}
                className="border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile-Friendly Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
              <p className="text-sm text-gray-600">Total Agents</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {agents.filter(a => a.verified_status).length}
              </div>
              <p className="text-sm text-gray-600">Verified</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {agents.filter(a => !a.verified_status).length}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Friendly Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: agents.length },
              { key: 'verified', label: 'Verified', count: agents.filter(a => a.verified_status).length },
              { key: 'pending', label: 'Pending', count: agents.filter(a => !a.verified_status).length }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                onClick={() => setFilter(tab.key as any)}
                size="sm"
                className="flex items-center space-x-1 text-xs sm:text-sm"
              >
                <span>{tab.label}</span>
                <Badge variant="secondary" className="bg-white text-black text-xs ml-1">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Agents List */}
        <div className="space-y-6">
          {filteredAgents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Agents Found</h3>
                <p className="text-muted-foreground">
                  No agents match the current filter criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAgents.map((agent) => (
              <Card key={agent.id} className="border border-gray-200 shadow-sm bg-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* Agent Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {agent.profile_image_url && (
                            <img 
                              src={agent.profile_image_url} 
                              alt={`${agent.first_name} ${agent.last_name}`}
                              className="w-16 h-16 rounded-full object-cover border-2 border-border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          <div>
                            <h3 className="text-xl font-bold">
                              {agent.first_name} {agent.last_name}
                            </h3>
                            <p className="text-muted-foreground">{agent.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={agent.verified_status ? 'default' : 'secondary'}>
                                {agent.verified_status ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </>
                                )}
                              </Badge>
                              <Badge variant="outline">
                                {agent.registrationAge} days old
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agent Details - Mobile Friendly */}
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        <div className="flex items-start space-x-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="ml-1 text-gray-600 break-words">{agent.phone || 'Not provided'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 text-sm">
                          <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-700">CAC:</span>
                            <span className="ml-1 text-gray-600 break-all font-mono text-xs">{agent.cac_number || 'Not provided'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-700">Address:</span>
                            <span className="ml-1 text-gray-600 break-words">{agent.address || 'Not provided'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-700">Updated:</span>
                            <span className="ml-1 text-gray-600 break-words">
                              {new Date(agent.updated_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action History */}
                      {agent.lastAction && (
                        <Card className="bg-secondary/30 mb-4">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2 flex items-center">
                              <History className="w-4 h-4 mr-2" />
                              Latest Action
                            </h4>
                            <div className="text-sm">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant={
                                  agent.lastAction.type === 'approved' ? 'default' :
                                  agent.lastAction.type === 'rejected' ? 'secondary' :
                                  'destructive'
                                }>
                                  {agent.lastAction.type}
                                </Badge>
                                <span className="text-muted-foreground">
                                  by {agent.lastAction.admin}
                                </span>
                              </div>
                              <p className="text-muted-foreground">
                                <strong>Reason:</strong> {agent.lastAction.reason}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(agent.lastAction.date).toLocaleString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:w-64 flex lg:flex-col gap-3">
                      {agent.verified_status ? (
                        // Actions for verified agents
                        <>
                          <Button
                            variant="destructive"
                            onClick={() => handleBanAgent(agent.id, 'Policy violation detected by admin')}
                            disabled={processingAgent === agent.id}
                            className="flex-1 lg:w-full"
                          >
                            {processingAgent === agent.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Ban className="w-4 h-4 mr-2" />
                            )}
                            Ban Agent
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => window.open(`mailto:${agent.email}?subject=k-H Platform Notice`, '_blank')}
                            className="flex-1 lg:w-full"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Send Warning
                          </Button>
                        </>
                      ) : (
                        // Actions for pending agents
                        <div className="text-center p-4 bg-secondary/50 rounded-lg">
                          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Pending verification
                          </p>
                          <Link href="/admin/dashboard">
                            <Button variant="outline" size="sm" className="mt-2">
                              Review in Queue
                            </Button>
                          </Link>
                        </div>
                      )}
                      
                      <Button
                        variant="ghost"
                        onClick={() => window.open(`https://search.cac.gov.ng/`, '_blank')}
                        className="flex-1 lg:w-full text-xs"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Verify CAC: {agent.cac_number}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Management Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Agent Management Guidelines</CardTitle>
            <CardDescription>
              How to handle verified agents who violate platform rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-red-600">🚫 Ban Agent If:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Listing fake or misleading hostel information</li>
                  <li>• Overcharging or scamming students</li>
                  <li>• Harassment or inappropriate behavior</li>
                  <li>• Violating platform terms and conditions</li>
                  <li>• Multiple student complaints</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-yellow-600">⚠️ Send Warning If:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Minor policy violations</li>
                  <li>• Late response to booking requests</li>
                  <li>• Incomplete hostel descriptions</li>
                  <li>• Poor quality photos</li>
                  <li>• First-time minor infractions</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>📋 Action History:</strong> All admin actions are logged and tracked. 
                You can see the complete history of decisions for each agent including approval dates, 
                warnings sent, and ban reasons.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}