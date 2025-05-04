"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Star, Wifi, PocketIcon as Pool, Utensils, Dumbbell, AlertCircle } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import { generateAttractionOptions } from "@/lib/data-generator"
import ConfirmationDialog from "@/components/confirmation-dialog"
import { createResortAction, updatePassengerAction } from "@/app/actions"

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  pool: <Pool className="h-4 w-4" />,
  restaurant: <Utensils className="h-4 w-4" />,
  gym: <Dumbbell className="h-4 w-4" />,
}

export default function AccommodationPage() {
  const router = useRouter()
  const { tripDetails, selectAccommodation, setTripDetails, currentStep, setCurrentStep } = useTravel()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSavingResort, setIsSavingResort] = useState(false)
  const [resortError, setResortError] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    pool: false,
    wifi: false,
    restaurant: false,
    gym: false,
  })

  useEffect(() => {
    if (!tripDetails.destination) {
      router.push("/booking/trip-details")
      return
    }

    setCurrentStep(3)
  }, [tripDetails, router, setCurrentStep])

  const handleFilterChange = (filter: string) => {
    setFilters({
      ...filters,
      [filter]: !filters[filter as keyof typeof filters],
    })
  }

  // Make sure accommodations exists and is an array before filtering
  const accommodations = tripDetails.accommodations || []

  const filteredAccommodations = accommodations.filter((accommodation) => {
    // If no filters are selected, show all accommodations
    if (!filters.pool && !filters.wifi && !filters.restaurant && !filters.gym) {
      return true
    }

    // Otherwise, filter based on selected amenities
    return (
      (!filters.pool || accommodation.amenities.includes("pool")) &&
      (!filters.wifi || accommodation.amenities.includes("wifi")) &&
      (!filters.restaurant || accommodation.amenities.includes("restaurant")) &&
      (!filters.gym || accommodation.amenities.includes("gym"))
    )
  })

  const handleContinue = async () => {
    // Only proceed if accommodation is selected
    if (!selectedAccommodation) {
      return
    }

    setIsSavingResort(true)
    setResortError(null)

    try {
      // Save selected accommodation to the database using server action
      const resortData = {
        name: selectedAccommodation.name,
        price: selectedAccommodation.price,
        address: selectedAccommodation.location,
      }

      const resort = await createResortAction(resortData)
      console.log("Saved accommodation to database:", resort)

      // Store resort ID in context for later use
      setTripDetails((prev) => ({
        ...prev,
        resortId: resort.resortid,
      }))

      // Update passenger records with resort ID
      if (tripDetails.travelId) {
        try {
          // Use server action to get passengers
          const response = await fetch(`/api/passengers?travelId=${tripDetails.travelId}`)
          if (!response.ok) {
            throw new Error("Failed to fetch passengers")
          }
          const passengers = await response.json()

          if (passengers && passengers.length > 0) {
            // Update each passenger with the resort ID
            for (const passenger of passengers) {
              await updatePassengerAction(passenger.passengerid, {
                resortid: resort.resortid,
              })
            }
            console.log("Updated all passengers with resort ID")
          }
        } catch (error) {
          console.error("Error updating passengers with resort ID:", error)
          // Don't throw here, just log the error and continue
        }
      }

      // Show confirmation dialog after resort is saved
      setShowConfirmation(true)
    } catch (error: any) {
      console.error("Error saving resort:", error)
      setResortError(error.message || "Failed to save accommodation details. Please try again.")
    } finally {
      setIsSavingResort(false)
    }
  }

  const proceedToNextStep = () => {
    // Generate attraction options based on destination
    const attractionOptions = generateAttractionOptions(tripDetails.destination?.name || "")

    // Update context with attraction options
    setTripDetails((prev) => ({
      ...prev,
      attractions: attractionOptions,
    }))

    // Navigate to next step with query parameter to show confirmation dialog
    setCurrentStep(4)
    router.push("/booking/attractions?showConfirmation=true")
  }

  const selectedAccommodation = accommodations.find((a) => a.selected)

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
                <div key={step} className={`progress-step ${step === 3 ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/booking/transportation" className="flex items-center text-accent hover:text-accent/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transportation
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Choose Your Accommodation</h1>
          <p className="text-muted-foreground mb-8">
            Select where you want to stay in {tripDetails.destination?.name}.
          </p>

          {resortError && (
            <div className="bg-destructive/20 text-destructive p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{resortError}</p>
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-8">
            <h2 className="text-xl font-semibold mb-4">Filter by Amenities</h2>

            <div className="flex flex-wrap gap-4">
              {Object.entries(amenityIcons).map(([key, icon]) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                    filters[key as keyof typeof filters]
                      ? "bg-accent text-white border-accent"
                      : "bg-card border-border hover:border-accent/50"
                  } transition-colors`}
                >
                  {icon}
                  <span className="capitalize">{key}</span>
                </button>
              ))}
            </div>
          </div>

          {filteredAccommodations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAccommodations.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ y: -5 }}
                  className={`bg-card rounded-2xl overflow-hidden border ${
                    option.selected ? "border-accent ring-2 ring-accent/20" : "border-border"
                  } cursor-pointer transition-all shadow-sm`}
                  onClick={() => selectAccommodation(option.id)}
                >
                  <div className="relative h-60">
                    <Image src={option.image || "/placeholder.svg"} alt={option.name} fill className="object-cover" />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{option.name}</h3>
                        <p className="text-muted-foreground">{option.location}</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < option.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 my-4">
                      {option.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center space-x-1 text-xs bg-secondary px-3 py-1 rounded-full"
                        >
                          {amenityIcons[amenity]}
                          <span className="capitalize">{amenity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-2xl font-bold">₹{option.price.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">per night</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
              <h3 className="text-xl font-medium mb-2">No accommodations available</h3>
              <p className="text-muted-foreground mb-4">
                Please go back to transportation and complete that step first.
              </p>
              <Link href="/booking/transportation" className="apple-button inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Transportation
              </Link>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <div>
              {selectedAccommodation && (
                <div className="text-lg">
                  <span className="font-medium">Accommodation:</span> ₹{selectedAccommodation.price.toLocaleString()} ×{" "}
                  {Math.ceil(
                    (new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) /
                      (1000 * 60 * 60 * 24) +
                      1,
                  )}{" "}
                  nights
                </div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!selectedAccommodation || isSavingResort}
              className={`apple-button flex items-center ${
                !selectedAccommodation || isSavingResort ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSavingResort ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue to Attractions
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
        onClose={() => proceedToNextStep()} // Skip directly to next step when closing
        onConfirm={proceedToNextStep}
        title="Ready to Explore Attractions?"
        message={`You've selected your accommodation. Would you like to proceed to choosing attractions in ${tripDetails.destination?.name}?`}
        confirmText="Yes, Explore Attractions"
      />
    </div>
  )
}
