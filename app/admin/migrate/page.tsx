'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Play,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

export default function MigrationPage() {
  const [dryRunResult, setDryRunResult] = useState<any>(null)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'analyze' | 'dry-run' | 'migrate' | 'complete'>('analyze')

  const runDryMigration = async () => {
    setIsLoading(true)
    try {
      console.log('🔄 Running migration dry run...')
      
      const response = await fetch('/api/admin/sync-existing-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: 'sync-existing-users-2024',
          dryRun: true
        })
      })

      const result = await response.json()
      console.log('🔄 Dry run result:', result)
      
      setDryRunResult(result)
      setCurrentStep('dry-run')
      
      if (result.success) {
        toast.success('Dry run completed successfully!')
      } else {
        toast.error('Dry run failed: ' + result.message)
      }
    } catch (error) {
      console.error('❌ Dry run error:', error)
      toast.error('Dry run failed')
    } finally {
      setIsLoading(false)
    }
  }

  const runActualMigration = async () => {
    if (!confirm('Are you sure you want to migrate all users? This will create them in Supabase Auth.')) {
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Running actual migration...')
      
      const response = await fetch('/api/admin/sync-existing-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: 'sync-existing-users-2024',
          dryRun: false
        })
      })

      const result = await response.json()
      console.log('✅ Migration result:', result)
      
      setMigrationResult(result)
      setCurrentStep('complete')
      
      if (result.success) {
        toast.success('Migration completed successfully!')
      } else {
        toast.error('Migration failed: ' + result.message)
      }
    } catch (error) {
      console.error('❌ Migration error:', error)
      toast.error('Migration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Migration Tool</h1>
          <p className="text-muted-foreground">
            Migrate existing users from custom table to Supabase Auth
          </p>
        </div>

        {/* Step 1: Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Step 1: Analyze Current Users
            </CardTitle>
            <CardDescription>
              Check how many users exist in custom table vs Supabase Auth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runDryMigration}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Analyze Users (Dry Run)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Dry Run Results */}
        {dryRunResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Step 2: Dry Run Results
              </CardTitle>
              <CardDescription>
                Analysis complete - here's what would be migrated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{dryRunResult.totalCustomUsers}</div>
                  <div className="text-blue-600">Users in Custom Table</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{dryRunResult.results?.filter((r: any) => r.action === 'would_sync').length || 0}</div>
                  <div className="text-green-600">Would be Migrated</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">{dryRunResult.results?.filter((r: any) => r.action === 'already_exists').length || 0}</div>
                  <div className="text-orange-600">Already Exist</div>
                </div>
              </div>

              {dryRunResult.results && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dryRunResult.results.slice(0, 10).map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                      <div>
                        <span className="font-medium">{result.email}</span>
                        <Badge variant="secondary" className="ml-2">{result.role}</Badge>
                      </div>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.action.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  {dryRunResult.results.length > 10 && (
                    <div className="text-center text-muted-foreground">
                      ... and {dryRunResult.results.length - 10} more users
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={runActualMigration}
                disabled={isLoading || !dryRunResult.success}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Migration
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Migration Results */}
        {migrationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Step 3: Migration Complete
              </CardTitle>
              <CardDescription>
                Migration finished - here are the results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <h3 className="font-semibold text-green-900 mb-2">Migration Summary</h3>
                <p className="text-green-800">{migrationResult.message}</p>
                <div className="mt-2 text-sm text-green-700">
                  <div>Total users: {migrationResult.totalCustomUsers}</div>
                  <div>Successfully migrated: {migrationResult.synced}</div>
                </div>
              </div>

              {migrationResult.results && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {migrationResult.results.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                      <div>
                        <span className="font-medium">{result.email}</span>
                        <Badge variant="secondary" className="ml-2">{result.role}</Badge>
                      </div>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.action.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. ✅ Users are now in both systems</li>
                  <li>2. 🔐 They can login with Supabase Auth</li>
                  <li>3. 📊 Dashboard will use custom table data</li>
                  <li>4. 🎯 Test login with existing users</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Migration Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <div>
                  <div className="font-medium">Analyze Users</div>
                  <div className="text-muted-foreground">Run dry migration to see what users exist and would be migrated</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-green-600 font-bold text-xs">2</span>
                </div>
                <div>
                  <div className="font-medium">Run Migration</div>
                  <div className="text-muted-foreground">Create users in Supabase Auth while keeping custom table data</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-purple-600 font-bold text-xs">3</span>
                </div>
                <div>
                  <div className="font-medium">Test Login</div>
                  <div className="text-muted-foreground">Existing users should now be able to login with their credentials</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}