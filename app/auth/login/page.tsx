'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log('🔐 LOGIN DEBUG: Starting login process')
    console.log('🔐 LOGIN DEBUG: Email:', email)
    console.log('🔐 LOGIN DEBUG: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔐 LOGIN DEBUG: Site URL:', process.env.NEXT_PUBLIC_SITE_URL)

    try {
      console.log('🔐 LOGIN DEBUG: Calling supabase.auth.signInWithPassword...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 LOGIN DEBUG: Supabase response received')
      console.log('🔐 LOGIN DEBUG: Data:', data)
      console.log('🔐 LOGIN DEBUG: Error:', error)

      if (error) {
        console.error('❌ LOGIN ERROR:', error.message)
        console.error('❌ LOGIN ERROR Details:', {
          name: error.name,
          message: error.message,
          status: error.status,
          statusCode: error.status
        })
        
        // Handle different types of errors
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Login failed', {
            description: 'Invalid email or password. Please check your credentials.',
          })
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email not verified', {
            description: 'Please check your email and verify your account before signing in.',
          })
        } else {
          toast.error('Login failed', {
            description: error.message,
          })
        }
      } else if (data.user) {
        console.log('✅ LOGIN SUCCESS: User authenticated')
        console.log('✅ LOGIN SUCCESS: User ID:', data.user.id)
        console.log('✅ LOGIN SUCCESS: User Email:', data.user.email)
        console.log('✅ LOGIN SUCCESS: Session:', data.session ? 'Present' : 'Missing')
        console.log('✅ LOGIN SUCCESS: Callback URL:', callbackUrl)
        
        toast.success('Login successful', {
          description: 'Welcome back to k-H!',
        })
        
        console.log('🔐 LOGIN DEBUG: Redirecting to:', callbackUrl)
        router.push(callbackUrl)
      } else {
        console.error('❌ LOGIN ERROR: No error but no user data received')
        console.error('❌ LOGIN ERROR: Unexpected response:', { data, error })
        toast.error('Login failed', {
          description: 'Unexpected response from server',
        })
      }
    } catch (error) {
      console.error('❌ LOGIN EXCEPTION:', error)
      console.error('❌ LOGIN EXCEPTION Details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
      
      toast.error('Login failed', {
        description: 'An unexpected error occurred',
      })
    } finally {
      console.log('🔐 LOGIN DEBUG: Login process completed, loading:', false)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xl font-bold">k-H</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your k-H account</p>
          </div>

          <Card className="border-2 border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
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
                    placeholder="Enter your email"
                    required
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-12 pr-10"
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

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Forgot Password Link */}
              <div className="mt-4 text-center">
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-primary hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}