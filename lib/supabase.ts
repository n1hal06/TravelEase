import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"


// Initialize Supabase client with environment variables
const supabaseUrl = 'https://dkdcdubpmmuamdjyiylx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZGNkdWJwbW11YW1kanlpeWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MTQzNTMsImV4cCI6MjA1NzA5MDM1M30.ehQqfw39iNPAv5PiPkh9XTAkH0BxH3Ayyz0gRa2upns'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
