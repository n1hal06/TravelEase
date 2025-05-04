import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Step 1: Check if we have required tables with data
    const { data: agencies } = await supabase.from("agencies").select("*").limit(1)
    const { data: stations } = await supabase.from("stations").select("*").limit(1)
    const { data: vehicles } = await supabase.from("vehicles").select("*").limit(1)
    const { data: users } = await supabase.from("users").select("*").limit(1)

    // Create default records if needed
    let agencyId = agencies && agencies.length > 0 ? agencies[0].agencyid : null
    let stationId = stations && stations.length > 0 ? stations[0].stationid : null
    let vehicleId = vehicles && vehicles.length > 0 ? vehicles[0].vehicleid : null
    let userId = users && users.length > 0 ? users[0].userid : null

    // Create agency if needed
    if (!agencyId) {
      const agencyIdValue = Math.floor(Math.random() * 900) + 100
      const { data: newAgency } = await supabase
        .from("agencies")
        .insert({
          agencyid: agencyIdValue,
          name: "Default Agency",
          address: "123 Main St",
        })
        .select()
        .single()

      agencyId = newAgency?.agencyid
    }

    // Create station if needed
    if (!stationId) {
      const stationIdValue = Math.floor(Math.random() * 900) + 100
      const { data: newStation } = await supabase
        .from("stations")
        .insert({
          stationid: stationIdValue,
          name: "Default Station",
          from: "Paris",
          to: "London",
        })
        .select()
        .single()

      stationId = newStation?.stationid
    }

    // Create vehicle if needed
    if (!vehicleId) {
      const vehicleIdValue = Math.floor(Math.random() * 900) + 100
      const { data: newVehicle } = await supabase
        .from("vehicles")
        .insert({
          vehicleid: vehicleIdValue,
          name: "Default Vehicle",
          vehicletype: "car",
        })
        .select()
        .single()

      vehicleId = newVehicle?.vehicleid
    }

    // Create user if needed
    if (!userId) {
      const userIdValue = Math.floor(Math.random() * 900) + 100
      const { data: newUser } = await supabase
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

      userId = newUser?.userid
    }

    // Step 2: Create travel records
    const travelRecords = []
    for (let i = 1; i <= 5; i++) {
      const travelId = Math.floor(Math.random() * 900) + 100 + i
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + i * 7) // Each travel is a week apart

      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7) // 7-day trip

      const { data: travel } = await supabase
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

      if (travel) {
        travelRecords.push(travel)

        // Update the station with the travel ID
        await supabase.from("stations").update({ travelid: travelId }).eq("stationid", stationId)
      }
    }

    // Step 3: Create passenger records for each travel
    const passengerRecords = []
    for (const travel of travelRecords) {
      // Create 2 passengers per travel
      for (let i = 1; i <= 2; i++) {
        const passengerId = Math.floor(Math.random() * 900) + 100 + i

        const { data: passenger } = await supabase
          .from("passengers")
          .insert({
            passengerid: passengerId,
            userid: userId,
            travelid: travel.travelid,
            passengers_no: i + 1, // Random number of travelers
          })
          .select()
          .single()

        if (passenger) passengerRecords.push(passenger)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Travel and passenger records added successfully",
      data: {
        travels: travelRecords.length,
        passengers: passengerRecords.length,
      },
    })
  } catch (error: any) {
    console.error("Error adding travel records:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
