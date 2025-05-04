import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if the superadmins table exists and has data
    const { data, error, count } = await supabase.from("superadmins").select("*", { count: "exact" }).limit(1)

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          details: "Error querying superadmins table",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      hasData: count && count > 0,
      sampleData:
        data && data.length > 0
          ? {
              id: data[0].id,
              user_id: data[0].user_id,
              hasPassword: !!data[0].password,
            }
          : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        details: "Unexpected error checking admin table",
      },
      { status: 500 },
    )
  }
}
