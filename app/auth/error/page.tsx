'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AuthErrorPage() {
  const [error, setError] = useState<string>('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    } else {
      setError('An unknown authentication error occurred.')
    }
  }, [searchParams])

  const getErrorMessage = (errorCode: string) => {
    if (errorCode.includes('Invalid login credentials')) {
      return {
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect.',
        action: 'Try signing in again'
      }
    }
    
    if (errorCode.includes('Email not confirmed')) {
      return {
        title: 'Email Not Verified',
        message: 'Please check your email and verify your account before signing in.',
        action: 'Check your email'
      }
    }

    if (errorCode.includes('Invalid refresh token')) {
      return {
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again.',
        action: 'Sign in again'
      }
    }

    if (errorCode.includes('Password reset')) {
      return {
        title: 'Password Reset Failed',
        message: 'The password reset link may have expired or is invalid.',
        action: 'Request a new reset link'
      }
    }

    return {
      title: 'Authentication Error',
      message: errorCode || 'An unexpected error occurred during authentication.',
      action: 'Try again'
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700">{errorInfo.title}</CardTitle>
            <CardDescription className="text-red-600">
              {errorInfo.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error.includes('Password reset') ? (
              <Link href="/auth/forgot-password">
                <Button className="w-full h-12 bg-red-600 hover:bg-red-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request New Reset Link
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button className="w-full h-12 bg-red-600 hover:bg-red-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            )}

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-2">Technical Details:</p>
              <p className="text-xs text-red-700 font-mono bg-red-100 p-2 rounded">
                {error}
              </p>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Return to Home Page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}