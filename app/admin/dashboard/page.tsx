"use client"

import { useEffect, useState } from "react"
import { Calendar, CreditCard, User, MapPin, Search, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

type BookingRecord = {
  billingid: number
  orderid: number
  userid: number
  amountpaid: number
  ispaid: boolean
  // Remove created_at from the type
  user?: {
    firstname: string
    lastname: string
    email: string
  }
  order?: {
    status: string
    passengerid: number
  }
  // Simplified structure to avoid nested relationships
  from?: string
  to?: string
  station_name?: string
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeUsers: 0,
    activeDiscounts: 0,
  })

  useEffect(() => {
    console.log("Dashboard component mounted")
    fetchBookings()
    fetchStats()
  }, [])

  const fetchBookings = async () => {
    try {
      console.log("Fetching bookings...")
      setIsLoading(true)

      // First, get the basic billing information with user and order details
      // Remove the order by created_at since that column doesn't exist
      const { data: billingData, error: billingError } = await supabase
        .from("billings")
        .select(`
          *,
          user:users(*),
          order:orders(*)
        `)
        .order("billingid", { ascending: false }) // Order by billingid instead
        .limit(10)

      if (billingError) {
        console.error("Error fetching billings:", billingError)
        throw billingError
      }

      console.log("Billing data:", billingData)

      // Process the data to include route information
      const processedBookings = await Promise.all(
        (billingData || []).map(async (billing) => {
          try {
            // Only proceed if we have an order with a passenger ID
            if (billing.order?.passengerid) {
              // Get passenger details
              const { data: passengerData, error: passengerError } = await supabase
                .from("passengers")
                .select("travelid")
                .eq("passengerid", billing.order.passengerid)
                .single()

              if (passengerError) {
                console.log(`No passenger found for ID ${billing.order.passengerid}`)
                return billing
              }

              // If we have a travel ID, get the station information
              if (passengerData?.travelid) {
                // Get travel details to find the station ID
                const { data: travelData, error: travelError } = await supabase
                  .from("travels")
                  .select("stationid")
                  .eq("travelid", passengerData.travelid)
                  .single()

                if (travelError) {
                  console.log(`No travel found for ID ${passengerData.travelid}`)
                  return billing
                }

                // If we have a station ID, get the station details
                if (travelData?.stationid) {
                  const { data: stationData, error: stationError } = await supabase
                    .from("stations")
                    .select("from, to, name")
                    .eq("stationid", travelData.stationid)
                    .single()

                  if (stationError) {
                    console.log(`No station found for ID ${travelData.stationid}`)
                    return billing
                  }

                  // Add station information to the booking record
                  return {
                    ...billing,
                    from: stationData.from,
                    to: stationData.to,
                    station_name: stationData.name,
                  }
                }
              }
            }

            // Return the original billing data if we couldn't find additional information
            return billing
          } catch (error) {
            console.error("Error processing booking:", error)
            return billing
          }
        }),
      )

      console.log("Processed bookings:", processedBookings)
      setBookings(processedBookings)
    } catch (error: any) {
      console.error("Error in fetchBookings:", error)
      // Set empty array to avoid undefined errors
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log("Fetching stats...")
      // Get total bookings count
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from("billings")
        .select("*", { count: "exact", head: true })

      if (bookingsError) {
        console.error("Error fetching bookings count:", bookingsError)
      }

      // Get active users count
      const { count: usersCount, error: usersError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })

      if (usersError) {
        console.error("Error fetching users count:", usersError)
      }

      // Get active discounts count - check if is_active column exists
      let discountsCount = 0
      try {
        const { count, error } = await supabase.from("discounts").select("*", { count: "exact", head: true })

        if (!error) {
          discountsCount = count || 0
        }
      } catch (error) {
        console.error("Error fetching discounts count:", error)
      }

      console.log("Stats:", { bookingsCount, usersCount, discountsCount })
      setStats({
        totalBookings: bookingsCount || 0,
        activeUsers: usersCount || 0,
        activeDiscounts: discountsCount || 0,
      })
    } catch (error: any) {
      console.error("Error in fetchStats:", error)
      // Set default values to avoid undefined errors
      setStats({
        totalBookings: 0,
        activeUsers: 0,
        activeDiscounts: 0,
      })
    }
  }

  const handleViewDetails = (booking: BookingRecord) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      booking.billingid.toString().includes(searchLower) ||
      booking.user?.firstname?.toLowerCase().includes(searchLower) ||
      booking.user?.lastname?.toLowerCase().includes(searchLower) ||
      booking.user?.email?.toLowerCase().includes(searchLower) ||
      booking.from?.toLowerCase().includes(searchLower) ||
      booking.to?.toLowerCase().includes(searchLower) ||
      false
    )
  })

  // Get current date for display
  const currentDate = new Date().toLocaleDateString()

  return (
    <>
      <header className="bg-card border-b border-border p-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-foreground">{stats.activeUsers}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Active Discounts</h3>
            <p className="text-3xl font-bold text-foreground">{stats.activeDiscounts}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent Bookings</h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm bg-secondary rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.billingid} className="hover:bg-secondary/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{booking.billingid}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {booking.user?.firstname} {booking.user?.lastname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {booking.from || "N/A"} → {booking.to || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        ${booking.amountpaid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.ispaid
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {booking.ispaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-primary hover:text-primary/80"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Booking Details #{selectedBooking.billingid}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="text-sm font-medium">
                        {selectedBooking.user?.firstname} {selectedBooking.user?.lastname}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm font-medium">{selectedBooking.user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">User ID:</span>
                      <span className="text-sm font-medium">{selectedBooking.userid}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Travel Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <span className="text-sm font-medium">{selectedBooking.from || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">To:</span>
                      <span className="text-sm font-medium">{selectedBooking.to || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Station:</span>
                      <span className="text-sm font-medium">{selectedBooking.station_name || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Booking Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Booking ID:</span>
                      <span className="text-sm font-medium">#{selectedBooking.billingid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order ID:</span>
                      <span className="text-sm font-medium">#{selectedBooking.orderid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-sm font-medium">{currentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                          selectedBooking.ispaid
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {selectedBooking.ispaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="text-sm font-medium">${selectedBooking.amountpaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Method:</span>
                      <span className="text-sm font-medium">Credit Card</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Date:</span>
                      <span className="text-sm font-medium">{currentDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowDetailsModal(false)} className="apple-button">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
