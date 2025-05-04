"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Calendar } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import ConfirmationDialog from "@/components/confirmation-dialog"

export default function AttractionsPage() {
  const router = useRouter()
  const { tripDetails, selectAttraction, setTripDetails, currentStep, setCurrentStep } = useTravel()
  const [itinerary, setItinerary] = useState<any[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Make sure attractions exists and is an array
  const attractions = tripDetails.attractions || []

  useEffect(() => {
    if (!tripDetails.destination) {
      router.push("/booking/trip-details")
      return
    }

    setCurrentStep(4)

    // Check if we should show the confirmation dialog immediately
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get("showConfirmation") === "true") {
      setShowConfirmation(true)

      // Clean up the URL to remove the query parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [tripDetails, router, setCurrentStep])

  useEffect(() => {
    if (attractions.some((a) => a.selected)) {
      generateItinerary()
    }
  }, [attractions])

  const generateItinerary = () => {
    const selectedAttractions = attractions.filter((a) => a.selected)
    const startDate = new Date(tripDetails.startDate)
    const endDate = new Date(tripDetails.endDate)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))

    const newItinerary = []

    // Add outbound flight
    const outboundFlight = tripDetails.transportations.find((t) => t.type === "outbound" && t.selected)
    if (outboundFlight) {
      newItinerary.push({
        type: "transport",
        name: "Outbound Journey",
        date: startDate.toISOString().split("T")[0],
        time: outboundFlight.departureTime,
        details: `${outboundFlight.company} from ${tripDetails.origin?.name} to ${tripDetails.destination?.name}`,
      })
    }

    // Distribute attractions across days
    const attractionsPerDay = Math.ceil(selectedAttractions.length / (days - 1)) // Excluding travel days
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + 1) // Start from the day after arrival

    for (let i = 0; i < selectedAttractions.length; i++) {
      if (i > 0 && i % attractionsPerDay === 0) {
        currentDate.setDate(currentDate.getDate() + 1)
      }
      newItinerary.push({
        type: "attraction",
        name: selectedAttractions[i].name,
        date: currentDate.toISOString().split("T")[0],
        time: `${9 + (i % attractionsPerDay) * 2}:00`, // Simple time distribution
        details: selectedAttractions[i].description,
      })
    }

    // Add return flight
    const returnFlight = tripDetails.transportations.find((t) => t.type === "return" && t.selected)
    if (returnFlight) {
      newItinerary.push({
        type: "transport",
        name: "Return Journey",
        date: endDate.toISOString().split("T")[0],
        time: returnFlight.departureTime,
        details: `${returnFlight.company} from ${tripDetails.destination?.name} to ${tripDetails.origin?.name}`,
      })
    }

    setItinerary(newItinerary)
  }

  const handleContinue = () => {
    // Show confirmation dialog instead of navigating directly
    setShowConfirmation(true)
  }

  const proceedToNextStep = () => {
    setTripDetails((prev) => ({
      ...prev,
      itinerary: itinerary,
    }))
    setCurrentStep(5)
    router.push("/booking/local-transport?showConfirmation=true")
  }

  const selectedAttractions = attractions.filter((a) => a.selected)
  const attractionsTotal = selectedAttractions.reduce(
    (total, attraction) => total + attraction.price * tripDetails.travelers,
    0,
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
                <div key={step} className={`progress-step ${step === 4 ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/booking/accommodation" className="flex items-center text-accent hover:text-accent/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Accommodation
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2">Choose Your Attractions</h1>
          <p className="text-muted-foreground mb-8">
            Select places to visit in {tripDetails.destination?.name}. You can choose multiple attractions.
          </p>

          {attractions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {attractions.map((attraction) => (
                <motion.div
                  key={attraction.id}
                  whileHover={{ y: -5 }}
                  className={`bg-card rounded-2xl overflow-hidden border ${
                    attraction.selected ? "border-accent ring-2 ring-accent/20" : "border-border"
                  } cursor-pointer transition-all shadow-sm`}
                  onClick={() => selectAttraction(attraction.id)}
                >
                  <div className="relative h-48">
                    <Image
                      src={attraction.image || "/placeholder.svg"}
                      alt={attraction.name}
                      fill
                      className="object-cover"
                    />
                    {attraction.selected && (
                      <div className="absolute top-4 right-4 bg-accent text-white p-1 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold">{attraction.name}</h3>
                    <p className="text-muted-foreground text-sm">{attraction.location}</p>

                    <p className="mt-2 text-sm line-clamp-2">{attraction.description}</p>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xl font-bold">₹{attraction.price.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">per person</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
              <h3 className="text-xl font-medium mb-2">No attractions available</h3>
              <p className="text-muted-foreground mb-4">
                Please go back to accommodation and complete that step first.
              </p>
              <Link href="/booking/accommodation" className="apple-button inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Accommodation
              </Link>
            </div>
          )}

          {itinerary.length > 0 && (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-accent" />
                Your Itinerary
              </h2>

              <div className="space-y-4">
                {itinerary.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border border-border ${
                      item.type === "transport" ? "bg-accent/5" : "bg-card"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                          item.type === "transport" ? "bg-accent/20 text-accent" : "bg-secondary text-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.date} at {item.time}
                        </p>
                        <p className="text-sm mt-1">{item.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <div>
              {selectedAttractions.length > 0 && (
                <div className="text-lg">
                  <span className="font-medium">Attractions:</span> ₹{attractionsTotal.toLocaleString()} for{" "}
                  {selectedAttractions.length} attractions
                </div>
              )}
            </div>

            <button onClick={handleContinue} className="apple-button flex items-center">
              Continue to Local Transport
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={proceedToNextStep}
        title="Ready to Choose Local Transportation?"
        message={`You've selected your attractions. Would you like to proceed to choosing local transportation options in ${tripDetails.destination?.name}?`}
        confirmText="Yes, Choose Transportation"
        cancelText="No, Stay Here"
      />
    </div>
  )
}
