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
      console.log('🔐 LOGIN CLIENT: Calling server-side login API...')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      console.log('🔐 LOGIN CLIENT: API response received')
      console.log('🔐 LOGIN CLIENT: Status:', response.status)
      console.log('🔐 LOGIN CLIENT: Status text:', response.statusText)

      const result = await response.json()
      console.log('🔐 LOGIN CLIENT: Response data:', result)

      if (!response.ok || !result.success) {
        console.error('❌ LOGIN CLIENT ERROR: API request failed')
        console.error('❌ LOGIN CLIENT ERROR: Status:', response.status)
        console.error('❌ LOGIN CLIENT ERROR: Result:', result)
        
        // Handle different types of errors
        if (result.message?.includes('Invalid login credentials')) {
          toast.error('Login failed', {
            description: 'Invalid email or password. Please check your credentials.',
          })
        } else if (result.message?.includes('Email not confirmed')) {
          toast.error('Email not verified', {
            description: 'Please check your email and verify your account before signing in.',
          })
        } else {
          toast.error('Login failed', {
            description: result.message || 'Login failed',
          })
        }
      } else {
        console.log('✅ LOGIN CLIENT SUCCESS: Login API successful')
        console.log('✅ LOGIN CLIENT SUCCESS: User data:', result.user)
        
        // Now sign in with Supabase on the client side using the successful response
        console.log('🔐 LOGIN CLIENT: Attempting client-side Supabase sign in...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          console.error('❌ LOGIN CLIENT ERROR: Client-side Supabase sign in failed')
          console.error('❌ LOGIN CLIENT ERROR:', error)
          toast.error('Login failed', {
            description: 'Failed to establish client session',
          })
        } else if (data.user) {
          console.log('✅ LOGIN CLIENT SUCCESS: Client session established')
          console.log('✅ LOGIN CLIENT SUCCESS: Session data:', {
            user: !!data.user,
            session: !!data.session,
            accessToken: data.session?.access_token?.substring(0, 20) + '...'
          })
          
          // Debug cookies after login
          console.log('🍪 LOGIN CLIENT: Checking cookies after login...')
          const allCookies = document.cookie.split(';').map(c => c.trim())
          console.log('🍪 LOGIN CLIENT: Total browser cookies:', allCookies.length)
          console.log('🍪 LOGIN CLIENT: Cookie names:', allCookies.map(c => c.split('=')[0]))
          
          const supabaseCookies = allCookies.filter(c => 
            c.includes('supabase') || 
            c.includes('sb-') ||
            c.includes('auth')
          )
          console.log('🍪 LOGIN CLIENT: Supabase cookies:', supabaseCookies.length)
          supabaseCookies.forEach(cookie => {
            console.log('🍪 LOGIN CLIENT: Supabase cookie:', cookie.substring(0, 50) + '...')
          })
          
          toast.success('Login successful', {
            description: 'Welcome back to k-H!',
          })
          
          console.log('🔐 LOGIN CLIENT: Redirecting to:', callbackUrl)
          router.push(callbackUrl)
        }
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