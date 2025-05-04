"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Check, CreditCard, Tag, AlertCircle } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { formatCurrency, formatDate, calculateDays } from "@/lib/utils"
import { getDiscountByCode } from "@/lib/db-operations"
import { createCompleteBooking } from "@/lib/db-operations"

export default function BillingPage() {
  const router = useRouter()
  const { tripDetails, totalPrice, setTripDetails, currentStep, setCurrentStep, user } = useTravel()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    discountType: string
    value: number
  } | null>(null)
  const [discountError, setDiscountError] = useState("")
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState("")

  useEffect(() => {
    if (!tripDetails.destination) {
      router.push("/booking/trip-details")
      return
    }

    setCurrentStep(6)

    // Check if we should show the confirmation dialog immediately
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("showConfirmation") === "true") {
      setShowConfirmation(true)

      // Clean up the URL to remove the query parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [tripDetails, router, setCurrentStep])

  // Calculate the discounted price
  const calculateDiscountedPrice = () => {
    if (!appliedDiscount) return totalPrice

    if (appliedDiscount.discountType === "percentage") {
      return totalPrice * (1 - appliedDiscount.value / 100)
    } else if (appliedDiscount.discountType === "fixed") {
      return Math.max(0, totalPrice - appliedDiscount.value)
    }

    return totalPrice
  }

  const finalPrice = calculateDiscountedPrice()

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code")
      return
    }

    setIsApplyingDiscount(true)
    setDiscountError("")

    try {
      const discount = await getDiscountByCode(discountCode.trim())

      if (!discount) {
        setDiscountError("Invalid discount code")
        return
      }

      // For demo purposes, let's assume:
      // - If the code starts with "P", it's a percentage discount (e.g., P10 = 10% off)
      // - If the code starts with "F", it's a fixed amount discount (e.g., F500 = ₹500 off)
      let discountType = "fixed"
      let discountValue = 500 // Default value

      if (discount.discounttype === "percentage") {
        discountType = "percentage"
        discountValue = 10 // Default 10% off
      } else if (discount.discounttype === "fixed") {
        discountType = "fixed"
        discountValue = 500 // Default ₹500 off
      }

      setAppliedDiscount({
        code: discountCode,
        discountType,
        value: discountValue,
      })

      // Update trip details with discount information
      setTripDetails((prev) => ({
        ...prev,
        discount: {
          code: discountCode,
          type: discountType,
          value: discountValue,
          discountid: discount.discountid,
        },
      }))
    } catch (error) {
      console.error("Error applying discount:", error)
      setDiscountError("Failed to apply discount code")
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode("")
    setDiscountError("")

    // Remove discount from trip details
    setTripDetails((prev) => ({
      ...prev,
      discount: undefined,
    }))
  }

  const handleContinue = () => {
    setPaymentError("") // Clear any previous errors
    setShowConfirmation(true)
  }

  const proceedToPayment = async () => {
    if (!user) {
      router.push("/login?redirect=/booking/billing")
      return
    }

    setIsProcessingPayment(true)
    setPaymentError("") // Clear any previous errors

    try {
      // Create the booking in the database
      const result = await createCompleteBooking(user.email, tripDetails.travelId || 0, finalPrice)

      if (result.success) {
        // Navigate to confirmation page
        router.push("/booking/confirmation")
      } else {
        console.error("Booking failed:", result.message)
        setPaymentError(result.message || "Booking failed. Please try again.")
        setShowConfirmation(false) // Close the confirmation dialog
      }
    } catch (error: any) {
      console.error("Error processing payment:", error)
      setPaymentError(error.message || "An error occurred while processing your payment. Please try again.")
      setShowConfirmation(false) // Close the confirmation dialog
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Get selected items for summary
  const selectedTransportation = tripDetails.transportations.filter((t) => t.selected)
  const selectedAccommodation = tripDetails.accommodations.find((a) => a.selected)
  const selectedAttractions = tripDetails.attractions.filter((a) => a.selected)
  const selectedLocalTransport = tripDetails.localTransportation.find((t) => t.selected)

  // Calculate days
  const days = calculateDays(tripDetails.startDate, tripDetails.endDate)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold">
            TravelPod
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className={`progress-step ${step === 6 ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/booking/local-transport" className="flex items-center text-accent hover:text-accent/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Local Transport
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Billing & Payment</h1>
          <p className="text-muted-foreground mb-8">
            Review your trip details and complete your payment to finalize your booking.
          </p>

          {paymentError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Payment Error</p>
                <p>{paymentError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trip Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-4">Trip Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <div>
                      <h3 className="font-medium">Destination</h3>
                      <p className="text-muted-foreground">
                        {tripDetails.origin?.name} to {tripDetails.destination?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <h3 className="font-medium">Travel Dates</h3>
                      <p className="text-muted-foreground">
                        {formatDate(tripDetails.startDate)} - {formatDate(tripDetails.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Transportation */}
                  {selectedTransportation.length > 0 && (
                    <div className="pt-2 pb-4 border-b border-border">
                      <h3 className="font-medium mb-3">Transportation</h3>
                      {selectedTransportation.map((transport) => (
                        <div key={transport.id} className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                              <Image
                                src={transport.image || "/placeholder.svg"}
                                alt={transport.company}
                                width={32}
                                height={32}
                                className="rounded"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{transport.company}</p>
                              <p className="text-sm text-muted-foreground">
                                {transport.type === "outbound" ? "Outbound" : "Return"} • {transport.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(transport.price)}</p>
                            <p className="text-sm text-muted-foreground">per person</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Accommodation */}
                  {selectedAccommodation && (
                    <div className="pt-2 pb-4 border-b border-border">
                      <h3 className="font-medium mb-3">Accommodation</h3>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                            <Image
                              src={selectedAccommodation.image || "/placeholder.svg"}
                              alt={selectedAccommodation.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{selectedAccommodation.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedAccommodation.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(selectedAccommodation.price)}</p>
                          <p className="text-sm text-muted-foreground">per night</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attractions */}
                  {selectedAttractions.length > 0 && (
                    <div className="pt-2 pb-4 border-b border-border">
                      <h3 className="font-medium mb-3">Attractions</h3>
                      <div className="space-y-2">
                        {selectedAttractions.map((attraction) => (
                          <div key={attraction.id} className="flex justify-between items-center">
                            <p>{attraction.name}</p>
                            <p className="font-medium">{formatCurrency(attraction.price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Local Transportation */}
                  {selectedLocalTransport && (
                    <div className="pt-2 pb-4 border-b border-border">
                      <h3 className="font-medium mb-3">Local Transportation</h3>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                            <Image
                              src={selectedLocalTransport.image || "/placeholder.svg"}
                              alt={selectedLocalTransport.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{selectedLocalTransport.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedLocalTransport.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(selectedLocalTransport.pricePerDay)}</p>
                          <p className="text-sm text-muted-foreground">per day</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Travelers */}
                  <div className="pt-2 pb-4 border-b border-border">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Number of Travelers</h3>
                      <p className="font-medium">{tripDetails.travelers}</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="pt-2 pb-4 border-b border-border">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Duration</h3>
                      <p className="font-medium">{days} days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>

                <div className="space-y-4">
                  {/* Transportation Cost */}
                  {selectedTransportation.length > 0 && (
                    <div className="flex justify-between">
                      <p>Transportation</p>
                      <p>
                        {formatCurrency(
                          selectedTransportation.reduce((sum, t) => sum + t.price * tripDetails.travelers, 0),
                        )}
                      </p>
                    </div>
                  )}

                  {/* Accommodation Cost */}
                  {selectedAccommodation && (
                    <div className="flex justify-between">
                      <p>Accommodation ({days} nights)</p>
                      <p>{formatCurrency(selectedAccommodation.price * days)}</p>
                    </div>
                  )}

                  {/* Attractions Cost */}
                  {selectedAttractions.length > 0 && (
                    <div className="flex justify-between">
                      <p>Attractions ({selectedAttractions.length})</p>
                      <p>
                        {formatCurrency(
                          selectedAttractions.reduce((sum, a) => sum + a.price * tripDetails.travelers, 0),
                        )}
                      </p>
                    </div>
                  )}

                  {/* Local Transportation Cost */}
                  {selectedLocalTransport && (
                    <div className="flex justify-between">
                      <p>Local Transport ({days} days)</p>
                      <p>{formatCurrency(selectedLocalTransport.pricePerDay * days)}</p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between font-medium">
                      <p>Subtotal</p>
                      <p>{formatCurrency(totalPrice)}</p>
                    </div>

                    {/* Discount Section */}
                    <div className="mt-4">
                      <h3 className="font-medium flex items-center mb-2">
                        <Tag className="h-4 w-4 mr-1" />
                        Discount Code
                      </h3>

                      {appliedDiscount ? (
                        <div className="bg-accent/10 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium flex items-center">
                              <Check className="h-4 w-4 mr-1 text-green-500" />
                              {appliedDiscount.code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appliedDiscount.discountType === "percentage"
                                ? `${appliedDiscount.value}% off`
                                : `${formatCurrency(appliedDiscount.value)} off`}
                            </p>
                          </div>
                          <button onClick={handleRemoveDiscount} className="text-sm text-red-500 hover:text-red-600">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={discountCode}
                              onChange={(e) => setDiscountCode(e.target.value)}
                              placeholder="Enter discount code"
                              className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                              onClick={handleApplyDiscount}
                              disabled={isApplyingDiscount}
                              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
                            >
                              Apply
                            </button>
                          </div>
                          {discountError && (
                            <p className="text-sm text-red-500 flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {discountError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between text-green-500 mt-2">
                        <p>Discount</p>
                        <p>
                          -
                          {appliedDiscount.discountType === "percentage"
                            ? formatCurrency((totalPrice * appliedDiscount.value) / 100)
                            : formatCurrency(appliedDiscount.value)}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-lg mt-4">
                      <p>Total</p>
                      <p>{formatCurrency(finalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={isProcessingPayment}
                className="w-full apple-button flex items-center justify-center py-3"
              >
                {isProcessingPayment ? (
                  "Processing..."
                ) : (
                  <>
                    Proceed to Payment <CreditCard className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={proceedToPayment}
        title="Confirm Your Booking"
        message={`You're about to complete your booking for ${tripDetails.destination?.name}. The total amount is ${formatCurrency(
          finalPrice,
        )}. Would you like to proceed with payment?`}
        confirmText="Yes, Complete Booking"
        cancelText="No, Review Again"
      />
    </div>
  )
}
