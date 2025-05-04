"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Car, Bike, Bus, MapPin, AlertCircle } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import { generateLocalTransportationOptions } from "@/lib/data-generator"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { createVehicleAction } from "@/app/actions"
import { updatePassengerAction } from "@/app/actions" // Assuming this action exists
import { supabase } from '@/lib/supabase';

export default function LocalTransportPage() {
  const router = useRouter()
  const { tripDetails, selectLocalTransportation, setTripDetails, currentStep, setCurrentStep } = useTravel()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSavingVehicle, setIsSavingVehicle] = useState(false)
  const [vehicleError, setVehicleError] = useState<string | null>(null)

  useEffect(() => {
    if (!tripDetails.destination) {
      router.push("/booking/trip-details")
      return
    }

    // Set current step to 5 (assuming this is the 5th step now)
    setCurrentStep(5)

    // Generate local transportation options if not already done
    if (tripDetails.localTransportation.length === 0) {
      const transportOptions = generateLocalTransportationOptions()
      setTripDetails((prev) => ({
        ...prev,
        localTransportation: transportOptions,
      }))
    }

    // Check if we should show the confirmation dialog immediately
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("showConfirmation") === "true") {
      setShowConfirmation(true)

      // Clean up the URL to remove the query parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [tripDetails, router, setCurrentStep, setTripDetails])

  const handleContinue = async () => {
    // Only proceed if local transportation is selected
    if (!selectedTransport) {
      return
    }

    setIsSavingVehicle(true)
    setVehicleError(null)

    try {
      // Save selected local transportation to the database using server action
      const vehicleData = {
        name: selectedTransport.name,
        vehicletype: selectedTransport.type,
      }

      const vehicle = await createVehicleAction(vehicleData)
      console.log("Saved local transportation to database:", vehicle)

      // Store vehicle ID in context for later use
      setTripDetails((prev) => ({
        ...prev,
        localVehicleId: vehicle.vehicleid,
      }))

      // Update passenger records with vehicle ID
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
            // Update each passenger with the vehicle ID
            for (const passenger of passengers) {
              await updatePassengerAction(passenger.passengerid, {
                vehicleid: vehicle.vehicleid,
              })
            }
            console.log("Updated all passengers with vehicle ID")
          }
        } catch (error) {
          console.error("Error updating passengers with vehicle ID:", error)
          // Don't throw here, just log the error and continue
        }
      }

      // Show confirmation dialog after vehicle is saved
      setShowConfirmation(true)
    } catch (error: any) {
      console.error("Error saving vehicle:", error)
      setVehicleError(error.message || "Failed to save local transportation details. Please try again.")
    } finally {
      setIsSavingVehicle(false)
    }
  }

  // Update the proceedToNextStep function to navigate to the billing page
  const proceedToNextStep = () => {
    setTripDetails((prev) => ({
      ...prev,
      localTransportation: prev.localTransportation.map((item) => ({
        ...item,
        selected: item.id === selectedTransport?.id,
      })),
    }))
    setCurrentStep(6)
    router.push("/booking/billing?showConfirmation=true")
  }

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "cab":
      case "luxury":
      case "self-drive":
        return <Car className="h-5 w-5" />
      case "bike":
        return <Bike className="h-5 w-5" />
      case "van":
        return <Bus className="h-5 w-5" />
      default:
        return <Car className="h-5 w-5" />
    }
  }

  const selectedTransport = tripDetails.localTransportation.find((t) => t.selected)
  const days = Math.ceil(
    (new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1,
  )

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
                <div key={step} className={`progress-step ${step === 5 ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/booking/attractions" className="flex items-center text-accent hover:text-accent/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Attractions
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Choose Your Local Transportation</h1>
          <p className="text-muted-foreground mb-8">
            Select how you want to get around in {tripDetails.destination?.name} during your stay.
          </p>

          {vehicleError && (
            <div className="bg-destructive/20 text-destructive p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{vehicleError}</p>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-8">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-accent mr-2" />
              <h2 className="text-xl font-semibold">Local Transportation Options</h2>
            </div>

            <p className="text-muted-foreground mb-6">
              Choose the most convenient way to explore {tripDetails.destination?.name} for your {days}-day trip.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripDetails.localTransportation.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ y: -5 }}
                  className={`bg-card rounded-2xl overflow-hidden border ${
                    option.selected ? "border-accent ring-2 ring-accent/20" : "border-border"
                  } cursor-pointer transition-all shadow-sm`}
                  onClick={() => selectLocalTransportation(option.id)}
                >
                  <div className="relative h-48">
                    <Image src={option.image || "/placeholder.svg"} alt={option.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center text-white">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center mr-3">
                          {getTransportIcon(option.type)}
                        </div>
                        <h3 className="text-lg font-bold">{option.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold">₹{option.pricePerDay.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">per day</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div>
              {selectedTransport && (
                <div className="text-lg">
                  <span className="font-medium">Transportation:</span> ₹{selectedTransport.pricePerDay.toLocaleString()}{" "}
                  × {days} days = ₹{(selectedTransport.pricePerDay * days).toLocaleString()}
                </div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedTransport || isSavingVehicle}
              className={`apple-button flex items-center ${
                !selectedTransport || isSavingVehicle ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSavingVehicle ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue to Summary
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
        onClose={() => setShowConfirmation(false)}
        onConfirm={proceedToNextStep}
        title="Ready to Review Your Trip?"
        message={`You've selected your local transportation. Would you like to proceed to the summary page to review your complete trip to ${tripDetails.destination?.name}?`}
        confirmText="Yes, Review Trip"
        cancelText="No, Stay Here"
      />
    </div>
  )
}
