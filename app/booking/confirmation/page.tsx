"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, Home, FileText } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ConfirmationPage() {
  const { tripDetails, totalPrice, resetBooking } = useTravel()

  // Calculate the discounted price
  const calculateDiscountedPrice = () => {
    if (!tripDetails.discount) return totalPrice

    if (tripDetails.discount.type === "percentage") {
      return totalPrice * (1 - tripDetails.discount.value / 100)
    } else if (tripDetails.discount.type === "fixed") {
      return Math.max(0, totalPrice - tripDetails.discount.value)
    }

    return totalPrice
  }

  const finalPrice = calculateDiscountedPrice()

  useEffect(() => {
    // Generate a PDF or receipt here if needed
    // This is where you would trigger any post-booking actions
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your trip to {tripDetails.destination?.name} has been successfully booked.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-sm text-muted-foreground">Destination</h3>
                  <p className="font-medium">{tripDetails.destination?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Travel Dates</h3>
                  <p className="font-medium">
                    {formatDate(tripDetails.startDate)} - {formatDate(tripDetails.endDate)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-sm text-muted-foreground">Travelers</h3>
                  <p className="font-medium">{tripDetails.travelers} person(s)</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Booking ID</h3>
                  <p className="font-medium">
                    TRV-
                    {Math.floor(Math.random() * 10000)
                      .toString()
                      .padStart(4, "0")}
                  </p>
                </div>
              </div>

              <div className="pb-4 border-b border-border">
                <h3 className="text-sm text-muted-foreground mb-2">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>{formatCurrency(totalPrice)}</p>
                  </div>

                  {tripDetails.discount && (
                    <div className="flex justify-between text-green-600">
                      <p>
                        Discount ({tripDetails.discount.code}){" "}
                        {tripDetails.discount.type === "percentage"
                          ? `${tripDetails.discount.value}%`
                          : formatCurrency(tripDetails.discount.value)}
                      </p>
                      <p>
                        -
                        {tripDetails.discount.type === "percentage"
                          ? formatCurrency((totalPrice * tripDetails.discount.value) / 100)
                          : formatCurrency(tripDetails.discount.value)}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between font-bold pt-2">
                    <p>Total Paid</p>
                    <p>{formatCurrency(finalPrice)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Next Steps</h3>
                <p>
                  A confirmation email has been sent to your registered email address with all the details of your
                  booking. You can also view your booking details in the My Trips section.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/" onClick={resetBooking} className="apple-button flex items-center justify-center">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
            <Link href="/my-trips" className="apple-button flex items-center justify-center">
              <FileText className="mr-2 h-4 w-4" />
              View My Trips
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
