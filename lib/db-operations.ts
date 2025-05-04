import { supabase } from "./supabase"
import type { Database } from "./database.types"

// Type definitions for easier use
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Travel = Database["public"]["Tables"]["travels"]["Row"] // Using "travels" as the table name
export type Agency = Database["public"]["Tables"]["agencies"]["Row"]
export type Station = Database["public"]["Tables"]["stations"]["Row"]
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type Passenger = Database["public"]["Tables"]["passengers"]["Row"]
// Remove the Availability type
export type Discount = Database["public"]["Tables"]["discounts"]["Row"]
export type Billing = Database["public"]["Tables"]["billings"]["Row"]
export type Report = Database["public"]["Tables"]["reports"]["Row"]
export type Superadmin = Database["public"]["Tables"]["superadmins"]["Row"]
export type Op = Database["public"]["Tables"]["ops"]["Row"]

// User operations
// Update the createUser function to include a user ID
export async function createUser(userData: Omit<User, "verified">) {
  // Remove club field if it exists (since it's not in the database schema)
  const { club, ...userDataWithoutClub } = userData as any

  const { data, error } = await supabase
    .from("users")
    .insert({
      ...userDataWithoutClub,
      verified: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    throw error
  }
  return data
}

export async function getUserById(userId: number) {
  const { data, error } = await supabase.from("users").select("*").eq("userid", userId).single()

  if (error) throw error
  return data
}

// Fixed getUserByEmail function to use maybeSingle() instead of single()
export async function getUserByEmail(email: string) {
  try {
    console.log(`Fetching user with email: ${email}`)

    // Use maybeSingle() instead of single() to handle the case where no user is found
    const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle()

    if (error) {
      console.error("Error fetching user by email:", error)
      throw error
    }

    // data will be null if no user is found
    if (!data) {
      console.log(`No user found with email: ${email}`)
    } else {
      console.log(`Found user with email: ${email}`, data)
    }

    return data
  } catch (error) {
    console.error("Error in getUserByEmail:", error)
    throw error
  }
}

export async function getUserByAuthId(authId: string) {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("auth_id", authId).maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching user by auth ID:", error)
    return null
  }
}

export async function updateUser(userId: number, userData: Partial<User>) {
  const { data, error } = await supabase.from("users").update(userData).eq("userid", userId).select().single()

  if (error) throw error
  return data
}

