"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, MapPin, Plane, Building, Ticket } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import { supabase } from "@/lib/supabase"
import { getUserByAuthId } from "@/lib/db-operations"

export default function MyTripsPage() {
  const router = useRouter()
  const { user } = useTravel()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dbUser, setDbUser] = useState<any>(null)

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch user's database record and trips
    const fetchUserAndTrips = async () => {
      try {
        setLoading(true)

        // Get user's database record
        const userData = await getUserByAuthId(user.id)
        if (userData) {
          setDbUser(userData)

          // Get user's trips from Supabase
          const { data: passengers, error } = await supabase
            .from("passengers")
            .select("*, travels(*), users(*)")
            .eq("userid", userData.userid)

          if (error) throw error

          if (passengers) {
            // Extract travel data
            const tripData = passengers.map((passenger) => passenger.travels)
            setTrips(tripData)
          }
        }
      } catch (error) {
        console.error("Error fetching trips:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndTrips()
  }, [user, router])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-primary">
            TravelEase
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">My Trips</h1>
          <p className="text-muted-foreground mb-8">View and manage your upcoming and past trips.</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <motion.div
                  key={trip.travelid}
                  whileHover={{ y: -5 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Trip #{trip.travelid}</h3>
                          <p className="text-sm text-muted-foreground">{trip.dates}</p>
                        </div>
                      </div>
                      <div className="text-lg font-bold">₹{trip.price.toLocaleString()}</div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Destination</div>
                          <div className="font-medium">Station #{trip.stationid}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="font-medium">{trip.duration}</div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Building className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                        <div>
                          <div className="text-sm text-muted-foreground">Agency</div>
                          <div className="font-medium">Agency #{trip.agencyid}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Link
                        href={`/booking/summary?travelId=${trip.travelid}`}
                        className="flex items-center text-primary hover:text-primary/80 text-sm"
                      >
                        <Ticket className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
              <h3 className="text-xl font-medium mb-2">No trips found</h3>
              <p className="text-muted-foreground mb-4">You haven't booked any trips yet.</p>
              <Link href="/booking/trip-details" className="apple-button inline-flex items-center">
                Plan Your First Trip
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
