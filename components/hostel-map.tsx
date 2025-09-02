"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Calendar } from "lucide-react"

interface HostelArea {
  id: string
  name: string
  university: string
  coordinates: { lat: number; lng: number }
  hostels: Hostel[]
}

interface Hostel {
  id: string
  name: string
  price: number
  rating: number
  area: string
  coordinates: { lat: number; lng: number }
  image: string
  available: boolean
}

const mockHostelAreas: HostelArea[] = [
  {
    id: "kwasu-westend",
    name: "Westend Area",
    university: "KWASU",
    coordinates: { lat: 8.4799, lng: 4.5418 },
    hostels: [
      {
        id: "1",
        name: "Westend Lodge 1",
        price: 175000,
        rating: 4.2,
        area: "Westend",
        coordinates: { lat: 8.4799, lng: 4.5418 },
        image: "/modern-hostel-room-.png",
        available: true,
      },
      {
        id: "2",
        name: "Westend Lodge 2",
        price: 200000,
        rating: 4.5,
        area: "Westend",
        coordinates: { lat: 8.4805, lng: 4.5425 },
        image: "/modern-hostel-room-.png",
        available: true,
      },
    ],
  },
  {
    id: "kwasu-safari",
    name: "Safari Area",
    university: "KWASU",
    coordinates: { lat: 8.482, lng: 4.545 },
    hostels: [
      {
        id: "3",
        name: "Safari Heights 1",
        price: 180000,
        rating: 4.3,
        area: "Safari",
        coordinates: { lat: 8.482, lng: 4.545 },
        image: "/modern-hostel-room-.png",
        available: true,
      },
      {
        id: "4",
        name: "Safari Heights 2",
        price: 195000,
        rating: 4.1,
        area: "Safari",
        coordinates: { lat: 8.4825, lng: 4.5455 },
        image: "/modern-hostel-room-.png",
        available: false,
      },
    ],
  },
  {
    id: "kwasu-chapel",
    name: "Chapel Road Area",
    university: "KWASU",
    coordinates: { lat: 8.478, lng: 4.538 },
    hostels: [
      {
        id: "5",
        name: "Chapel Road Lodge 1",
        price: 165000,
        rating: 4.0,
        area: "Chapel Road",
        coordinates: { lat: 8.478, lng: 4.538 },
        image: "/modern-hostel-room-.png",
        available: true,
      },
      {
        id: "6",
        name: "Chapel Road Lodge 2",
        price: 185000,
        rating: 4.4,
        area: "Chapel Road",
        coordinates: { lat: 8.4785, lng: 4.5385 },
        image: "/modern-hostel-room-.png",
        available: true,
      },
    ],
  },
]

export default function HostelMap() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null)

  const selectedAreaData = mockHostelAreas.find((area) => area.id === selectedArea)

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Map Area */}
        <div className="lg:col-span-2 bg-muted rounded-lg relative overflow-hidden">
          {/* Mock Map Interface */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10">
            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
              <h3 className="font-semibold text-sm">KWASU Hostel Areas</h3>
              <p className="text-xs text-muted-foreground">Click areas to explore hostels</p>
            </div>

            {/* Mock Map Markers */}
            <div className="relative w-full h-full">
              {mockHostelAreas.map((area, index) => (
                <button
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${
                    selectedArea === area.id ? "z-20" : "z-10"
                  }`}
                  style={{
                    left: `${30 + index * 25}%`,
                    top: `${40 + index * 15}%`,
                  }}
                >
                  <div
                    className={`bg-accent text-accent-foreground rounded-full p-3 shadow-lg border-2 ${
                      selectedArea === area.id ? "border-foreground scale-110" : "border-background"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                    <div className="bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium whitespace-nowrap">
                      {area.name}
                    </div>
                  </div>
                </button>
              ))}

              {/* Individual Hostel Markers */}
              {selectedAreaData?.hostels.map((hostel, index) => (
                <button
                  key={hostel.id}
                  onClick={() => setSelectedHostel(hostel)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-105 z-30 ${
                    selectedHostel?.id === hostel.id ? "scale-110" : ""
                  }`}
                  style={{
                    left: `${30 + mockHostelAreas.findIndex((a) => a.id === selectedArea) * 25 + index * 8}%`,
                    top: `${40 + mockHostelAreas.findIndex((a) => a.id === selectedArea) * 15 + index * 8}%`,
                  }}
                >
                  <div
                    className={`bg-primary text-primary-foreground rounded-full p-2 shadow-md border ${
                      selectedHostel?.id === hostel.id ? "border-accent" : "border-background"
                    }`}
                  >
                    <div className="w-2 h-2 bg-current rounded-full" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          {!selectedArea ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Select an Area</h3>
              <p className="text-sm text-muted-foreground">Click on a map marker to view hostels in that area</p>
            </div>
          ) : (
            <>
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-lg">{selectedAreaData?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedAreaData?.university}</p>
                <Badge variant="secondary" className="mt-2">
                  {selectedAreaData?.hostels.length} hostels available
                </Badge>
              </div>

              <div className="space-y-3">
                {selectedAreaData?.hostels.map((hostel) => (
                  <Card
                    key={hostel.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedHostel?.id === hostel.id ? "ring-2 ring-accent" : ""
                    }`}
                    onClick={() => setSelectedHostel(hostel)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={hostel.image || "/placeholder.svg"}
                          alt={hostel.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{hostel.name}</h4>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Star className="w-3 h-3 fill-accent text-accent mr-1" />
                              {hostel.rating}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{hostel.area} Area</p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">₦{hostel.price.toLocaleString()}/sem</span>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-accent hover:bg-accent/90 text-accent-foreground"
                              disabled={!hostel.available}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {hostel.available ? "Book" : "Full"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setSelectedArea(null)
                  setSelectedHostel(null)
                }}
              >
                Back to Areas
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
