import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const travelId = searchParams.get("travelId")

  if (!travelId) {
    return NextResponse.json({ error: "Travel ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from("passengers").select("*").eq("travelid", travelId)

    if (error) {
      console.error("Error fetching passengers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in passengers API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
