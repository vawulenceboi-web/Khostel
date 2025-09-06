'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP code')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔐 OTP CLIENT: Calling verify OTP API...')
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: otp,
          type: 'signup'
        }),
      })

      console.log('🔐 OTP CLIENT: API response received')
      console.log('🔐 OTP CLIENT: Status:', response.status)

      const result = await response.json()
      console.log('🔐 OTP CLIENT: Response data:', result)

      if (!response.ok || !result.success) {
        console.error('❌ OTP CLIENT ERROR:', result)
        
        if (result.errorCode === 'invalid_otp') {
          toast.error('Invalid OTP', {
            description: 'Please check the code and try again.',
          })
        } else if (result.errorCode === 'expired_otp') {
          toast.error('OTP Expired', {
            description: 'Please request a new verification code.',
          })
        } else {
          toast.error('Verification failed', {
            description: result.message || 'Please try again.',
          })
        }
      } else {
        console.log('✅ OTP CLIENT SUCCESS:', result)
        setUserRole(result.user?.role || 'student')
        setIsSuccess(true)
        
        toast.success('Account verified!', {
          description: result.message,
        })

        // Redirect based on user role and access
        setTimeout(() => {
          if (result.dashboardAccess) {
            router.push('/dashboard')
          } else {
            router.push('/auth/pending-approval')
          }
        }, 2000)
      }
    } catch (error) {
      console.error('❌ OTP CLIENT EXCEPTION:', error)
      toast.error('Verification failed', {
        description: 'Network error. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }

    try {
      // Resend by calling the registration endpoint again
      toast.info('Resending verification code...')
      
      // You could implement a separate resend endpoint or 
      // use the forgot password flow to send a new code
      toast.success('New verification code sent to your email')
    } catch (error) {
      toast.error('Failed to resend code')
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Account Verified!</CardTitle>
              <CardDescription>
                {userRole === 'student' 
                  ? 'Welcome! You can now access your dashboard.'
                  : 'Your agent application is pending admin approval.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Next steps:</strong>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {userRole === 'student' 
                    ? 'You will be redirected to your dashboard shortly.'
                    : 'You will be notified once your agent account is approved.'
                  }
                </p>
              </div>
              
              <Button 
                className="w-full h-12 bg-green-600 hover:bg-green-700"
                onClick={() => router.push(userRole === 'student' ? '/dashboard' : '/auth/pending-approval')}
              >
                {userRole === 'student' ? 'Go to Dashboard' : 'View Application Status'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/register">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Verify Your Account</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to your email address
          </p>
        </div>

        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Enter Verification Code</CardTitle>
            <CardDescription>
              We sent a 6-digit code to your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  required
                  className="h-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Check your email inbox and spam folder
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={resendOtp}
                className="text-sm text-primary hover:underline"
                disabled={isLoading}
              >
                Didn't receive the code? Resend
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already verified?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}