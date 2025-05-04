import { supabase } from "./supabase"

// Function to create a new discount
export async function createDiscount(discountData: {
  code: string
  discounttype: string
  amount?: number
  expiry_date?: string
  is_active?: boolean
}) {
  try {
    // Generate a random discount ID (3 digits)
    const discountId = Math.floor(Math.random() * 900) + 100

    const { data, error } = await supabase
      .from("discounts")
      .insert({
        discountid: discountId,
        code: discountData.code.toUpperCase(),
        discounttype: discountData.discounttype,
        amount: discountData.amount,
        expiry_date: discountData.expiry_date || null,
        is_active: discountData.is_active,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating discount:", error)
    throw error
  }
}

// Function to get all discounts
export async function getAllDiscounts() {
  try {
    const { data, error } = await supabase.from("discounts").select("*").order("discountid", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching discounts:", error)
    throw error
  }
}

// Function to delete a discount
export async function deleteDiscount(discountId: number) {
  try {
    const { error } = await supabase.from("discounts").delete().eq("discountid", discountId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting discount:", error)
    throw error
  }
}

// Function to get all travel records with related data
export async function getAllTravelRecords() {
  try {
    const { data, error } = await supabase
      .from("travels")
      .select(`
        *,
        agency:agencies(*),
        station:stations(*),
        vehicle:vehicles(*),
        passengers:passengers(*, user:users(*))
      `)
      .order("travelid", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching travel records:", error)
    throw error
  }
}

// Function to get all users
export async function getAllUsers() {
  try {
    const { data, error } = await supabase.from("users").select("*").order("userid", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

// Function to verify admin credentials
export async function verifyAdminCredentials(userId: number, password: string) {
  try {
    const { data, error } = await supabase
      .from("superadmins")
      .select("*")
      .eq("user_id", userId)
      .eq("password", password)
      .single()

    if (error) return null
    return data
  } catch (error) {
    console.error("Error verifying admin credentials:", error)
    return null
  }
}
