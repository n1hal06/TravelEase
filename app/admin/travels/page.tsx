"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Eye, Calendar, MapPin, User, CreditCard } from "lucide-react"
import { supabase } from "@/lib/supabase"

type TravelRecord = {
  travelid: number
  date: string
  dates: string
  duration: number
  price: number
  agencyid: number
  stationid: number
  vehicleid: number
  agency?: {
    name: string
  }
  station?: {
    name: string
    from: string
    to: string
  }
  vehicle?: {
    name: string
    vehicletype: string
  }
  passengers?: {
    passengerid: number
    userid: number
    passengers_no: number
    user?: {
      firstname: string
      lastname: string
      email: string
    }
  }[]
}

export default function AdminTravels() {
  const [travels, setTravels] = useState<TravelRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTravel, setSelectedTravel] = useState<TravelRecord | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchTravels()
  }, [])

  const fetchTravels = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simplify the query to avoid complex joins
      const { data: travelsData, error: travelsError } = await supabase
        .from("travels")
        .select("*")
        .order("travelid", { ascending: false })

      if (travelsError) throw travelsError

      // Create an array to store the enhanced travel records
      const enhancedTravels: TravelRecord[] = []

      // Process each travel record
      for (const travel of travelsData || []) {
        try {
          // Get agency data if available
          let agency = null
          if (travel.agencyid) {
            const { data: agencyData } = await supabase
              .from("agencies")
              .select("*")
              .eq("agencyid", travel.agencyid)
              .single()
            agency = agencyData
          }

          // Get station data if available
          let station = null
          if (travel.stationid) {
            const { data: stationData } = await supabase
              .from("stations")
              .select("*")
              .eq("stationid", travel.stationid)
              .single()
            station = stationData
          }

          // Get vehicle data if available
          let vehicle = null
          if (travel.vehicleid) {
            const { data: vehicleData } = await supabase
              .from("vehicles")
              .select("*")
              .eq("vehicleid", travel.vehicleid)
              .single()
            vehicle = vehicleData
          }

          // Get passengers data if available
          const { data: passengersData } = await supabase
            .from("passengers")
            .select("*, user:users(*)")
            .eq("travelid", travel.travelid)

          // Add the enhanced travel record
          enhancedTravels.push({
            ...travel,
            agency: agency || undefined,
            station: station || undefined,
            vehicle: vehicle || undefined,
            passengers: passengersData || [],
          })
        } catch (err) {
          console.error(`Error processing travel ${travel.travelid}:`, err)
          // Still add the travel record even if we couldn't get all related data
          enhancedTravels.push({
            ...travel,
          })
        }
      }

      setTravels(enhancedTravels)
    } catch (err: any) {
      console.error("Error fetching travels:", err)
      setError(err.message || "Failed to load travel data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (travel: TravelRecord) => {
    setSelectedTravel(travel)
    setShowDetailsModal(true)
  }

  const filteredTravels = travels.filter((travel) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      travel.travelid.toString().includes(searchLower) ||
      travel.station?.from?.toLowerCase().includes(searchLower) ||
      travel.station?.to?.toLowerCase().includes(searchLower) ||
      travel.agency?.name?.toLowerCase().includes(searchLower) ||
      travel.passengers?.some(
        (p) =>
          p.user?.firstname?.toLowerCase().includes(searchLower) ||
          p.user?.lastname?.toLowerCase().includes(searchLower) ||
          p.user?.email?.toLowerCase().includes(searchLower),
      ) ||
      false
    )
  })

  return (
    <>
      <header className="bg-card border-b border-border h-16 flex items-center px-6">
        <h1 className="text-xl font-medium">Travel History</h1>
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search travels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm bg-secondary rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Travel Records</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button onClick={fetchTravels} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
              Try Again
            </button>
          </div>
        ) : filteredTravels.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Travel Records Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "No travel records match your search criteria."
                : "There are no travel bookings in the system yet."}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Travelers
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTravels.map((travel) => (
                  <tr key={travel.travelid} className="hover:bg-secondary/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{travel.travelid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {travel.station?.from || "N/A"} → {travel.station?.to || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {travel.date ? new Date(travel.date).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {travel.duration} {travel.duration === 1 ? "day" : "days"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      ${travel.price?.toFixed(2) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {travel.passengers?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary/80" onClick={() => handleViewDetails(travel)}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Travel Details Modal */}
      {showDetailsModal && selectedTravel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Travel Details #{selectedTravel.travelid}</h2>
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
                    <MapPin className="h-4 w-4 mr-2" />
                    Route Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <span className="text-sm font-medium">{selectedTravel.station?.from || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">To:</span>
                      <span className="text-sm font-medium">{selectedTravel.station?.to || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Station:</span>
                      <span className="text-sm font-medium">{selectedTravel.station?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Travel Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-sm font-medium">
                        {selectedTravel.date ? new Date(selectedTravel.date).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm font-medium">
                        {selectedTravel.duration} {selectedTravel.duration === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Agency:</span>
                      <span className="text-sm font-medium">{selectedTravel.agency?.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vehicle:</span>
                      <span className="text-sm font-medium">
                        {selectedTravel.vehicle?.name || "N/A"}
                        {selectedTravel.vehicle?.vehicletype ? ` (${selectedTravel.vehicle.vehicletype})` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="text-sm font-medium">${selectedTravel.price?.toFixed(2) || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Status:</span>
                      <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Traveler Information
                  </h3>
                  {selectedTravel.passengers && selectedTravel.passengers.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTravel.passengers.map((passenger) => (
                        <div
                          key={passenger.passengerid}
                          className="border-b border-border pb-2 last:border-0 last:pb-0"
                        >
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <span className="text-sm font-medium">
                              {passenger.user?.firstname || "N/A"} {passenger.user?.lastname || ""}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="text-sm font-medium">{passenger.user?.email || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Travelers:</span>
                            <span className="text-sm font-medium">{passenger.passengers_no}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No traveler information available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
