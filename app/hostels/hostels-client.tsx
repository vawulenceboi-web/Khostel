'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function HostelsClient() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    try {
      console.log('🏠 Fetching hostels...')
      
      const response = await fetch('/api/hostels')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Full API response:', JSON.stringify(data, null, 2))
        
        if (data.success && data.data) {
          setHostels(data.data)
          console.log('✅ Hostels set:', data.data.length)
        } else {
          setError('API returned invalid data structure')
        }
      } else {
        setError(`API failed with status: ${response.status}`)
      }
    } catch (err) {
      console.error('❌ Fetch error:', err)
      setError(`Fetch error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading hostels...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Hostels</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchHostels}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <div className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Browse Hostels</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Debug Info */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <p>API Status: Working ✅</p>
          <p>Hostels Found: {hostels.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
        </div>

        {/* Simple Hostels Display */}
        {hostels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-2">No Hostels Found</h3>
              <p>The API returned 0 hostels or data is not properly structured.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Found {hostels.length} Hostel(s)</h2>
            
            {hostels.map((hostel, index) => {
              console.log(`🏠 Rendering hostel ${index}:`, hostel)
              
              return (
                <Card key={index} className="p-4">
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold">
                        {hostel.title || 'No Title'}
                      </h3>
                      
                      <p className="text-gray-600">
                        Price: ₦{(hostel.price || 0).toLocaleString()} / {hostel.price_type || 'semester'}
                      </p>
                      
                      <p className="text-gray-600">
                        Room Type: {hostel.room_type || 'Unknown'}
                      </p>
                      
                      <p className="text-gray-600">
                        Location: {hostel.location?.name || 'No location'}
                      </p>
                      
                      <p className="text-gray-600">
                        Agent: {hostel.agent?.first_name || 'Unknown'} {hostel.agent?.last_name || ''}
                        {hostel.agent?.verified_status && ' ✅ Verified'}
                      </p>
                      
                      <p className="text-gray-600">
                        Available: {hostel.availability ? 'Yes' : 'No'}
                      </p>
                      
                      {hostel.images && hostel.images.length > 0 && (
                        <div>
                          <p className="font-medium">Images:</p>
                          <img 
                            src={hostel.images[0]} 
                            alt="Hostel" 
                            className="w-32 h-24 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      
                      <Button className="mt-4">
                        Book Inspection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Raw Data Display for Debugging */}
        <details className="mt-8">
          <summary className="cursor-pointer font-bold">Show Raw API Data</summary>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(hostels, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}