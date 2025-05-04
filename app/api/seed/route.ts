import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to insert data into a table
async function seedTable(table: string, data: any[]) {
  const { data: result, error } = await supabase.from(table).insert(data).select()

  if (error) {
    console.error(`Error seeding ${table}:`, error)
    throw new Error(`Failed to seed ${table}: ${error.message}`)
  }

  return result || []
}

// Sample data generation functions
function generateUsers(count: number) {
  const users = []
  for (let i = 1; i <= count; i++) {
    users.push({
      userid: i,
      username: `user${i}`,
      password: `password${i}`,
      email: `user${i}@example.com`,
      firstname: `First${i}`,
      lastname: `Last${i}`,
      verified: true,
      auth_id: `auth_${i}`, // Fake auth_id
    })
  }
  return users
}

function generateAgencies(count: number) {
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

function generateStations(count: number) {
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
  ]

  for (let i = 1; i <= count; i++) {
    const fromIndex = i % locations.length
    const toIndex = (i + 5) % locations.length // Make sure from and to are different

    stations.push({
      stationid: i,
      name: `${locations[fromIndex]} to ${locations[toIndex]}`,
      from: locations[fromIndex],
      to: locations[toIndex],
    })
  }
  return stations
}

export async function POST(request: NextRequest) {
  try {
    const results: Record<string, any> = {}

    // Seed users
    const users = generateUsers(10)
    results.users = await seedTable("users", users)

    // Seed agencies
    const agencies = generateAgencies(5)
    results.agencies = await seedTable("agencies", agencies)

    // Seed stations
    const stations = generateStations(10)
    results.stations = await seedTable("stations", stations)

    // Add more table seeding as needed...

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      results,
    })
  } catch (error: any) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
