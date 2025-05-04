import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if the superadmins table exists and its structure
    const { data: tableInfo, error: tableError } = await supabase.from("superadmins").select("*").limit(1)

    if (tableError) {
      return NextResponse.json({
        success: false,
        message: "Error checking superadmins table",
        error: tableError.message,
      })
    }

    // Get the column information
    const { data: columns, error: columnsError } = await supabase.rpc("get_column_info", { table_name: "superadmins" })

    // If the RPC doesn't exist, we'll just return what we know
    const columnInfo = columnsError ? "Unable to fetch column info" : columns

    return NextResponse.json({
      success: true,
      message: "Superadmins table check complete",
      tableExists: true,
      sampleData: tableInfo,
      columns: columnInfo,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Error checking admin setup",
      error: error.message,
    })
  }
}

export async function POST() {
  try {
    // Create a test admin user if needed
    const testAdmin = {
      superadminid: 1,
      user_id: 1,
      password: "admin123",
    }

    const { data, error } = await supabase.from("superadmins").upsert(testAdmin).select()

    if (error) {
      return NextResponse.json({
        success: false,
        message: "Error creating test admin",
        error: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Test admin created successfully",
      admin: data,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Error creating test admin",
      error: error.message,
    })
  }
}
