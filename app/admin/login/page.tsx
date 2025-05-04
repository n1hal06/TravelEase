"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAdmin } from "@/components/admin-context"

export default function AdminLoginPage() {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAdmin()

  // For debugging purposes
  useEffect(() => {
    console.log("Admin login page mounted")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)
    setIsLoading(true)

    try {
      // Log the input values for debugging
      console.log("Login attempt with:", { userId, password })
      setDebugInfo(`Attempting login with user_id: ${userId}`)

      // Query the superadmins table - user_id is a varchar, not an integer
      const { data, error: queryError } = await supabase
        .from("superadmins")
        .select("*")
        .eq("user_id", userId) // Use the string value directly since user_id is varchar
        .eq("password", password)
        .single()

      console.log("Query result:", data, "Error:", queryError)

      // Show debug info in the UI
      if (queryError) {
        setDebugInfo(`Query error: ${queryError.message}`)
        throw new Error(`Database error: ${queryError.message}`)
      }

      if (!data) {
        setDebugInfo("No admin found with provided credentials")
        throw new Error("Invalid credentials. Please try again.")
      }

      // Login successful
      setDebugInfo("Login successful!")

      // Use the login function from context
      login(userId)

      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } catch (error: any) {
      console.error("Admin login error:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/select-role" className="text-2xl font-heading font-semibold text-primary">
            TravelEase
          </Link>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/select-role" className="flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Role Selection
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
            </div>

            <h1 className="text-2xl font-heading font-semibold mb-2 text-center text-primary">Admin Login</h1>
            <p className="text-muted-foreground mb-6 text-center">
              Enter your credentials to access the admin dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium mb-1 text-foreground">
                  User ID
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Enter your user ID (e.g., user1)</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {error && <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm">{error}</div>}

              {debugInfo && (
                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-700 text-sm">Debug: {debugInfo}</div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Logging In...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* Add test credentials for development */}
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 text-amber-700 text-sm">
              <p className="font-medium">Test Credentials:</p>
              <p>User ID: user1</p>
              <p>Password: 1234</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
