"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, DollarSign, Home, X } from "lucide-react";

export default function HostelSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [roomType, setRoomType] = useState(searchParams.get("roomType") || "");
  const [verified, setVerified] = useState(searchParams.get("verified") || "");

  // Debounce search - your method
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (location) params.set("location", location);
      if (priceMax) params.set("priceMax", priceMax);
      if (roomType) params.set("roomType", roomType);
      if (verified) params.set("verified", verified);

      router.push(`?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timeout);
  }, [q, location, priceMax, roomType, verified, router]);

  const resetFilters = () => {
    setQ("");
    setLocation("");
    setPriceMax("");
    setRoomType("");
    setVerified("");
    router.push("?");
  };

  const activeFilters = [q, location, priceMax, roomType, verified].filter(Boolean);

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6 shadow-sm">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search hostels by name or description..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Row - Mobile Friendly */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Location Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g., Covenant Gate)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Max Price Filter */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max price (₦)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Room Type Filter */}
        <div className="relative">
          <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">All Room Types</option>
            <option value="single">Single Room</option>
            <option value="shared">Shared Room</option>
            <option value="self-contain">Self Contain</option>
          </select>
        </div>

        {/* Verified Agents Filter */}
        <select
          value={verified}
          onChange={(e) => setVerified(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
        >
          <option value="">All Agents</option>
          <option value="true">Verified Agents</option>
          <option value="false">Unverified Agents</option>
        </select>
      </div>

      {/* Reset Button Only (Hide filter chips on mobile) */}
      {activeFilters.length > 0 && (
        <div className="flex justify-between items-center">
          {/* Show filter chips only on desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active:</span>
            <div className="flex items-center space-x-1">
              {q && <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Search</span>}
              {location && <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Location</span>}
              {priceMax && <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Price</span>}
              {roomType && <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Room</span>}
              {verified && <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Verified</span>}
            </div>
          </div>
          
          {/* Show filter count on mobile */}
          <div className="lg:hidden">
            <span className="text-sm text-gray-600">{activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active</span>
          </div>
          
          <button
            onClick={resetFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Reset All
          </button>
        </div>
      )}
    </div>
  );
}