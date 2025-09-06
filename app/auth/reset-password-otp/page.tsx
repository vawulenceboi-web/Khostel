'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordOtpPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
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
      toast.error('Please enter the 6-digit reset code')
      return
    }

    if (!newPassword) {
      toast.error('Please enter a new password')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔄 RESET PASSWORD OTP: Starting password reset...')
      
      // First verify the OTP and get session
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      })

      console.log('🔄 RESET PASSWORD OTP: OTP verification response:', { data, error: verifyError })

      if (verifyError) {
        console.error('❌ RESET PASSWORD OTP ERROR: OTP verification failed', verifyError)
        
        if (verifyError.message.includes('Invalid token')) {
          toast.error('Invalid reset code', {
            description: 'Please check the code and try again.',
          })
        } else if (verifyError.message.includes('expired')) {
          toast.error('Reset code expired', {
            description: 'Please request a new reset code.',
          })
        } else {
          toast.error('Verification failed', {
            description: verifyError.message,
          })
        }
        return
      }

      if (!data.session) {
        console.error('❌ RESET PASSWORD OTP ERROR: No session after OTP verification')
        toast.error('Reset failed', {
          description: 'Could not establish session. Please try again.',
        })
        return
      }

      console.log('✅ RESET PASSWORD OTP: OTP verified, updating password...')

      // Now update the password using the established session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      console.log('🔄 RESET PASSWORD OTP: Password update response:', { error: updateError })

      if (updateError) {
        console.error('❌ RESET PASSWORD OTP ERROR: Password update failed', updateError)
        toast.error('Password update failed', {
          description: updateError.message,
        })
        return
      }

      console.log('✅ RESET PASSWORD OTP SUCCESS: Password updated successfully')
      
      setResetSuccess(true)
      toast.success('Password reset successfully!')

    } catch (error) {
      console.error('❌ RESET PASSWORD OTP EXCEPTION:', error)
      toast.error('Reset failed', {
        description: 'Network error. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Password Reset Successfully!</CardTitle>
              <CardDescription>
                Your password has been updated. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login">
                <Button className="w-full h-12 bg-green-600 hover:bg-green-700">
                  <Lock className="w-4 h-4 mr-2" />
                  Continue to Sign In
                </Button>
              </Link>
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
          <Link href="/auth/forgot-password">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forgot Password
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter the reset code from your email and create a new password
          </p>
        </div>

        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Reset Your Password</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your email and set a new password
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
                <Label htmlFor="otp">Reset Code</Label>
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
                  Check your email for the reset code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="h-12 pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="h-12"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading || otp.length !== 6 || !newPassword || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
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