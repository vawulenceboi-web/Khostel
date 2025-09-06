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
      console.log('🔄 RESET PASSWORD DEBUG: Starting session validation')
      console.log('🔄 RESET PASSWORD DEBUG: Current URL params:', window.location.search)
      
      try {
        // Check if we have URL parameters (from email link)
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        
        console.log('🔄 RESET PASSWORD DEBUG: Access token present:', !!accessToken)
        console.log('🔄 RESET PASSWORD DEBUG: Refresh token present:', !!refreshToken)
        
        if (accessToken && refreshToken) {
          console.log('🔄 RESET PASSWORD DEBUG: Setting session with tokens from URL')
          
          // Set the session using the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          console.log('🔄 RESET PASSWORD DEBUG: setSession response:', { data, error })

          if (error) {
            console.error('❌ RESET PASSWORD ERROR: Invalid reset session:', error.message)
            console.error('❌ RESET PASSWORD ERROR Details:', {
              name: error.name,
              message: error.message,
              status: error.status
            })
            toast.error('Invalid or expired reset link')
            router.push('/auth/forgot-password')
            return
          }

          if (data.session) {
            console.log('✅ RESET PASSWORD SUCCESS: Session set successfully')
            console.log('✅ RESET PASSWORD SUCCESS: User ID:', data.session.user.id)
            setHasValidSession(true)
            toast.success('Reset link verified! You can now set a new password.')
          } else {
            console.error('❌ RESET PASSWORD ERROR: No session in response data')
            toast.error('Failed to establish reset session')
            router.push('/auth/forgot-password')
          }
        } else {
          console.log('🔄 RESET PASSWORD DEBUG: No URL tokens, checking existing session')
          
          // Check if user already has a valid session
          const { data: { session } } = await supabase.auth.getSession()
          
          console.log('🔄 RESET PASSWORD DEBUG: Existing session:', !!session)
          
          if (session) {
            console.log('✅ RESET PASSWORD SUCCESS: Existing session found')
            setHasValidSession(true)
          } else {
            console.log('❌ RESET PASSWORD ERROR: No valid session found')
            toast.error('No valid reset session found. Please request a new reset link.')
            router.push('/auth/forgot-password')
            return
          }
        }
      } catch (error) {
        console.error('❌ RESET PASSWORD EXCEPTION:', error)
        console.error('❌ RESET PASSWORD EXCEPTION Details:', {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack
        })
        toast.error('Failed to validate reset session')
        router.push('/auth/forgot-password')
      } finally {
        console.log('🔄 RESET PASSWORD DEBUG: Validation completed, valid session:', hasValidSession)
        setIsValidating(false)
      }
    }

    validateResetSession()
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔄 RESET PASSWORD DEBUG: Starting password update')
    console.log('🔄 RESET PASSWORD DEBUG: Password length:', newPassword.length)
    console.log('🔄 RESET PASSWORD DEBUG: Passwords match:', newPassword === confirmPassword)
    
    if (!newPassword) {
      console.log('❌ RESET PASSWORD ERROR: No password provided')
      toast.error('Please enter a new password')
      return
    }

    if (newPassword !== confirmPassword) {
      console.log('❌ RESET PASSWORD ERROR: Passwords do not match')
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      console.log('❌ RESET PASSWORD ERROR: Password too short')
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔄 RESET PASSWORD DEBUG: Calling supabase.auth.updateUser...')
      
      // Check current session before updating
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔄 RESET PASSWORD DEBUG: Current session before update:', !!session)
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      console.log('🔄 RESET PASSWORD DEBUG: updateUser response received')
      console.log('🔄 RESET PASSWORD DEBUG: Error:', error)

      if (error) {
        console.error('❌ RESET PASSWORD ERROR:', error.message)
        console.error('❌ RESET PASSWORD ERROR Details:', {
          name: error.name,
          message: error.message,
          status: error.status,
          statusCode: error.status
        })
        toast.error(error.message || 'Failed to reset password')
      } else {
        console.log('✅ RESET PASSWORD SUCCESS: Password updated successfully')
        setResetSuccess(true)
        toast.success('Password reset successfully!')
      }
    } catch (error) {
      console.error('❌ RESET PASSWORD EXCEPTION:', error)
      console.error('❌ RESET PASSWORD EXCEPTION Details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
      toast.error('Network error. Please try again.')
    } finally {
      console.log('🔄 RESET PASSWORD DEBUG: Update process completed, loading:', false)
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