// Travel operations
export async function getTravels(filters?: Partial<Travel>) {
  let query = supabase.from("travels").select("*") // Using "travels" as the table name

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getTravelById(travelId: number) {
  const { data, error } = await supabase
    .from("travels") // Using "travels" as the table name
    .select("*, agencies(*), stations(*), vehicles(*)")
    .eq("travelid", travelId)
    .single()

  if (error) throw error
  return data
}

export async function createTravel(travelData: Omit<Travel, "travelid">) {
  try {
    // Remove reservid if it's causing issues
    const { reservid, dates, duration, ...travelDataWithoutReservid } = travelData as any

    // Extract the number from the duration string (e.g., "9 days" -> 9)
    let durationValue: number
    if (typeof duration === "string") {
      const match = duration.match(/^(\d+)/)
      durationValue = match ? Number.parseInt(match[1], 10) : 1 // Default to 1 if parsing fails
    } else if (typeof duration === "number") {
      durationValue = duration
    } else {
      durationValue = 1 // Default value
    }

    // Generate a unique travel ID
    const travelId = Math.floor(Math.random() * 900) + 100

    // Create travel record with duration as a number
    // Make sure we're not passing null values for required fields
    const travelPayload = {
      travelid: travelId, // Add the generated travel ID
      ...travelDataWithoutReservid,
      // Use only the start date for the dates field
      dates: travelData.date, // Use the single date value instead of the range
      // Store duration as an integer
      duration: durationValue,
      // Ensure price is positive to satisfy the check constraint
      price: travelData.price > 0 ? travelData.price : 1, // Set minimum price to 1 if 0 or negative
    }

    // If stationid is null, remove it from the payload to avoid constraint errors
    if (travelPayload.stationid === null || travelPayload.stationid === undefined) {
      delete travelPayload.stationid
    }

    console.log("Creating travel with payload:", travelPayload)
    const { data, error } = await supabase.from("travels").insert(travelPayload).select().single() // Using "travels" as the table name

    if (error) {
      console.error("Error creating travel:", error)
      throw error
    }

    // Update the station with the travel ID if stationid is provided
    if (data && travelPayload.stationid) {
      const { error: updateError } = await supabase
        .from("stations")
        .update({ travelid: data.travelid })
        .eq("stationid", travelPayload.stationid)

      if (updateError) {
        console.error("Error updating station with travel ID:", updateError)
        // Non-critical error, continue
      }
    }

    return data
  } catch (error) {
    console.error("Error in createTravel:", error)
    throw error
  }
}

// Agency operations
export async function getAgencies() {
  const { data, error } = await supabase.from("agencies").select("*")

  if (error) throw error
  return data
}

export async function getAgencyById(agencyId: number) {
  const { data, error } = await supabase.from("agencies").select("*").eq("agencyid", agencyId).single()

  if (error) throw error
  return data
}

// Station operations
export async function getStations() {
  const { data, error } = await supabase.from("stations").select("*")

  if (error) throw error
  return data
}

export async function getStationById(stationId: number) {
  const { data, error } = await supabase.from("stations").select("*").eq("stationid", stationId).single()

  if (error) throw error
  return data
}

// Add this function to create a station
export async function createStation(stationData: {
  stationid: number
  name: string
  from: string // Changed from optional to required
  to: string // Changed from optional to required
  travelid?: number | null
}) {
  try {
    console.log("Creating station with data:", stationData)
    const { data, error } = await supabase.from("stations").insert(stationData).select().single()

    if (error) {
      console.error("Error creating station:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error in createStation:", error)
    throw error
  }
}

// Vehicle operations
export async function getVehicles() {
  const { data, error } = await supabase.from("vehicles").select("*")

  if (error) throw error
  return data
}

export async function getVehicleById(vehicleId: number) {
  const { data, error } = await supabase.from("vehicles").select("*").eq("vehicleid", vehicleId).single()

  if (error) throw error
  return data
}

// Update the existing createVehicle function or add if it doesn't exist
export async function createVehicle(vehicleData: {
  name: string
  vehicletype: string
}) {
  try {
    // Generate a random vehicle ID (3 digits)
    const vehicleId = Math.floor(Math.random() * 900) + 100

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        vehicleid: vehicleId,
        name: vehicleData.name,
        vehicletype: vehicleData.vehicletype,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating vehicle:", error)
      throw error
    }

    console.log("Successfully created vehicle:", data)
    return data
  } catch (error) {
    console.error("Error in createVehicle:", error)
    throw error
  }
}

// Order operations
export async function createOrder(orderData: Omit<Order, "orderid">) {
  const { data, error } = await supabase.from("orders").insert(orderData).select().single()

  if (error) {
    console.error("Error creating order:", error)
    throw error
  }
  return data
}

export async function getOrdersByUserId(userId: number) {
  const { data, error } = await supabase.from("orders").select("*, passengers(*)").eq("passengers.userid", userId)

  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId: number, status: string) {
  const { data, error } = await supabase.from("orders").update({ status }).eq("orderid", orderId).select().single()

  if (error) throw error
  return data
}

// Passenger operations
// Update the createPassenger function to ensure proper linking with travel records
export async function createPassenger(passengerData: Omit<Passenger, "passengerid">) {
  try {
    console.log("Creating passenger with data:", passengerData)

    // Generate a random passenger ID (6 digits)
    const passengerId = Math.floor(Math.random() * 900000) + 100000

    // First create the passenger record
    const { data: passengerRecord, error: passengerError } = await supabase
      .from("passengers")
      .insert({
        ...passengerData,
        passengerid: passengerId,
      })
      .select()
      .single()

    if (passengerError) {
      console.error("Error creating passenger:", passengerError)
      throw passengerError
    }

    console.log("Successfully created passenger:", passengerRecord)

    return passengerRecord
  } catch (error) {
    console.error("Error in passenger creation process:", error)
    throw error
  }
}

export async function getPassengersByTravelId(travelId: number) {
  const { data, error } = await supabase.from("passengers").select("*, users(*)").eq("travelid", travelId)

  if (error) throw error
  return data
}

// Discount operations
export async function getDiscountByCode(code: string) {
  const { data, error } = await supabase.from("discounts").select("*").eq("code", code).single()

  if (error) throw error
  return data
}

// Billing operations
export async function createBilling(billingData: Omit<Billing, "billingid">) {
  const { data, error } = await supabase.from("billings").insert(billingData).select().single()

  if (error) {
    console.error("Error creating billing:", error)
    throw error
  }
  return data
}

export async function getBillingsByUserId(userId: number) {
  const { data, error } = await supabase.from("billings").select("*, orders(*)").eq("userid", userId)

  if (error) throw error
  return data
}

// Report operations
export async function getReports() {
  const { data, error } = await supabase.from("reports").select("*")

  if (error) throw error
  return data
}

export async function createReport(reportData: Omit<Report, "reportid">) {
  const { data, error } = await supabase.from("reports").insert(reportData).select().single()

  if (error) {
    console.error("Error creating report:", error)
    throw error
  }
  return data
}

// Superadmin operations
export async function getSuperadminByUserId(userId: number) {
  const { data, error } = await supabase.from("superadmins").select("*").eq("userid", userId).single()

  if (error && error.code !== "PGRST116") throw error // Ignore "not found" errors
  return data
}

// Op operations
export async function createOp(opData: Omit<Op, "opid">) {
  const { data, error } = await supabase.from("ops").insert(opData).select().single()

  if (error) {
    console.error("Error creating op:", error)
    throw error
  }
  return data
}

export async function getOpsByUserId(userId: number) {
  const { data, error } = await supabase.from("ops").select("*").eq("userid", userId)

  if (error) throw error
  return data
}

// Update the createFlight function to handle time fields correctly
export async function createFlight(flightData: {
  name: string
  price: number
  from: string
  to: string
  date: string
}) {
  try {
    // Generate a random flight ID (3 digits)
    const flightId = Math.floor(Math.random() * 900) + 100

    // Format departure and arrival times (default to 10:00 and 14:00)
    const departureTime = "10:00:00"
    const arrivalTime = "14:00:00"

    const { data, error } = await supabase
      .from("flights")
      .insert({
        flightid: flightId,
        name: flightData.name,
        price: flightData.price,
        from: flightData.from,
        to: flightData.to,
        date: flightData.date,
        // Add time fields with proper time format
        departure_time: departureTime,
        arrival_time: arrivalTime,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating flight:", error)
      throw error
    }

    console.log("Successfully created flight:", data)
    return data
  } catch (error) {
    console.error("Error in createFlight:", error)
    throw error
  }
}

// Add this function to get flights by origin and destination
export async function getFlightsByRoute(from: string, to: string) {
  try {
    const { data, error } = await supabase.from("flights").select("*").eq("from", from).eq("to", to)

    if (error) {
      console.error("Error fetching flights:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getFlightsByRoute:", error)
    throw error
  }
}

// Add this function to insert resort details
export async function createResort(resortData: {
  name: string
  price: number
  address: string
}) {
  try {
    // Generate a random resort ID (3 digits)
    const resortId = Math.floor(Math.random() * 900) + 100

    const { data, error } = await supabase
      .from("resorts")
      .insert({
        resortid: resortId,
        name: resortData.name,
        price: resortData.price,
        address: resortData.address,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating resort:", error)
      throw error
    }

    console.log("Successfully created resort:", data)
    return data
  } catch (error) {
    console.error("Error in createResort:", error)
    throw error
  }
}

// Add this function to get resorts by location
export async function getResortsByLocation(location: string) {
  try {
    const { data, error } = await supabase.from("resorts").select("*").ilike("address", `%${location}%`)

    if (error) {
      console.error("Error fetching resorts:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getResortsByLocation:", error)
    throw error
  }
}

// Update the createCompleteBooking function to remove ticket-related code
export async function createCompleteBooking(userEmail: string, travelId: string | number, totalPrice: number) {
  try {
    console.log(`Creating booking for user ${userEmail}, travel ${travelId}, price ${totalPrice}`)

    // First, get the user by email
    const user = await getUserByEmail(userEmail)

    if (!user) {
      console.error(`User not found with email: ${userEmail}`)
      return {
        success: false,
        message: "User not found. Please log in again.",
      }
    }

    console.log(`Found user:`, user)
    const userId = user.userid

    // Get the travel details
    const { data: travel, error: travelError } = await supabase
      .from("travels")
      .select("*")
      .eq("travelid", travelId)
      .single()

    if (travelError || !travel) {
      console.error(`Travel not found with ID: ${travelId}`, travelError)
      return {
        success: false,
        message: "Travel information not found. Please try again.",
      }
    }

    console.log(`Found travel:`, travel)

    // Get the station details
    const { data: station, error: stationError } = await supabase
      .from("stations")
      .select("*")
      .eq("stationid", travel.stationid)
      .single()

    if (stationError) {
      console.error(`Error fetching station:`, stationError)
      // Non-critical error, continue with booking
    } else {
      console.log(`Found station:`, station)
    }

    // Create a passenger record with retry logic
    let passenger = null
    let passengerError = null
    let retryCount = 0
    const maxRetries = 5

    while (!passenger && retryCount < maxRetries) {
      try {
        // Generate a completely random passenger ID (6 digits)
        const passengerId = Math.floor(Math.random() * 900000) + 100000
        console.log(`Attempt ${retryCount + 1}: Creating passenger with ID: ${passengerId}`)

        const { data, error } = await supabase
          .from("passengers")
          .insert({
            passengerid: passengerId,
            userid: userId,
            travelid: travel.travelid,
            passengers_no: 1, // Add this line with default value 1
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating passenger (attempt ${retryCount + 1}):`, error)
          passengerError = error

          // If it's a duplicate key error, retry with a new ID
          if (error.code === "23505") {
            // PostgreSQL unique violation error code
            retryCount++
            continue
          } else {
            // For other errors, break the loop
            break
          }
        }

        passenger = data
        console.log(`Successfully created passenger:`, passenger)
        break
      } catch (error) {
        console.error(`Exception in passenger creation (attempt ${retryCount + 1}):`, error)
        passengerError = error
        retryCount++
      }
    }

    if (!passenger) {
      return {
        success: false,
        message: `Failed to create passenger after ${maxRetries} attempts: ${passengerError?.message || "Unknown error"}`,
      }
    }

    // Create an order record with retry logic
    let order = null
    let orderError = null
    retryCount = 0

    while (!order && retryCount < maxRetries) {
      try {
        // Generate a completely random order ID (6 digits)
        const orderId = Math.floor(Math.random() * 900000) + 100000
        console.log(`Attempt ${retryCount + 1}: Creating order with ID: ${orderId}`)

        const { data, error } = await supabase
          .from("orders")
          .insert({
            orderid: orderId,
            totalprice: totalPrice,
            status: "completed",
            passengerid: passenger.passengerid,
            discountid: null, // No discount by default
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating order (attempt ${retryCount + 1}):`, error)
          orderError = error

          // If it's a duplicate key error, retry with a new ID
          if (error.code === "23505") {
            retryCount++
            continue
          } else {
            // For other errors, break the loop
            break
          }
        }

        order = data
        console.log(`Successfully created order:`, order)
        break
      } catch (error) {
        console.error(`Exception in order creation (attempt ${retryCount + 1}):`, error)
        orderError = error
        retryCount++
      }
    }

    if (!order) {
      return {
        success: false,
        message: `Failed to create order after ${maxRetries} attempts: ${orderError?.message || "Unknown error"}`,
      }
    }

    // Create a billing record with retry logic
    let billing = null
    let billingError = null
    retryCount = 0

    while (!billing && retryCount < maxRetries) {
      try {
        // Generate a completely random billing ID (6 digits)
        const billingId = Math.floor(Math.random() * 900000) + 100000
        console.log(`Attempt ${retryCount + 1}: Creating billing with ID: ${billingId}`)

        const { data, error } = await supabase
          .from("billings")
          .insert({
            billingid: billingId,
            amountpaid: totalPrice,
            ispaid: true,
            orderid: order.orderid,
            userid: userId,
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating billing (attempt ${retryCount + 1}):`, error)
          billingError = error

          // If it's a duplicate key error, retry with a new ID
          if (error.code === "23505") {
            retryCount++
            continue
          } else {
            // For other errors, break the loop
            break
          }
        }

        billing = data
        console.log(`Successfully created billing:`, billing)
        break
      } catch (error) {
        console.error(`Exception in billing creation (attempt ${retryCount + 1}):`, error)
        billingError = error
        retryCount++
      }
    }

    if (!billing) {
      console.warn(`Failed to create billing after ${maxRetries} attempts: ${billingError?.message || "Unknown error"}`)
      // This is not critical, so we'll just log it and continue
    }

    // Return success with all created data
    return {
      success: true,
      message: "Booking completed successfully!",
      data: {
        passenger,
        order,
        travel,
        station: station || null,
        billing: billing || null,
      },
    }
  } catch (error: any) {
    console.error("Error in createCompleteBooking:", error)
    return {
      success: false,
      message: error.message || "An unexpected error occurred during booking",
    }
  }
}
