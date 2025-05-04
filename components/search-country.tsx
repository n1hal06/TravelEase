"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, MapPin } from "lucide-react"
import { countries, type Country } from "@/lib/countries-data"

type SearchCountryProps = {
  onSelectCountry: (country: Country) => void
  placeholder?: string
}

export default function SearchCountry({ onSelectCountry, placeholder = "Search countries..." }: SearchCountryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = countries
        .filter(
          (country) =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.region.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 5) // Show only top 5 results

      setFilteredCountries(filtered)
      setIsDropdownOpen(true)
    } else {
      setFilteredCountries([])
      setIsDropdownOpen(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleCountryClick = (country: Country) => {
    onSelectCountry(country)
    setSearchTerm("")
    setIsDropdownOpen(false)
  }

  const handleClear = () => {
    setSearchTerm("")
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-10 py-2 bg-black/30 border border-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="absolute inset-y-0 right-3 flex items-center" onClick={handleClear}>
            <X className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {isDropdownOpen && filteredCountries.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-black/90 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredCountries.map((country) => (
            <div
              key={country.code}
              className="flex items-center px-4 py-3 hover:bg-black cursor-pointer"
              onClick={() => handleCountryClick(country)}
            >
              <div className="flex-shrink-0 h-8 w-8 bg-secondary rounded-full flex items-center justify-center mr-3">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{country.name}</p>
                <p className="text-gray-400 text-xs">{country.region}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
