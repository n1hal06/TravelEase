"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AddRecordsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const addTravelAndPassengers = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Step 1: Check if we have required tables with data
      const { data: agencies, error: agencyError } = await supabase.from("agencies").select("*").limit(1)
      if (agencyError) throw new Error(`Agency error: ${agencyError.message}`)

      const { data: stations, error: stationError } = await supabase.from("stations").select("*").limit(1)
      if (stationError) throw new Error(`Station error: ${stationError.message}`)

      const { data: vehicles, error: vehicleError } = await supabase.from("vehicles").select("*").limit(1)
      if (vehicleError) throw new Error(`Vehicle error: ${vehicleError.message}`)

      const { data: users, error: userError } = await supabase.from("users").select("*").limit(1)
      if (userError) throw new Error(`User error: ${userError.message}`)

      // Create default records if needed
      let agencyId = agencies && agencies.length > 0 ? agencies[0].agencyid : null
      let stationId = stations && stations.length > 0 ? stations[0].stationid : null
      let vehicleId = vehicles && vehicles.length > 0 ? vehicles[0].vehicleid : null
      let userId = users && users.length > 0 ? users[0].userid : null

      // Create agency if needed
      if (!agencyId) {
        const agencyIdValue = Math.floor(Math.random() * 900) + 100
        const { data: newAgency, error } = await supabase
          .from("agencies")
          .insert({
            agencyid: agencyIdValue,
            name: "Default Agency",
            address: "123 Main St",
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to create agency: ${error.message}`)
        agencyId = newAgency.agencyid
      }

      // Create station if needed
      if (!stationId) {
        const stationIdValue = Math.floor(Math.random() * 900) + 100
        const { data: newStation, error } = await supabase
          .from("stations")
          .insert({
            stationid: stationIdValue,
            name: "Default Station",
            from: "Paris",
            to: "London",
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to create station: ${error.message}`)
        stationId = newStation.stationid
      }

      // Create vehicle if needed
      if (!vehicleId) {
        const vehicleIdValue = Math.floor(Math.random() * 900) + 100
        const { data: newVehicle, error } = await supabase
          .from("vehicles")
          .insert({
            vehicleid: vehicleIdValue,
            name: "Default Vehicle",
            vehicletype: "car",
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to create vehicle: ${error.message}`)
        vehicleId = newVehicle.vehicleid
      }

      // Create user if needed
      if (!userId) {
        const userIdValue = Math.floor(Math.random() * 900) + 100
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            userid: userIdValue,
            username: "defaultuser",
            password: "password123",
            email: "default@example.com",
            firstname: "Default",
            lastname: "User",
            verified: true,
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to create user: ${error.message}`)
        userId = newUser.userid
      }

      // Step 2: Create 5 travel records
      const travelRecords = []
      for (let i = 1; i <= 5; i++) {
        const travelId = Math.floor(Math.random() * 900) + 100 + i
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + i * 7) // Each travel is a week apart

        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 7) // 7-day trip

        const { data: travel, error } = await supabase
          .from("travels") // Using "travels" as the table name
          .insert({
            travelid: travelId,
            duration: 7,
            price: 50000 + i * 10000,
            date: startDate.toISOString().split("T")[0],
            dates: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
            agencyid: agencyId,
            stationid: stationId,
            vehicleid: vehicleId,
          })
          .select()
          .single()

        if (error) throw new Error(`Failed to create travel ${i}: ${error.message}`)
        travelRecords.push(travel)

        // Update the station with the travel ID
        const { error: updateError } = await supabase
          .from("stations")
          .update({ travelid: travelId })
          .eq("stationid", stationId)

        if (updateError) {
          console.error(`Failed to update station for travel ${i}: ${updateError.message}`)
          // Non-critical error, continue
        }
      }

      // Step 3: Create passenger records for each travel
      const passengerRecords = []
      for (const travel of travelRecords) {
        // Create 2 passengers per travel
        for (let i = 1; i <= 2; i++) {
          const passengerId = Math.floor(Math.random() * 900) + 100 + i

          const { data: passenger, error } = await supabase
            .from("passengers")
            .insert({
              passengerid: passengerId,
              userid: userId,
              travelid: travel.travelid,
              passengers_no: i + 1, // Random number of travelers
            })
            .select()
            .single()

          if (error) throw new Error(`Failed to create passenger for travel ${travel.travelid}: ${error.message}`)
          passengerRecords.push(passenger)
        }
      }

      setResult({
        travels: travelRecords,
        passengers: passengerRecords,
      })
    } catch (err: any) {
      console.error("Error adding records:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-heading font-semibold text-primary">
            TravelEase
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Add Travel & Passenger Records</h1>

          <p className="mb-6 text-muted-foreground">
            This utility will add 5 travel records and 10 passenger records to your database. Use this if you need to
            quickly populate these tables for testing.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <p className="font-bold">Success!</p>
              <p>
                Created {result.travels.length} travel records and {result.passengers.length} passenger records.
              </p>
            </div>
          )}

          <button
            onClick={addTravelAndPassengers}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-primary text-black hover:bg-primary/90"
            }`}
          >
            {loading ? "Adding Records..." : "Add Travel & Passenger Records"}
          </button>
        </div>
      </main>
    </div>
  )
}
