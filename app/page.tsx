"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTravel } from "@/components/travel-context"

export default function RootPage() {
  const router = useRouter()
  const { user } = useTravel()

  useEffect(() => {
    // If user is already logged in, redirect directly to home
    if (user) {
      router.push("/home")
    } else {
      // Otherwise, show the role selection page
      router.push("/select-role")
    }
  }, [user, router])

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
