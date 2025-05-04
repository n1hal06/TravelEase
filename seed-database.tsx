"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DatabaseSeeder() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [selectedTables, setSelectedTables] = useState<string[]>([
    "users",
    "agencies",
    "stations",
    "vehicles",
    "travels",
    "flights",
    "resorts",
    "discounts",
    "passengers",
    "orders",
    "billings",
  ])

  const tableOrder = [
    "users",
    "agencies",
    "stations",
    "vehicles",
    "travels",
    "flights",
    "resorts",
    "discounts",
    "passengers",
    "orders",
    "billings",
  ]

  const toggleTable = (table: string) => {
    if (selectedTables.includes(table)) {
      setSelectedTables(selectedTables.filter((t) => t !== table))
    } else {
      setSelectedTables([...selectedTables, table])
    }
  }

  const seedDatabase = async () => {
    setLoading(true)
    setError(null)
    setResults({})

    try {
      const newResults: Record<string, any> = {}

      // Seed each selected table in order
      for (const table of tableOrder) {
        if (selectedTables.includes(table)) {
          setResults((prev) => ({ ...prev, [table]: { status: "processing" } }))
          try {
            const result = await seedTable(table)
            newResults[table] = { status: "success", count: result.length }
            setResults((prev) => ({ ...prev, [table]: { status: "success", count: result.length } }))
          } catch (err: any) {
            newResults[table] = { status: "error", message: err.message }
            setResults((prev) => ({ ...prev, [table]: { status: "error", message: err.message } }))
          }
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const seedTable = async (table: string): Promise<any[]> => {
    const data = generateTableData(table)

    // Insert the data into the table
    const { data: result, error } = await supabase.from(table).insert(data).select()

    if (error) {
      console.error(`Error seeding ${table}:`, error)
      throw new Error(`Failed to seed ${table}: ${error.message}`)
    }

    return result || []
  }

  const generateTableData = (table: string): any[] => {
    switch (table) {
      case "users":
        return generateUsers(10)
      case "agencies":
        return generateAgencies(5)
      case "stations":
        return generateStations(15)
      case "vehicles":
        return generateVehicles(8)
      case "travels":
        return generateTravels(20)
      case "flights":
        return generateFlights(15)
      case "resorts":
        return generateResorts(10)
      case "discounts":
        return generateDiscounts(5)
      case "passengers":
        return generatePassengers(25)
      case "orders":
        return generateOrders(15)
      case "billings":
        return generateBillings(15)
      default:
        return []
    }
  }

  const generateUsers = (count: number) => {
    const users = []
    for (let i = 1; i <= count; i++) {
      users.push({
        userid: i,
        username: `user${i}`,
        password: `password${i}`,
        email: `user${i}@example.com`,
        firstname: `First${i}`,
        lastname: `Last${i}`,
        verified: Math.random() > 0.3, // 70% are verified
        auth_id: `auth_${i}`, // Fake auth_id
      })
    }
    return users
  }

  const generateAgencies = (count: number) => {
    const agencies = []
    const agencyNames = [
      "Sunshine Travels",
      "Global Adventures",
      "Exotic Journeys",
      "Luxury Escapes",
      "Wanderlust Agency",
    ]

    for (let i = 1; i <= count; i++) {
      agencies.push({
        agencyid: i,
        name: agencyNames[i - 1] || `Agency ${i}`,
        address: `${100 + i} Main Street, City ${i}`,
      })
    }
    return agencies
  }

  const generateStations = (count: number) => {
    const stations = []
    const locations = [
      "Paris",
      "London",
      "New York",
      "Tokyo",
      "Sydney",
      "Rome",
      "Barcelona",
      "Dubai",
      "Singapore",
      "Bangkok",
      "Cairo",
      "Cape Town",
      "Rio de Janeiro",
      "Toronto",
      "Berlin",
    ]

    for (let i = 1; i <= count; i++) {
      const fromIndex = i % locations.length
      const toIndex = (i + 5) % locations.length // Make sure from and to are different

      stations.push({
        stationid: i,
        name: `Station ${i}`,
        from: locations[fromIndex],
        to: locations[toIndex],
        travelid: null, // We're not linking to travels as per instructions
      })
    }
    return stations
  }

  const generateVehicles = (count: number) => {
    const vehicles = []
    const vehicleTypes = ["car", "van", "bike", "luxury", "cab"]
    const vehicleNames = [
      "Economy Car",
      "Family Van",
      "City Bike",
      "Premium Sedan",
      "Express Cab",
      "SUV",
      "Electric Scooter",
      "Luxury Limousine",
    ]

    for (let i = 1; i <= count; i++) {
      vehicles.push({
        vehicleid: i,
        name: vehicleNames[i - 1] || `Vehicle ${i}`,
        vehicletype: vehicleTypes[i % vehicleTypes.length],
      })
    }
    return vehicles
  }

  const generateTravels = (count: number) => {
    const travels = []

    for (let i = 1; i <= count; i++) {
      // Generate a random date in 2023
      const startDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      const duration = Math.floor(Math.random() * 14) + 3 // 3 to 16 days

      // Format date as ISO string and take just the date part
      const dateString = startDate.toISOString().split("T")[0]

      travels.push({
        travelid: i,
        duration: duration,
        price: Math.floor(Math.random() * 150000) + 10000, // 10,000 to 160,000
        date: dateString,
        dates: dateString, // Same as date
        agencyid: Math.floor(Math.random() * 5) + 1, // Random agency ID between 1-5
        stationid: Math.floor(Math.random() * 15) + 1, // Random station ID between 1-15
        vehicleid: Math.floor(Math.random() * 8) + 1, // Random vehicle ID between 1-8
      })
    }
    return travels
  }

  const generateFlights = (count: number) => {
    const flights = []
    const airlines = ["AirPod Airlines", "SkyWings", "Global Express", "Sunshine Airways", "Royal Pacific"]
    const locations = [
      "Paris",
      "London",
      "New York",
      "Tokyo",
      "Sydney",
      "Rome",
      "Barcelona",
      "Dubai",
      "Singapore",
      "Bangkok",
    ]

    for (let i = 1; i <= count; i++) {
      // Generate a random date in 2023
      const date = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)

      // Random from/to locations
      const fromIndex = Math.floor(Math.random() * locations.length)
      let toIndex
      do {
        toIndex = Math.floor(Math.random() * locations.length)
      } while (toIndex === fromIndex) // Ensure different locations

      // Format date as ISO string and take just the date part
      const dateString = date.toISOString().split("T")[0]

      // Generate random departure and arrival times
      const departureHour = Math.floor(Math.random() * 12) + 6 // 6 AM to 6 PM
      const arrivalHour = departureHour + 2 + Math.floor(Math.random() * 4) // 2-5 hours later

      const departureTime = `${departureHour.toString().padStart(2, "0")}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}:00`
      const arrivalTime = `${arrivalHour.toString().padStart(2, "0")}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}:00`

      flights.push({
        flightid: i,
        name: airlines[Math.floor(Math.random() * airlines.length)],
        price: Math.floor(Math.random() * 25000) + 5000, // 5,000 to 30,000
        from: locations[fromIndex],
        to: locations[toIndex],
        date: dateString,
        departure_time: departureTime,
        arrival_time: arrivalTime,
      })
    }
    return flights
  }

  const generateResorts = (count: number) => {
    const resorts = []
    const resortNames = [
      "Grand Plaza Hotel",
      "Seaside Resort & Spa",
      "Mountain View Lodge",
      "Luxury Suites",
      "City Center Inn",
      "Paradise Retreat",
      "Royal Palm Resort",
      "Golden Sands Hotel",
      "Urban Oasis",
      "Hilltop Haven",
    ]
    const locations = [
      "Paris",
      "London",
      "New York",
      "Tokyo",
      "Sydney",
      "Rome",
      "Barcelona",
      "Dubai",
      "Singapore",
      "Bangkok",
    ]

    for (let i = 1; i <= count; i++) {
      resorts.push({
        resortid: i,
        name: resortNames[i - 1] || `Resort ${i}`,
        price: Math.floor(Math.random() * 20000) + 5000, // 5,000 to 25,000
        address: `${locations[i % locations.length]} Central District`,
      })
    }
    return resorts
  }

  const generateDiscounts = (count: number) => {
    const discounts = []
    const discountCodes = ["SUMMER10", "WELCOME20", "HOLIDAY15", "FLASH25", "SPECIAL30"]
    const discountTypes = ["percentage", "fixed"]

    for (let i = 1; i <= count; i++) {
      discounts.push({
        discountid: i,
        code: discountCodes[i - 1] || `DISCOUNT${i}`,
        discounttype: discountTypes[i % 2],
      })
    }
    return discounts
  }

  const generatePassengers = (count: number) => {
    const passengers = []

    for (let i = 1; i <= count; i++) {
      passengers.push({
        passengerid: i,
        userid: Math.ceil(i / 3), // Distribute passengers among users
        travelid: Math.ceil(i / 2), // Distribute passengers among travels
        passengers_no: Math.floor(Math.random() * 4) + 1, // 1 to 4 passengers
        flightid: Math.random() > 0.2 ? Math.floor(Math.random() * 15) + 1 : null, // 80% have flights
        resortid: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null, // 70% have resorts
        vehicleid: Math.random() > 0.4 ? Math.floor(Math.random() * 8) + 1 : null, // 60% have vehicles
      })
    }
    return passengers
  }

  const generateOrders = (count: number) => {
    const orders = []
    const statuses = ["completed", "pending", "cancelled"]

    for (let i = 1; i <= count; i++) {
      orders.push({
        orderid: i,
        totalprice: Math.floor(Math.random() * 200000) + 20000, // 20,000 to 220,000
        status: statuses[Math.floor(Math.random() * statuses.length)],
        passengerid: i, // One order per passenger
        discountid: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : null, // 30% have discounts
      })
    }
    return orders
  }

  const generateBillings = (count: number) => {
    const billings = []

    for (let i = 1; i <= count; i++) {
      billings.push({
        billingid: i,
        amountpaid: Math.floor(Math.random() * 200000) + 20000, // 20,000 to 220,000
        ispaid: Math.random() > 0.2, // 80% are paid
        orderid: i, // One billing per order
        userid: Math.ceil(i / 2), // Distribute billings among users
      })
    }
    return billings
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Database Seeder</h1>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Select Tables to Seed</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tableOrder.map((table) => (
            <div key={table} className="flex items-center">
              <input
                type="checkbox"
                id={table}
                checked={selectedTables.includes(table)}
                onChange={() => toggleTable(table)}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor={table} className="ml-2 text-sm text-gray-700">
                {table}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={seedDatabase}
        disabled={loading || selectedTables.length === 0}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          loading || selectedTables.length === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {loading ? "Seeding Database..." : "Seed Database"}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Results</h2>
          <div className="overflow-hidden bg-white shadow-sm border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableOrder
                  .filter((table) => table in results)
                  .map((table) => (
                    <tr key={table}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{table}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {results[table].status === "processing" && (
                          <span className="text-yellow-600">Processing...</span>
                        )}
                        {results[table].status === "success" && <span className="text-green-600">Success</span>}
                        {results[table].status === "error" && <span className="text-red-600">Error</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {results[table].status === "success" && <span>{results[table].count} records inserted</span>}
                        {results[table].status === "error" && <span>{results[table].message}</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
