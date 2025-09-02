'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function HostelsClient() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    try {
      const response = await fetch('/api/hostels')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Response:', data)
        
        if (data.success && Array.isArray(data.data)) {
          setHostels(data.data)
        }
      }
    } catch (error) {
      console.error('❌ Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading hostels...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Step 1: Add basic header - TEST IF THIS BREAKS */}
      <div className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Browse Hostels ({hostels.length})</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {hostels.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3>No hostels found</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {hostels.map((hostel, index) => (
              <Card key={hostel.id || index}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold">{hostel.title}</h3>
                  <p>Price: ₦{hostel.price?.toLocaleString()} / {hostel.price_type}</p>
                  <p>Room: {hostel.room_type}</p>
                  <p>Location: {hostel.location?.name}</p>
                  <p>Agent: {hostel.agent?.first_name} {hostel.agent?.last_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}