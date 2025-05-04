"use server"

import { supabase } from "@/lib/supabase"
import { generateUniqueId } from "@/lib/utils"

// Server action to create a flight record
export async function createFlightAction(flightData: {
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
      throw new Error(`Failed to create flight: ${error.message}`)
    }

    console.log("Successfully created flight:", data)
    return data
  } catch (error: any) {
    console.error("Error in createFlightAction:", error)
    throw new Error(error.message || "An error occurred while creating the flight")
  }
}

// Server action to create a resort record
export async function createResortAction(resortData: {
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
      throw new Error(`Failed to create resort: ${error.message}`)
    }

    console.log("Successfully created resort:", data)
    return data
  } catch (error: any) {
    console.error("Error in createResortAction:", error)
    throw new Error(error.message || "An error occurred while creating the resort")
  }
}

// Server action to create a vehicle record
export async function createVehicleAction(vehicleData: {
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
      throw new Error(`Failed to create vehicle: ${error.message}`)
    }

    console.log("Successfully created vehicle:", data)
    return data
  } catch (error: any) {
    console.error("Error in createVehicleAction:", error)
    throw new Error(error.message || "An error occurred while creating the vehicle")
  }
}

// Server action to create a passenger record
export async function createPassengerAction(passengerData: {
  userid: number
  travelid: number
  passengers_no: number
  flightid?: number
  resortid?: number
  vehicleid?: number
}) {
  try {
    // Generate a unique passenger ID
    const passengerId = generateUniqueId("passenger")

    const { data, error } = await supabase
      .from("passengers")
      .insert({
        passengerid: passengerId,
        userid: passengerData.userid,
        travelid: passengerData.travelid,
        passengers_no: passengerData.passengers_no,
        flightid: passengerData.flightid,
        resortid: passengerData.resortid,
        vehicleid: passengerData.vehicleid,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating passenger:", error)
      throw new Error(`Failed to create passenger: ${error.message}`)
    }

    console.log("Successfully created passenger:", data)
    return data
  } catch (error: any) {
    console.error("Error in createPassengerAction:", error)
    throw new Error(error.message || "An error occurred while creating the passenger")
  }
}

// Server action to update passenger record with additional IDs
export async function updatePassengerAction(
  passengerId: number,
  updates: {
    flightid?: number
    resortid?: number
    vehicleid?: number
  },
) {
  try {
    const { data, error } = await supabase
      .from("passengers")
      .update(updates)
      .eq("passengerid", passengerId)
      .select()
      .single()

    if (error) {
      console.error("Error updating passenger:", error)
      throw new Error(`Failed to update passenger: ${error.message}`)
    }

    console.log("Successfully updated passenger:", data)
    return data
  } catch (error: any) {
    console.error("Error in updatePassengerAction:", error)
    throw new Error(error.message || "An error occurred while updating the passenger")
  }
}

// Add a server action to apply a discount to an order
export async function applyDiscountAction(orderId: number, discountId: number) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ discountid: discountId })
      .eq("orderid", orderId)
      .select()
      .single()

    if (error) {
      console.error("Error applying discount:", error)
      throw new Error(`Failed to apply discount: ${error.message}`)
    }

    console.log("Successfully applied discount:", data)
    return data
  } catch (error: any) {
    console.error("Error in applyDiscountAction:", error)
    throw new Error(error.message || "An error occurred while applying the discount")
  }
}

// Update the createCompleteBooking function to include discount information
export async function createCompleteBookingAction(
  userEmail: string,
  travelId: string | number,
  totalPrice: number,
  discountId?: number,
) {
  try {
    // Get the user by email
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", userEmail).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      throw new Error(`User not found: ${userError.message}`)
    }

    // Generate IDs
    const passengerId = generateUniqueId("passenger")
    const orderId = generateUniqueId("order")
    const billingId = generateUniqueId("billing")

    // Create passenger record
    const { data: passenger, error: passengerError } = await supabase
      .from("passengers")
      .insert({
        passengerid: passengerId,
        userid: user.userid,
        travelid: travelId,
        passengers_no: 1,
      })
      .select()
      .single()

    if (passengerError) {
      console.error("Error creating passenger:", passengerError)
      throw new Error(`Failed to create passenger: ${passengerError.message}`)
    }

    // Create order record with discount if provided
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        orderid: orderId,
        totalprice: totalPrice,
        status: "completed",
        passengerid: passengerId,
        discountid: discountId || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Create billing record
    const { data: billing, error: billingError } = await supabase
      .from("billings")
      .insert({
        billingid: billingId,
        amountpaid: totalPrice,
        ispaid: true,
        orderid: orderId,
        userid: user.userid,
      })
      .select()
      .single()

    if (billingError) {
      console.error("Error creating billing:", billingError)
      throw new Error(`Failed to create billing: ${billingError.message}`)
    }

    return {
      success: true,
      message: "Booking completed successfully!",
      data: {
        passenger,
        order,
        billing,
      },
    }
  } catch (error: any) {
    console.error("Error in createCompleteBookingAction:", error)
    return {
      success: false,
      message: error.message || "An unexpected error occurred during booking",
    }
  }
}
