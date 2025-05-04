"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Plane, Train, AlertCircle } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import { generateAccommodationOptions, generateAttractionOptions } from "@/lib/data-generator"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { createFlightAction } from "@/app/actions"
import { supabase } from '@/lib/supabase';
import { updatePassengerAction } from "@/app/actions"


export default function TransportationPage() {
  const router = useRouter()
  const { tripDetails, selectTransportation, totalPrice, setTripDetails, currentStep, setCurrentStep } = useTravel()

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSavingFlights, setIsSavingFlights] = useState(false)
  const [flightError, setFlightError] = useState<string | null>(null)

  useEffect(() => {
    if (!tripDetails.destination) {
      router.push("/booking/trip-details")
      return
    }

    setCurrentStep(2)
  }, [tripDetails, router, setCurrentStep])

  const handleContinue = async () => {
    // Only proceed if both outbound and return flights are selected
    if (!selectedOutbound || !selectedReturn) {
      return
    }

    setIsSavingFlights(true)
    setFlightError(null)

    try {
      // Save outbound flight to database using server action
      const outboundFlightData = {
        name: selectedOutbound.company,
        price: selectedOutbound.price,
        from: selectedOutbound.from,
        to: selectedOutbound.to,
        date: selectedOutbound.date,
      }

      const outboundFlight = await createFlightAction(outboundFlightData)
      console.log("Saved outbound flight to database:", outboundFlight)

      // Save return flight to database using server action
      const returnFlightData = {
        name: selectedReturn.company,
        price: selectedReturn.price,
        from: selectedReturn.from,
        to: selectedReturn.to,
        date: selectedReturn.date,
      }

      const returnFlight = await createFlightAction(returnFlightData)
      console.log("Saved return flight to database:", returnFlight)

      // Store flight IDs in context for later use
      setTripDetails((prev) => ({
        ...prev,
        outboundFlightId: outboundFlight.flightid,
        returnFlightId: returnFlight.flightid,
      }))

      // Update passenger records with flight IDs
      if (tripDetails.travelId) {
        try {
          // Get all passengers for this travel
          const { data: passengers, error: passengersError } = await supabase
            .from("passengers")
            .select("*")
            .eq("travelid", tripDetails.travelId)

          if (passengersError) {
            console.error("Error fetching passengers:", passengersError)
          } else if (passengers && passengers.length > 0) {
            // Update each passenger with the flight IDs
            for (const passenger of passengers) {
              await updatePassengerAction(passenger.passengerid, {
                flightid: outboundFlight.flightid,
              })
            }
            console.log("Updated all passengers with flight ID")
          }
        } catch (error) {
          console.error("Error updating passengers with flight ID:", error)
          // Don't throw here, just log the error and continue
        }
      }

      // Show confirmation dialog after flights are saved
      setShowConfirmation(true)
    } catch (error: any) {
      console.error("Error saving flights:", error)
      setFlightError(error.message || "Failed to save flight details. Please try again.")
    } finally {
      setIsSavingFlights(false)
    }
  }

  const proceedToNextStep = () => {
    // Generate accommodation options and proceed to next step
    const accommodationOptions = generateAccommodationOptions(tripDetails.destination?.name || "")
    setTripDetails((prev) => ({
      ...prev,
      accommodations: accommodationOptions,
    }))
    setCurrentStep(3)
    router.push("/booking/accommodation")
  }

  const skipToAttractions = () => {
    // Generate accommodation options (but don't show the page)
    const accommodationOptions = generateAccommodationOptions(tripDetails.destination?.name || "")

    // Generate attraction options for the next step
    const attractionOptions = generateAttractionOptions(tripDetails.destination?.name || "")

    // Update context with both options
    setTripDetails((prev) => ({
      ...prev,
      accommodations: accommodationOptions.map((acc, index) => ({
        ...acc,
        selected: index === 0,
      })),
      attractions: attractionOptions,
    }))

    // Skip to step 4 (attractions) and add a query parameter to show confirmation dialog immediately
    setCurrentStep(4)
    router.push("/booking/attractions?showConfirmation=true")
  }

  const outboundOptions = tripDetails.transportations.filter((t) => t.type === "outbound")
  const returnOptions = tripDetails.transportations.filter((t) => t.type === "return")

  const selectedOutbound = outboundOptions.find((t) => t.selected)
  const selectedReturn = returnOptions.find((t) => t.selected)

  const canContinue = selectedOutbound && selectedReturn

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
                <div key={step} className={`progress-step ${step === 2 ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/booking/trip-details" className="flex items-center text-accent hover:text-accent/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trip Details
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Choose Your Transportation</h1>
          <p className="text-muted-foreground mb-8">
            Select how you want to travel from {tripDetails.origin?.name} to {tripDetails.destination?.name}.
          </p>

          {flightError && (
            <div className="bg-destructive/20 text-destructive p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{flightError}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-6">Outbound Journey</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outboundOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ y: -5 }}
                    className={`rounded-2xl overflow-hidden border ${
                      option.selected ? "border-accent ring-2 ring-accent/20" : "border-border"
                    } cursor-pointer transition-all`}
                    onClick={() => selectTransportation(option.id, "outbound")}
                  >
                    <div className="relative h-40">
                      <Image
                        src={option.image || "/placeholder.svg"}
                        alt={option.company}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center">
                          {option.company.toLowerCase().includes("train") ? (
                            <Train className="h-4 w-4 mr-2" />
                          ) : (
                            <Plane className="h-4 w-4 mr-2" />
                          )}
                          <span className="font-medium">{option.company}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="text-lg font-bold">{option.departureTime}</div>
                          <div className="text-sm text-muted-foreground">{option.from}</div>
                        </div>

                        <div className="flex-1 mx-4 border-t border-dashed border-muted relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-muted/30 rounded-full p-1">
                            {option.company.toLowerCase().includes("train") ? (
                              <Train className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Plane className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-lg font-bold">{option.arrivalTime}</div>
                          <div className="text-sm text-muted-foreground">{option.to}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">{option.date}</div>
                        <div className="text-lg font-bold">₹{option.price.toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-6">Return Journey</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {returnOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ y: -5 }}
                    className={`rounded-2xl overflow-hidden border ${
                      option.selected ? "border-accent ring-2 ring-accent/20" : "border-border"
                    } cursor-pointer transition-all`}
                    onClick={() => selectTransportation(option.id, "return")}
                  >
                    <div className="relative h-40">
                      <Image
                        src={option.image || "/placeholder.svg"}
                        alt={option.company}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center">
                          {option.company.toLowerCase().includes("train") ? (
                            <Train className="h-4 w-4 mr-2" />
                          ) : (
                            <Plane className="h-4 w-4 mr-2" />
                          )}
                          <span className="font-medium">{option.company}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="text-lg font-bold">{option.departureTime}</div>
                          <div className="text-sm text-muted-foreground">{option.from}</div>
                        </div>

                        <div className="flex-1 mx-4 border-t border-dashed border-muted relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-muted/30 rounded-full p-1">
                            {option.company.toLowerCase().includes("train") ? (
                              <Train className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Plane className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-lg font-bold">{option.arrivalTime}</div>
                          <div className="text-sm text-muted-foreground">{option.to}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">{option.date}</div>
                        <div className="text-lg font-bold">₹{option.price.toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div>
              {(selectedOutbound || selectedReturn) && (
                <div className="text-lg">
                  <span className="font-medium">Subtotal:</span> ₹
                  {((selectedOutbound?.price || 0) + (selectedReturn?.price || 0)) * tripDetails.travelers} for{" "}
                  {tripDetails.travelers} travelers
                </div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!canContinue || isSavingFlights}
              className={`apple-button flex items-center ${
                !canContinue || isSavingFlights ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSavingFlights ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue to Accommodation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={skipToAttractions}
        onConfirm={proceedToNextStep}
        title="Ready to Choose Accommodation?"
        message={`You've selected your transportation options. Would you like to proceed to choosing accommodation in ${tripDetails.destination?.name}?`}
        confirmText="Yes, Choose Accommodation"
        cancelText="Skip to the next step"
      />
    </div>
  )
}
