'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface EnvStatus {
  environment: Record<string, boolean>
  details: Record<string, string>
  database: string
  timestamp: string
}

export function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkEnvironment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug')
      if (response.ok) {
        const data = await response.json()
        setEnvStatus(data)
      }
    } catch (error) {
      console.error('Environment check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  if (loading) {
    return (
      <Card className="border-2 border-border/50">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Checking environment...</p>
        </CardContent>
      </Card>
    )
  }

  if (!envStatus) {
    return (
      <Card className="border-2 border-destructive/50">
        <CardContent className="p-6 text-center">
          <XCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">Failed to check environment</p>
          <Button onClick={checkEnvironment} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const allConfigured = Object.values(envStatus.environment).every(Boolean)
  const dbConnected = envStatus.database.includes('successfully')

  return (
    <Card className="border-2 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allConfigured && dbConnected ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          Environment Status
        </CardTitle>
        <CardDescription>
          Configuration check for k-H platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Environment Variables</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(envStatus.environment).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{key}</span>
                <Badge variant={value ? 'default' : 'destructive'}>
                  {value ? 'Set' : 'Missing'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Database Connection</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm">PostgreSQL</span>
            <Badge variant={dbConnected ? 'default' : 'destructive'}>
              {dbConnected ? 'Connected' : 'Failed'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {envStatus.database}
          </p>
        </div>

        {!allConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Configuration Needed
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please check your .env.local file and ensure all required environment variables are set.
            </p>
          </div>
        )}

        <Button onClick={checkEnvironment} variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Check
        </Button>
      </CardContent>
    </Card>
  )
}