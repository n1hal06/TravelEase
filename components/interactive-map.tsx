"use client"

import { useState, useRef } from "react"
import { countries, type Country, regions, countryRegions } from "@/lib/countries-data"

type InteractiveMapProps = {
  onSelectOrigin: (location: any) => void
  onSelectDestination: (location: any) => void
  origin: any
  destination: any
}

export default function InteractiveMap({
  onSelectOrigin,
  onSelectDestination,
  origin,
  destination,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [mapMode, setMapMode] = useState<"origin" | "destination">(origin ? "destination" : "origin")

  // Filter countries by region if a region is selected
  const displayedCountries = activeRegion ? countryRegions[activeRegion] : countries

  const handleCountryClick = (country: Country) => {
    const location = {
      name: country.name,
      coordinates: country.coordinates,
    }

    if (mapMode === "origin") {
      onSelectOrigin(location)
      setMapMode("destination")
    } else {
      onSelectDestination(location)
      setMapMode("origin") // Reset to origin for next selection
    }
  }

  const getCountryColor = (country: Country) => {
    if (origin && origin.name === country.name) {
      return "bg-blue-500"
    }
    if (destination && destination.name === country.name) {
      return "bg-red-500"
    }
    if (hoveredCountry && hoveredCountry.name === country.name) {
      return "bg-accent/70"
    }
    return "bg-gray-300 dark:bg-secondary"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {mapMode === "origin" ? "Select origin country" : "Select destination country"}
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-xs">Origin</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-xs">Destination</span>
          </div>
        </div>
      </div>

      {/* Region filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveRegion(null)}
          className={`px-2 py-1 text-xs rounded-full ${
            activeRegion === null ? "bg-primary text-white" : "bg-secondary dark:bg-black"
          }`}
        >
          All
        </button>
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`px-2 py-1 text-xs rounded-full ${
              activeRegion === region ? "bg-primary text-white" : "bg-secondary dark:bg-black"
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="relative w-full h-[400px] bg-secondary dark:bg-gray-900 rounded-2xl overflow-hidden border border-border"
      >
        {/* World map background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3')] bg-cover opacity-20"></div>

        {/* Country markers */}
        {displayedCountries.map((country) => (
          <div
            key={country.code}
            className={`absolute w-5 h-5 rounded-full ${getCountryColor(country)} transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 hover:z-10`}
            style={{
              left: `${country.position.x * 100}%`,
              top: `${country.position.y * 100}%`,
              zIndex:
                (hoveredCountry && hoveredCountry.name === country.name) ||
                (origin && origin.name === country.name) ||
                (destination && destination.name === country.name)
                  ? 10
                  : 1,
            }}
            onClick={() => handleCountryClick(country)}
            onMouseEnter={() => setHoveredCountry(country)}
            onMouseLeave={() => setHoveredCountry(null)}
          >
            {/* Country tooltip */}
            {hoveredCountry && hoveredCountry.name === country.name && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap">
                {country.name}
              </div>
            )}
          </div>
        ))}

        {/* Connection line between origin and destination */}
        {origin && destination && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line
              x1={`${origin.coordinates ? origin.coordinates.lng / 360 + 0.5 : 0}%`}
              y1={`${origin.coordinates ? 0.5 - origin.coordinates.lat / 180 : 0}%`}
              x2={`${destination.coordinates ? destination.coordinates.lng / 360 + 0.5 : 0}%`}
              y2={`${destination.coordinates ? 0.5 - destination.coordinates.lat / 180 : 0}%`}
              stroke="rgba(99, 102, 241, 0.6)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}
      </div>

      {/* Country list for mobile/alternative selection */}
      <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-border">
        <div className="sticky top-0 bg-card p-2 border-b border-border">
          <input
            type="text"
            placeholder="Search countries..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
          {displayedCountries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleCountryClick(country)}
              className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                origin && origin.name === country.name
                  ? "bg-blue-500 text-white"
                  : (destination && destination.name === country.name)
                    ? "bg-red-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-black"
              }`}
            >
              {country.name}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          {origin && destination
            ? `Your trip: ${origin.name} → ${destination.name}`
            : origin
              ? `Origin: ${origin.name} - Now select your destination`
              : "Click on a country or use the list below to select your origin and destination"}
        </p>
      </div>
    </div>
  )
}
