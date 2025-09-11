'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ConfirmationSentPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-black shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-black" />
            </div>
            <CardTitle className="text-2xl text-black">Confirmation Link Sent</CardTitle>
            <CardDescription className="text-black/70">
              We’ve sent a confirmation link to your email address. Please check your inbox (and spam folder) to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              variant="outline"
              className="w-full h-12 text-black border-black hover:bg-black hover:text-white"
              asChild
            >
              <Link href="/auth/register">
                <ArrowLeft className="w-4 h-4 mr-2 inline-block" />
                Back to Registration
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}