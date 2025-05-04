"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronRight, LogOut, ArrowRight } from "lucide-react"
import { useTravel } from "@/components/travel-context"
import { useRouter } from "next/navigation"
import AnimatedBackground from "@/components/animated-background"

export default function HomePage() {
  const [hoveredDestination, setHoveredDestination] = useState<number | null>(null)
  const { user, setUser } = useTravel()
  const router = useRouter()

  const destinations = [
    {
      name: "Paris",
      image:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      description: "Experience the city of love",
    },
    {
      name: "Tokyo",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      description: "Where tradition meets the future",
    },
    {
      name: "New York",
      image:
        "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      description: "The city that never sleeps",
    },
    {
      name: "Santorini",
      image:
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3",
      description: "Breathtaking island paradise",
    },
  ]

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Animated Background */}
      <AnimatedBackground />

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? "/home" : "/"} className="text-2xl font-heading font-semibold text-primary">
            TravelEase
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/home" className="text-sm font-medium text-foreground hover:text-primary">
              Home
            </Link>
            <Link href="#destinations" className="text-sm font-medium text-foreground hover:text-primary">
              Destinations
            </Link>
            {user && (
              <Link href="/my-trips" className="text-sm font-medium text-foreground hover:text-primary">
                My Trips
              </Link>
            )}
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-foreground hover:text-primary">
              Contact
            </Link>
          </nav>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-foreground">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-foreground hover:text-primary"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary">
                  Log in
                </Link>
                <Link href="/booking/trip-details" className="apple-button text-sm">
                  Plan Your Trip
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Animated Elements */}
        <section className="relative h-[90vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/30" />

            {/* Abstract geometric elements with animation */}
            <motion.div
              className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full border border-primary/20 opacity-30"
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full border border-primary/30 opacity-20"
              animate={{
                rotate: -360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 25,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-primary/5"
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="container mx-auto px-4 z-10 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <motion.div
                className="h-1 w-24 bg-primary mb-8"
                animate={{ width: ["0%", "100%", "24px"] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6">
                Travel with{" "}
                <motion.span
                  className="text-primary"
                  animate={{
                    color: ["#ffcc00", "#ffd700", "#ffcc00"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  elegance
                </motion.span>{" "}
                and simplicity
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Plan your journey with our intuitive booking platform. From flights to accommodations, we've crafted an
                experience as seamless as it is beautiful.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/booking/trip-details"
                    className="apple-button text-base inline-flex items-center justify-center"
                  >
                    Start Your Journey
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#destinations"
                    className="border border-white/20 text-white hover:border-primary/50 hover:text-primary rounded-full px-6 py-3 text-base inline-flex items-center justify-center transition-colors"
                  >
                    Explore Destinations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* New Aesthetic Black Image Section */}
        <section className="py-24 bg-black/90 backdrop-blur-sm relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-primary/30"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3"
                    alt="Aesthetic black background"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <motion.div
                      className="h-1 w-16 bg-primary mb-6"
                      initial={{ width: 0 }}
                      whileInView={{ width: "4rem" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                    <h3 className="text-2xl font-bold text-white mb-2">Luxury Travel Experience</h3>
                    <p className="text-white/80">Discover the world with unparalleled comfort and style</p>
                  </div>
                </motion.div>
              </div>
              <div className="md:w-1/2">
                <motion.h2
                  className="text-4xl font-heading font-bold mb-6 text-primary"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  Elevate Your <span className="text-white">Travel</span>
                </motion.h2>
                <motion.p
                  className="text-muted-foreground mb-8"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  We believe that travel should be more than just moving from one place to another. It should be an
                  experience that enriches your life, broadens your horizons, and creates memories that last a lifetime.
                </motion.p>
                <div className="space-y-6">
                  {[
                    {
                      number: "01",
                      title: "Personalized Itineraries",
                      description: "Tailored travel plans designed around your preferences and interests.",
                    },
                    {
                      number: "02",
                      title: "Premium Accommodations",
                      description: "Carefully selected lodgings that offer comfort, style, and exceptional service.",
                    },
                    {
                      number: "03",
                      title: "Seamless Experience",
                      description:
                        "From planning to return, enjoy a journey free of complications and full of delight.",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.number}
                      className="flex items-start"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 204, 0, 0.3)" }}
                      >
                        <span className="text-primary font-bold">{item.number}</span>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href="/booking/trip-details"
                    className="group inline-flex items-center text-primary hover:text-primary/80"
                  >
                    Discover our premium services
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section id="destinations" className="py-24 bg-black/90 backdrop-blur-sm relative">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-4xl font-heading font-bold text-center mb-4 text-primary"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Curated Destinations
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Discover handpicked destinations that offer unforgettable experiences, each with its own unique charm and
              character.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {destinations.map((destination, index) => (
                <Link key={destination.name} href={`/booking/trip-details?destination=${destination.name}`}>
                  <motion.div
                    className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer"
                    onMouseEnter={() => setHoveredDestination(index)}
                    onMouseLeave={() => setHoveredDestination(null)}
                    whileHover={{ y: -10 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      delay: 0.1 * index,
                      duration: 0.5,
                    }}
                    viewport={{ once: true }}
                  >
                    <Image
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-heading font-bold mb-2">{destination.name}</h3>
                      <p className="text-white/80">{destination.description}</p>
                      <motion.div
                        className="h-1 w-12 bg-primary mt-4 group-hover:w-24 transition-all duration-300"
                        animate={hoveredDestination === index ? { width: "6rem" } : { width: "3rem" }}
                      />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-black/90 backdrop-blur-sm relative">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <motion.h2
                  className="text-4xl font-heading font-bold mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  A <span className="text-primary">new way</span> to plan travel
                </motion.h2>
                <motion.p
                  className="text-muted-foreground mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  We've reimagined the travel planning experience with a focus on simplicity and elegance. Our intuitive
                  interface guides you through each step of the process, from selecting your destination to booking your
                  accommodations and activities.
                </motion.p>
                <div className="space-y-4">
                  {[
                    "Interactive map selection for precise location planning",
                    "Curated transportation options for seamless travel",
                    "Handpicked accommodations that match your preferences",
                    "Unique attractions to make your journey memorable",
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * (index + 2) }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5"
                        whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 204, 0, 0.3)" }}
                      >
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </motion.div>
                      <p className="text-foreground">{feature}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2">
                <motion.div
                  className="relative rounded-2xl overflow-hidden aspect-video border border-border"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3"
                    alt="Travel planning"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black/90 backdrop-blur-sm py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-heading font-semibold mb-4 text-primary">TravelEase</h3>
              <p className="text-muted-foreground max-w-xs">
                Redefining the way you plan and experience travel with elegance and simplicity.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-4 text-foreground">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Press
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4 text-foreground">Support</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4 text-foreground">Follow Us</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Instagram
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-muted-foreground hover:text-primary">
                      Facebook
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} TravelEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
