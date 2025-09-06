'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Validate the reset session on component mount
  useEffect(() => {
    const validateResetSession = async () => {
      try {
        // Check if we have URL parameters (from email link)
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Set the session using the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('❌ Invalid reset session:', error.message)
            toast.error('Invalid or expired reset link')
            router.push('/auth/forgot-password')
            return
          }

          if (data.session) {
            setHasValidSession(true)
            toast.success('Reset link verified! You can now set a new password.')
          }
        } else {
          // Check if user already has a valid session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setHasValidSession(true)
          } else {
            toast.error('No valid reset session found. Please request a new reset link.')
            router.push('/auth/forgot-password')
            return
          }
        }
      } catch (error) {
        console.error('❌ Session validation error:', error)
        toast.error('Failed to validate reset session')
        router.push('/auth/forgot-password')
      } finally {
        setIsValidating(false)
      }
    }

    validateResetSession()
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Reset password error:', error)
        toast.error(error.message || 'Failed to reset password')
      } else {
        setResetSuccess(true)
        toast.success('Password reset successfully!')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while validating session
  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <CardTitle className="text-2xl">Validating Reset Link</CardTitle>
              <CardDescription>
                Please wait while we verify your password reset link...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // Don't render the form if session is invalid
  if (!hasValidSession) {
    return null
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
              Back to Email Entry
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter the code from your email and create a new password
          </p>
        </div>

        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create New Password</CardTitle>
            <CardDescription>
              Check your email for the 6-digit reset code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Setting New Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Set New Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}