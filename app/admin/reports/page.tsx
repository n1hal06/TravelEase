"use client"

import { useEffect, useState } from "react"
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"

type ReportStats = {
  totalBookings: number
  totalRevenue: number
  topDestinations: { destination: string; count: number }[]
  bookingsByMonth: { month: string; count: number }[]
}

export default function AdminReports() {
  const [stats, setStats] = useState<ReportStats>({
    totalBookings: 0,
    totalRevenue: 0,
    topDestinations: [],
    bookingsByMonth: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)

      // Get total bookings count
      const { count: bookingsCount } = await supabase.from("billings").select("*", { count: "exact", head: true })

      // Get total revenue
      const { data: revenueData } = await supabase.from("billings").select("amountpaid")
      const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.amountpaid || 0), 0) || 0

      // Get top destinations
      const { data: stationsData } = await supabase
        .from("stations")
        .select("to, count")
        .order("count", { ascending: false })
        .limit(5)

      const topDestinations =
        stationsData?.map((item) => ({
          destination: item.to,
          count: item.count || 1,
        })) || []

      // Generate mock booking by month data
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const bookingsByMonth = months.map((month) => ({
        month,
        count: Math.floor(Math.random() * 50) + 5,
      }))

      setStats({
        totalBookings: bookingsCount || 0,
        totalRevenue,
        topDestinations: topDestinations.length
          ? topDestinations
          : [
              { destination: "Paris", count: 24 },
              { destination: "London", count: 18 },
              { destination: "New York", count: 15 },
              { destination: "Tokyo", count: 12 },
              { destination: "Rome", count: 10 },
            ],
        bookingsByMonth,
      })
    } catch (error: any) {
      console.error("Error fetching report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-medium">Reports & Analytics</h1>
        <button className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </button>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Total Bookings</h3>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
                <p className="text-sm text-muted-foreground mt-2">+12% from last month</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Total Revenue</h3>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">+8% from last month</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Average Booking Value</h3>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">
                  ${stats.totalBookings ? (stats.totalRevenue / stats.totalBookings).toFixed(2) : "0.00"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">-2% from last month</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Top Destinations</h3>
                <div className="space-y-4">
                  {stats.topDestinations.map((destination, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {index + 1}
                        </div>
                        <span className="ml-3 font-medium">{destination.destination}</span>
                      </div>
                      <span className="text-muted-foreground">{destination.count} bookings</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Bookings by Month</h3>
                <div className="h-64 flex items-end space-x-2">
                  {stats.bookingsByMonth.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-primary/80 rounded-t"
                        style={{ height: `${(item.count / 50) * 100}%`, minHeight: "10px" }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-2">{item.month.substring(0, 3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
