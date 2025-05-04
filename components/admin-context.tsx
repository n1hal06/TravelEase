"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type AdminSession = {
  userId: string // Changed to string to match the varchar type in the database
  isAdmin: boolean
  timestamp: number
}

type AdminContextType = {
  adminSession: AdminSession | null
  setAdminSession: (session: AdminSession | null) => void
  logout: () => void
  login: (userId: string) => void // Changed to string
  isLoading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for admin session in localStorage
    const loadSession = () => {
      try {
        const storedSession = localStorage.getItem("adminSession")
        if (storedSession) {
          const session = JSON.parse(storedSession) as AdminSession

          // Check if session is expired (24 hours)
          const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000

          if (isExpired) {
            console.log("Admin session expired")
            localStorage.removeItem("adminSession")
            setAdminSession(null)
          } else {
            console.log("Admin session loaded:", session)
            setAdminSession(session)
          }
        }
      } catch (error) {
        console.error("Error parsing admin session:", error)
        localStorage.removeItem("adminSession")
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const login = (userId: string) => {
    // Changed to string
    console.log("Setting admin session for user:", userId)
    const newSession = {
      userId: userId,
      isAdmin: true,
      timestamp: Date.now(),
    }

    localStorage.setItem("adminSession", JSON.stringify(newSession))
    setAdminSession(newSession)
  }

  const logout = () => {
    console.log("Logging out admin")
    localStorage.removeItem("adminSession")
    setAdminSession(null)
    router.push("/select-role")
  }

  return (
    <AdminContext.Provider value={{ adminSession, setAdminSession, logout, login, isLoading }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
