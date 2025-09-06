'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔑 FORGOT PASSWORD DEBUG: Starting process')
    console.log('🔑 FORGOT PASSWORD DEBUG: Email:', email)
    console.log('🔑 FORGOT PASSWORD DEBUG: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 FORGOT PASSWORD DEBUG: Site URL:', process.env.NEXT_PUBLIC_SITE_URL)
    
    if (!email) {
      console.log('❌ FORGOT PASSWORD ERROR: No email provided')
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔑 FORGOT PASSWORD CLIENT: Sending OTP for password reset...')
      
      // Use Supabase OTP for password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password-otp?email=${encodeURIComponent(email)}`,
      })

      console.log('🔑 FORGOT PASSWORD CLIENT: OTP response received')
      console.log('🔑 FORGOT PASSWORD CLIENT: Error:', error)

      if (error) {
        console.error('❌ FORGOT PASSWORD CLIENT ERROR:', error)
        
        if (error.message.includes('User not found')) {
          toast.error('Account not found', {
            description: 'No account found with this email address.',
          })
        } else {
          toast.error('Failed to send reset code', {
            description: 'Please try again or contact support.',
          })
        }
      } else {
        console.log('✅ FORGOT PASSWORD CLIENT SUCCESS: OTP sent')
        
        setOtpSent(true)
        toast.success('Reset code sent to your email')
      }
    } catch (error) {
      console.error('❌ FORGOT PASSWORD EXCEPTION:', error)
      console.error('❌ FORGOT PASSWORD EXCEPTION Details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
      toast.error('Network error. Please try again.')
    } finally {
      console.log('🔑 FORGOT PASSWORD DEBUG: Process completed, loading:', false)
      setIsLoading(false)
    }
  }

  if (otpSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a 6-digit reset code to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-green-700 mt-2 space-y-1">
                  <li>1. Check your email inbox (and spam folder)</li>
                  <li>2. Find the 6-digit reset code</li>
                  <li>3. Enter the code to reset your password</li>
                </ol>
              </div>
              
              <Button 
                className="w-full h-12 bg-green-600 hover:bg-green-700" 
                onClick={() => router.push(`/auth/reset-password-otp?email=${encodeURIComponent(email)}`)}
              >
                <Send className="w-4 h-4 mr-2" />
                Enter Reset Code
              </Button>
              
              <div className="text-center">
                <button
                  onClick={() => setOtpSent(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Use different email address
                </button>
              </div>
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
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">
            No worries! Enter your email and we'll send you a 6-digit reset code.
          </p>
        </div>

        <Card className="border-2 border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset Your Password</CardTitle>
            <CardDescription>
              Enter the email address associated with your k-H account
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

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Sending Reset Code...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Reset Code
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