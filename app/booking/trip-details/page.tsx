"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Users, MapPin, ArrowRight, Globe, AlertCircle } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import { generateTransportationOptions } from "@/lib/data-generator"
import SimpleGlobe from "@/components/simple-globe"
import { getAgencies, getStations, createStation, getVehicles, getUserByAuthId } from "@/lib/db-operations"
import { supabase } from "@/lib/supabase"

export default function TripDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tripDetails, setTripDetails, setCurrentStep, user } = useTravel()

  const [formData, setFormData] = useState({
    travelers: tripDetails.travelers || 1,
    startDate: tripDetails.startDate || "",
    endDate: tripDetails.endDate || "",
  })

  const [errors, setErrors] = useState({
    origin: false,
    destination: false,
    startDate: false,
    endDate: false,
  })

  const [agencies, setAgencies] = useState<any[]>([])
  const [stations, setStations] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [dbUser, setDbUser] = useState<any>(null)
  const [dbError, setDbError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Fetch agencies, stations, and vehicles from Supabase
    const fetchData = async () => {
      try {
        const [agenciesData, stationsData, vehiclesData] = await Promise.all([
          getAgencies(),
          getStations(),
          getVehicles(),
        ])

        setAgencies(agenciesData)
        setStations(stationsData)
        setVehicles(vehiclesData)

        // If user is logged in, fetch their database record
        if (user) {
          const userData = await getUserByAuthId(user.id)
          if (userData) {
            setDbUser(userData)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    const destination = searchParams.get("destination")
    if (destination && (!tripDetails.destination || tripDetails.destination.name !== destination)) {
      // Only update if destination is different from what's already in state
      const destinationCoords = {
        name: destination,
        coordinates: { lat: 48.8566, lng: 2.3522 }, // Paris coordinates as example
      }
      setTripDetails((prev) => ({
        ...prev,
        destination: destinationCoords,
      }))
    }
  }, [searchParams, setTripDetails, tripDetails.destination])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "travelers" ? Number.parseInt(value) || 1 : value,
    }))
  }

  const handleSelectOrigin = (location: any) => {
    setTripDetails((prev) => ({
      ...prev,
      origin: location,
    }))
    setErrors((prev) => ({ ...prev, origin: false }))
  }

  const handleSelectDestination = (location: any) => {
    setTripDetails((prev) => ({
      ...prev,
      destination: location,
    }))
    setErrors((prev) => ({ ...prev, destination: false }))
  }

  // Function to add or get station
  const addOrGetStation = async (
    name: string,
    isOrigin: boolean,
    originName: string,
    destinationName: string,
    travelId?: number | null,
  ) => {
    try {
      // Check if station already exists
      const existingStations = await getStations()
      const existingStation = existingStations.find((station) => station.name.toLowerCase() === name.toLowerCase())

      if (existingStation) {
        console.log(`Found existing station: ${name}`, existingStation)
        return existingStation
      }

      // If not, create a new station
      const stationId = Math.floor(Math.random() * 1000000) + 1
      const newStation = await createStation({
        stationid: stationId,
        name: name,
        from: originName, // Always set the origin name for 'from'
        to: destinationName, // Always set the destination name for 'to'
        travelid: travelId, // Include the travel ID if available
      })

      console.log(`Created new station: ${name}`, newStation)
      return newStation
    } catch (error) {
      console.error(`Error adding/getting station ${name}:`, error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDbError(null)
    setIsSubmitting(true)

    // Validate form
    const newErrors = {
      origin: !tripDetails.origin,
      destination: !tripDetails.destination,
      startDate: !formData.startDate,
      endDate: !formData.endDate,
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((error) => error)) {
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Form submitted, creating travel and passenger records...")

      // Create default agency if none exists
      let agencyToUse = null
      try {
        // Try to get existing agencies
        const { data: existingAgencies, error: agencyError } = await supabase.from("agencies").select("*").limit(1)

        if (agencyError) throw agencyError

        if (existingAgencies && existingAgencies.length > 0) {
          agencyToUse = existingAgencies[0]
          console.log("Using existing agency:", agencyToUse)
        } else {
          // Create a default agency
          console.log("No agencies found, creating a default agency")
          const defaultAgencyId = Math.floor(Math.random() * 900) + 100
          const { data: newAgency, error: createError } = await supabase
            .from("agencies")
            .insert({
              agencyid: defaultAgencyId,
              name: "Default Travel Agency",
              address: "123 Main Street",
            })
            .select()
            .single()

          if (createError) throw createError
          agencyToUse = newAgency
          console.log("Created default agency:", agencyToUse)
        }
      } catch (error) {
        console.error("Error with agency:", error)
        setDbError("Failed to get or create agency. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Create default vehicle if none exists
      let vehicleToUse = null
      try {
        // Try to get existing vehicles
        const { data: existingVehicles, error: vehicleError } = await supabase.from("vehicles").select("*").limit(1)

        if (vehicleError) throw vehicleError

        if (existingVehicles && existingVehicles.length > 0) {
          vehicleToUse = existingVehicles[0]
          console.log("Using existing vehicle:", vehicleToUse)
        } else {
          // Create a default vehicle
          console.log("No vehicles found, creating a default vehicle")
          const defaultVehicleId = Math.floor(Math.random() * 900) + 100
          const { data: newVehicle, error: createError } = await supabase
            .from("vehicles")
            .insert({
              vehicleid: defaultVehicleId,
              name: "Standard Vehicle",
              vehicletype: "car",
            })
            .select()
            .single()

          if (createError) throw createError
          vehicleToUse = newVehicle
          console.log("Created default vehicle:", vehicleToUse)
        }
      } catch (error) {
        console.error("Error with vehicle:", error)
        setDbError("Failed to get or create vehicle. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Create origin station
      let originStation = null
      try {
        const originName = tripDetails.origin?.name || "Unknown Origin"
        const destinationName = tripDetails.destination?.name || "Unknown Destination"

        const stationId = Math.floor(Math.random() * 900) + 100
        const { data: newStation, error: stationError } = await supabase
          .from("stations")
          .insert({
            stationid: stationId,
            name: `${originName} to ${destinationName}`,
            from: originName,
            to: destinationName,
          })
          .select()
          .single()

        if (stationError) throw stationError
        originStation = newStation
        console.log("Created origin station:", originStation)
      } catch (error) {
        console.error("Error creating station:", error)
        setDbError("Failed to create station. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Calculate duration in days
      const startDateValue = new Date(formData.startDate)
      const endDateValue = new Date(formData.endDate)
      const durationDays = Math.ceil((endDateValue.getTime() - startDateValue.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Create travel record - Using "travels" as the table name
      let travelRecord = null
      try {
        const travelId = Math.floor(Math.random() * 900) + 100
        console.log("Creating travel record with ID:", travelId)

        const { data: newTravel, error: travelError } = await supabase
          .from("travels")
          .insert({
            travelid: travelId,
            duration: durationDays,
            price: 50000, // Default price
            date: formData.startDate, // Keep only the start date in the date field
            // Store the date range in a text field or remove it if not needed
            // If 'dates' is a text field in your database:
            dates: formData.startDate, // Just use start date for now
            agencyid: agencyToUse.agencyid,
            stationid: originStation.stationid,
            vehicleid: vehicleToUse.vehicleid,
          })
          .select()
          .single()

        if (travelError) {
          console.error("Error creating travel:", travelError)
          throw travelError
        }

        travelRecord = newTravel
        console.log("Successfully created travel record:", travelRecord)

        // Update the station with the travel ID
        const { error: updateStationError } = await supabase
          .from("stations")
          .update({ travelid: travelId })
          .eq("stationid", originStation.stationid)

        if (updateStationError) {
          console.error("Error updating station with travel ID:", updateStationError)
          // Non-critical error, continue
        } else {
          console.log("Updated station with travel ID:", travelId)
        }
      } catch (error) {
        console.error("Error creating travel:", error)
        setDbError("Failed to create travel record. Please try again.")
        setIsSubmitting(false)
        return
      }

      // Create passenger records if user is logged in
      if (user && dbUser && travelRecord) {
        try {
          console.log(`Creating ${formData.travelers} passenger records...`)

          // Create a passenger record for each traveler
          for (let i = 0; i < formData.travelers; i++) {
            const passengerId = Math.floor(Math.random() * 900) + 100 + i
            console.log(`Creating passenger ${i + 1} with ID:`, passengerId)

            const { data: passenger, error: passengerError } = await supabase
              .from("passengers")
              .insert({
                passengerid: passengerId,
                userid: dbUser.userid,
                travelid: travelRecord.travelid,
                passengers_no: formData.travelers,
              })
              .select()
              .single()

            if (passengerError) {
              console.error(`Error creating passenger ${i + 1}:`, passengerError)
              throw passengerError
            }
            console.log(`Successfully created passenger ${i + 1}:`, passenger)
          }
        } catch (error) {
          console.error("Error creating passengers:", error)
          // Continue even if passenger creation fails
        }
      }

      // Update trip details with the travel ID
      setTripDetails((prev) => ({
        ...prev,
        ...formData,
        travelId: travelRecord?.travelid,
        dateRange: `${formData.startDate} to ${formData.endDate}`,
        durationDays: durationDays,
        originStation: originStation,
        isInternational: tripDetails.origin?.name !== tripDetails.destination?.name,
      }))

      // Generate transportation options
      const startDateForTransport = new Date(formData.startDate)
      const endDateForTransport = new Date(formData.endDate)
      const isInternational = tripDetails.origin?.name !== tripDetails.destination?.name

      const transportOptions = generateTransportationOptions(
        tripDetails.origin?.name || "",
        tripDetails.destination?.name || "",
        isInternational,
        startDateForTransport,
        endDateForTransport,
      )

      setTripDetails((prev) => ({
        ...prev,
        transportations: transportOptions,
      }))

      // Update current step and navigate to next page
      setCurrentStep(2)
      setIsSubmitting(false)
      router.push("/booking/transportation")
    } catch (error: any) {
      console.error("Error in form submission:", error)
      setDbError(error.message || "An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-primary">
            TravelEase
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className={`progress-step ${step === 1 ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">
            Plan Your <span className="text-primary">Journey</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Select your locations and travel dates to begin crafting your perfect trip.
          </p>

          {dbError && (
            <div className="bg-destructive/20 text-destructive p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{dbError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
                <h2 className="text-xl font-semibold mb-4 text-primary">Trip Details</h2>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="travelers"
                        className="block text-sm font-medium mb-1 flex items-center text-foreground"
                      >
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        Travelers
                      </label>
                      <input
                        id="travelers"
                        name="travelers"
                        type="number"
                        min="1"
                        value={formData.travelers}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium mb-1 flex items-center text-foreground"
                      >
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        Start Date
                      </label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.startDate ? "border-destructive" : "border-input"} bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                        required
                      />
                      {errors.startDate && <p className="text-destructive text-sm mt-1">Please select a start date</p>}
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium mb-1 flex items-center text-foreground"
                      >
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        End Date
                      </label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.endDate ? "border-destructive" : "border-input"} bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                        required
                      />
                      {errors.endDate && <p className="text-destructive text-sm mt-1">Please select an end date</p>}
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-primary">Selected Locations</h2>
                  <MapPin className="h-5 w-5 text-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Origin</label>
                    <div
                      className={`px-4 py-3 rounded-xl border ${errors.origin ? "border-destructive" : "border-input"} bg-secondary`}
                    >
                      {tripDetails.origin ? (
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2" />
                          <span className="text-foreground">{tripDetails.origin.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select on map</span>
                      )}
                    </div>
                    {errors.origin && <p className="text-destructive text-sm mt-1">Please select an origin location</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Destination</label>
                    <div
                      className={`px-4 py-3 rounded-xl border ${errors.destination ? "border-destructive" : "border-input"} bg-secondary`}
                    >
                      {tripDetails.destination ? (
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                          <span className="text-foreground">{tripDetails.destination.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select on map</span>
                      )}
                    </div>
                    {errors.destination && (
                      <p className="text-destructive text-sm mt-1">Please select a destination location</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-primary flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  Interactive World Map
                </h2>
                <div className="text-xs text-muted-foreground">Click on a country to select</div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-sm"></div>
                <SimpleGlobe
                  onSelectOrigin={handleSelectOrigin}
                  onSelectDestination={handleSelectDestination}
                  origin={tripDetails.origin}
                  destination={tripDetails.destination}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="apple-button flex justify-center items-center"
              disabled={isSubmitting || Object.values(errors).some((error) => error)}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue to Transportation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
