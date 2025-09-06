'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Mail, 
  Phone, 
  Building,
  ArrowLeft,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import VirusMorphLoader from '@/components/VirusMorphLoader'

export default function PendingApprovalPage() {
  const { user, session, isLoading } = useAuth()
  const [userStatus, setUserStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/auth/login')
      return
    }

    if (session && user) {
      checkUserStatus()
    }
  }, [session, user, isLoading, router])

  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserStatus(data.user)
        
        // If user is already verified, redirect to dashboard
        if (data.user?.verified_status) {
          toast.success('Account approved! Redirecting to dashboard...')
          setTimeout(() => router.push('/dashboard'), 2000)
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshStatus = () => {
    setLoading(true)
    checkUserStatus()
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <VirusMorphLoader size={130} color="#EC4899" duration={1800} />
          <div className="mt-6">
            <div className="text-xl font-bold text-foreground mb-2">Checking Status</div>
            <div className="text-muted-foreground">Please wait...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  // If user is not an agent, redirect to dashboard
  if (user.user_metadata?.role !== 'agent') {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <Card className="border-2 border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-700">Application Under Review</CardTitle>
            <CardDescription>
              Your agent account is pending admin approval
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status Card */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-orange-900">Current Status</h3>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-orange-800">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Account created and verified
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Email verification completed
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-orange-600" />
                  Waiting for admin approval
                </div>
              </div>
            </div>

            {/* Application Details */}
            {userStatus && (
              <div className="bg-background p-4 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-3">Application Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">
                      {userStatus.first_name} {userStatus.last_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{userStatus.email}</div>
                  </div>
                  {userStatus.phone && (
                    <div>
                      <div className="text-muted-foreground">Phone</div>
                      <div className="font-medium">{userStatus.phone}</div>
                    </div>
                  )}
                  {userStatus.business_reg_number && (
                    <div>
                      <div className="text-muted-foreground">CAC Number</div>
                      <div className="font-medium">{userStatus.business_reg_number}</div>
                    </div>
                  )}
                  {userStatus.address && (
                    <div className="col-span-full">
                      <div className="text-muted-foreground">Business Address</div>
                      <div className="font-medium">{userStatus.address}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-background p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground mb-3">Review Process</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium">Application Submitted</div>
                    <div className="text-muted-foreground">Your agent application has been received</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium">Under Review</div>
                    <div className="text-muted-foreground">Admin team is reviewing your application</div>
                  </div>
                </div>
                <div className="flex items-center opacity-50">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium">Approval Decision</div>
                    <div className="text-muted-foreground">You will be notified of the decision</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={refreshStatus}
                variant="outline" 
                className="flex-1"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              
              <Button 
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                <Shield className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </div>

            {/* Help */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Review Timeline</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Applications are typically reviewed within 24-48 hours</p>
                    <p>• You will receive an email notification once approved</p>
                    <p>• You can access limited dashboard features while pending</p>
                    <p>• Property listing will be enabled after approval</p>
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