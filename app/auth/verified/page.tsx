'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface VerifiedPageProps {
  searchParams?: { email?: string }
}

export default function VerifiedPage({ searchParams }: VerifiedPageProps) {
  const email = searchParams?.email || ''

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-black/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-black" />
            </div>
            <CardTitle className="text-2xl text-black">Email Verified!</CardTitle>
            <CardDescription className="text-black/70">
              {email ? `Your email (${email}) has been successfully verified.` : 'Your email has been successfully verified.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-black/80 mb-4 text-center">
              You can now proceed to login and access your account.
            </p>
            <Link href="/auth/login">
              <button className="w-full h-12 border border-black bg-black/10 text-black font-semibold hover:bg-black/20 transition">
                Continue to Sign In
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}