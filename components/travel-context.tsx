"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Coordinates = {
  lat: number
  lng: number
}

type Location = {
  name: string
  coordinates: Coordinates
}

// Add this new type to the existing types
type LocalTransportation = {
  id: string
  type: string
  name: string
  description: string
  pricePerDay: number
  image: string
  selected?: boolean
}

// Add station type
type Station = {
  stationid: number
  name: string
  from?: string | null
  to?: string | null
}

// Update the TripDetails type to include localTransportation and stations
type TripDetails = {
  travelers: number
  startDate: string
  endDate: string
  origin: Location | null
  destination: Location | null
  transportations: Transportation[]
  accommodations: Accommodation[]
  attractions: Attraction[]
  localTransportation: LocalTransportation[]
  travelId?: string
  dateRange?: string
  durationDays?: number
  isInternational?: boolean
  originStation?: Station
  destinationStation?: Station
  discount?: {
    code: string
    type: string
    value: number
    discountid?: number
  }
}

type Transportation = {
  id: string
  type: "outbound" | "return"
  company: string
  departureTime: string
  arrivalTime: string
  price: number
  selected?: boolean
  from: string
  to: string
  date: string
  image: string
}

type Accommodation = {
  id: string
  name: string
  location: string
  price: number
  rating: number
  amenities: string[]
  image: string
  selected?: boolean
}

type Attraction = {
  id: string
  name: string
  location: string
  price: number
  description: string
  image: string
  selected?: boolean
}

// Update the TravelContextType to include the new function
type TravelContextType = {
  tripDetails: TripDetails
  setTripDetails: (details: TripDetails | ((prev: TripDetails) => TripDetails)) => void
  selectTransportation: (id: string, type: "outbound" | "return") => void
  selectAccommodation: (id: string) => void
  selectAttraction: (id: string) => void
  selectLocalTransportation: (id: string) => void // Add this line
  totalPrice: number
  resetBooking: () => void
  currentStep: number
  setCurrentStep: (step: number) => void
  user: User | null
  setUser: (user: User | null) => void
}

// Simple user type for mock authentication
type User = {
  id: string
  email: string
}

// Update the defaultTripDetails to include localTransportation
const defaultTripDetails: TripDetails = {
  travelers: 1,
  startDate: "",
  endDate: "",
  origin: null,
  destination: null,
  transportations: [],
  accommodations: [],
  attractions: [],
  localTransportation: [], // Add this line
}

const TravelContext = createContext<TravelContextType | undefined>(undefined)

export function TravelProvider({ children }: { children: ReactNode }) {
  const [tripDetails, setTripDetails] = useState<TripDetails>(defaultTripDetails)
  const [currentStep, setCurrentStep] = useState(1)
  const [user, setUser] = useState<User | null>(null)

  const selectTransportation = (id: string, type: "outbound" | "return") => {
    setTripDetails((prev) => ({
      ...prev,
      transportations: prev.transportations.map((item) => ({
        ...item,
        selected: item.type === type ? item.id === id : item.selected,
      })),
    }))
  }

  const selectAccommodation = (id: string) => {
    setTripDetails((prev) => ({
      ...prev,
      accommodations: prev.accommodations.map((item) => ({
        ...item,
        selected: item.id === id,
      })),
    }))
  }

  const selectAttraction = (id: string) => {
    setTripDetails((prev) => ({
      ...prev,
      attractions: prev.attractions.map((item) => ({
        ...item,
        selected: item.id === id ? !item.selected : item.selected,
      })),
    }))
  }

  // Add a new function to select local transportation
  const selectLocalTransportation = (id: string) => {
    setTripDetails((prev) => ({
      ...prev,
      localTransportation: prev.localTransportation.map((item) => ({
        ...item,
        selected: item.id === id,
      })),
    }))
  }

  // Update the calculateTotalPrice function to include local transportation
  const calculateTotalPrice = () => {
    let total = 0

    // Add transportation cost
    const selectedTransportation = tripDetails.transportations.filter((t) => t.selected)
    selectedTransportation.forEach((transport) => {
      total += transport.price * tripDetails.travelers
    })

    // Add accommodation cost
    const selectedAccommodation = tripDetails.accommodations.find((a) => a.selected)
    if (selectedAccommodation) {
      const days = Math.ceil(
        (new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 60 * 60 * 24) +
          1,
      )
      total += selectedAccommodation.price * days
    }

    // Add attractions cost
    const selectedAttractions = tripDetails.attractions.filter((a) => a.selected)
    selectedAttractions.forEach((attraction) => {
      total += attraction.price * tripDetails.travelers
    })

    // Add local transportation cost
    const selectedLocalTransport = tripDetails.localTransportation.find((t) => t.selected)
    if (selectedLocalTransport) {
      const days = Math.ceil(
        (new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 60 * 60 * 24) +
          1,
      )
      total += selectedLocalTransport.pricePerDay * days
    }

    return total
  }

  const resetBooking = () => {
    setTripDetails(defaultTripDetails)
    setCurrentStep(1)
  }

  // Add the new function to the context value
  return (
    <TravelContext.Provider
      value={{
        tripDetails,
        setTripDetails,
        selectTransportation,
        selectAccommodation,
        selectAttraction,
        selectLocalTransportation, // Add this line
        totalPrice: calculateTotalPrice(),
        resetBooking,
        currentStep,
        setCurrentStep,
        user,
        setUser,
      }}
    >
      {children}
    </TravelContext.Provider>
  )
}

export function useTravel() {
  const context = useContext(TravelContext)
  if (context === undefined) {
    throw new Error("useTravel must be used within a TravelProvider")
  }
  return context
}
