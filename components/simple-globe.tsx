"use client"

import { useEffect, useRef, useState } from "react"
import { majorCountries } from "@/lib/countries-data"
import SearchCountry from "./search-country"
import TravelHistory from "./travel-history"

type GlobeMapProps = {
  onSelectOrigin: (location: any) => void
  onSelectDestination: (location: any) => void
  origin: any
  destination: any
}

export default function SimpleGlobe({ onSelectOrigin, onSelectDestination, origin, destination }: GlobeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mapMode, setMapMode] = useState<"origin" | "destination">(origin ? "destination" : "origin")
  const [isLoading, setIsLoading] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Use refs to store country positions and state
  const countryPositionsRef = useRef<{ [key: string]: { x: number; y: number; radius: number } }>({})
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d", { alpha: true, antialias: true })
    if (!ctx) return

    // Add these variables for drag functionality
    let isDragging = false
    let dragStartX = 0
    let dragStartY = 0
    let dragStartRotation = rotation

    if (!ctx.roundRect) {
      // Polyfill for roundRect if not supported
      ctx.roundRect = function (x: number, y: number, width: number, height: number, radius: number) {
        if (width < 2 * radius) radius = width / 2
        if (height < 2 * radius) radius = height / 2
        this.beginPath()
        this.moveTo(x + radius, y)
        this.arcTo(x + width, y, x + width, y + height, radius)
        this.arcTo(x + width, y + height, x, y + height, radius)
        this.arcTo(x, y + height, x, y, radius)
        this.arcTo(x, y, x + width, y, radius)
        this.closePath()
        return this
      }
    }

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Set canvas dimensions with higher resolution for better clarity
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      // Use device pixel ratio for higher resolution
      const dpr = window.devicePixelRatio || 1

      // Set display size (css pixels)
      canvas.style.width = `${parent.clientWidth}px`
      canvas.style.height = `${parent.clientHeight}px`

      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = parent.clientWidth * dpr
      canvas.height = parent.clientHeight * dpr

      // Scale all drawing operations by the dpr
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Calculate country positions on the 2D map based on their position property
    const calculateCountryPositions = () => {
      const displayWidth = canvas.width / window.devicePixelRatio
      const displayHeight = canvas.height / window.devicePixelRatio

      majorCountries.forEach((country) => {
        // Use the position property directly to place markers exactly where they should be
        const x = country.position.x * displayWidth
        const y = country.position.y * displayHeight

        countryPositionsRef.current[country.code] = {
          x,
          y,
          radius: 6, // Larger radius for better visibility
        }
      })
    }

    calculateCountryPositions()

    // Draw the globe-like background with grid
    const drawGlobeBackground = () => {
      if (!ctx) return

      const displayWidth = canvas.width / window.devicePixelRatio
      const displayHeight = canvas.height / window.devicePixelRatio
      const centerX = displayWidth / 2
      const centerY = displayHeight / 2
      const radius = Math.min(displayWidth, displayHeight) * 0.45

      // Clear canvas with dark background
      ctx.fillStyle = "#0a0f1a" // Darker blue-black background
      ctx.fillRect(0, 0, displayWidth, displayHeight)

      // Draw stars in the background
      drawStars(ctx, displayWidth, displayHeight)

      // Draw subtle glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.15)") // Blue glow at center
      gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.08)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)") // Fade to transparent
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, displayWidth, displayHeight)

      // Draw grid lines with rotation effect
      drawRotatedGrid(ctx, displayWidth, displayHeight, rotation)

      // Draw a subtle border around the "globe"
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.rect(0, 0, displayWidth, displayHeight)
      ctx.stroke()
    }

    // Draw stars in the background
    const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Create fewer stars with lower opacity
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 1.2
        const opacity = Math.random() * 0.4 + 0.1 // Lower opacity range

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }
    }

    // Draw grid with rotation effect
    const drawRotatedGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, rotation: number) => {
      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.sqrt(width * width + height * height) / 2

      // Draw latitude circles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 0.5

      for (let r = 30; r <= maxRadius; r += 30) {
        ctx.beginPath()
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw longitude lines with rotation
      const numLines = 24
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2 + rotation
        const x1 = centerX + Math.cos(angle) * maxRadius
        const y1 = centerY + Math.sin(angle) * maxRadius
        const x2 = centerX - Math.cos(angle) * maxRadius
        const y2 = centerY - Math.sin(angle) * maxRadius

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    // Draw enhanced country tooltip with more information
    const drawCountryTooltip = (
      ctx: CanvasRenderingContext2D,
      country: any,
      position: { x: number; y: number; radius: number },
    ) => {
      const displayWidth = canvas.width / window.devicePixelRatio

      // Get country color
      let color = "#ffcc00"
      if (origin && country.name === origin.name) color = "#3b82f6"
      if (destination && country.name === destination.name) color = "#ef4444"

      // Create a more prominent tooltip
      ctx.font = "bold 18px Arial"
      const textWidth = ctx.measureText(country.name).width
      const tooltipWidth = textWidth + 120
      const tooltipHeight = 80
      const tooltipX = Math.min(Math.max(position.x - tooltipWidth / 2, 10), displayWidth - tooltipWidth - 10)
      const tooltipY = position.y - 100

      // Draw tooltip background with rounded corners
      ctx.beginPath()
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 10)
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
      ctx.fill()

      // Add a glowing border
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text with shadow for better readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 4
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"

      // Country name
      ctx.font = "bold 18px Arial"
      ctx.fillText(country.name, tooltipX + 15, tooltipY + 15)

      // Region
      ctx.font = "14px Arial"
      ctx.fillText(`Region: ${country.region}`, tooltipX + 15, tooltipY + 40)

      // Coordinates
      ctx.font = "12px Arial"
      ctx.fillText(
        `Lat: ${country.coordinates.lat.toFixed(2)}, Lng: ${country.coordinates.lng.toFixed(2)}`,
        tooltipX + 15,
        tooltipY + 60,
      )

      ctx.shadowBlur = 0

      // Draw a connecting line from tooltip to country marker
      ctx.beginPath()
      ctx.moveTo(position.x, tooltipY + tooltipHeight)
      ctx.lineTo(position.x, position.y - position.radius - 2)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw the map with countries
    const drawMap = () => {
      if (!ctx) return

      const displayWidth = canvas.width / window.devicePixelRatio
      const displayHeight = canvas.height / window.devicePixelRatio

      // Clear canvas and draw background
      drawGlobeBackground()

      // Draw countries
      Object.entries(countryPositionsRef.current).forEach(([code, position]) => {
        const country = majorCountries.find((c) => c.code === code)
        if (!country) return

        // Skip if filtering by region and country is not in that region
        if (activeRegion && !country.region.includes(activeRegion)) {
          return
        }

        // Determine color based on selection
        let color = "#ffffff" // Default white
        let radius = position.radius
        let glow = false

        if (origin && country.name === origin.name) {
          color = "#3b82f6" // Blue for origin
          radius = 8
          glow = true
        } else if (destination && country.name === destination.name) {
          color = "#ef4444" // Red for destination
          radius = 8
          glow = true
        } else if (hoveredCountry === country.name) {
          color = "#ffcc00" // Yellow for hover
          radius = 7
          glow = true
        }

        // Draw glow effect for selected or hovered countries
        if (glow) {
          ctx.beginPath()
          ctx.arc(position.x, position.y, radius + 4, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(position.x, position.y, radius, position.x, position.y, radius + 4)
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = gradient
          ctx.fill()
        }

        // Draw country marker with pulsing effect for hovered
        ctx.beginPath()
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Add a border to make markers stand out more
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw country name if hovered
        if (hoveredCountry === country.name) {
          drawCountryTooltip(ctx, country, position)
        }
      })

      // Draw connection line between origin and destination
      if (origin && destination) {
        const originCountry = majorCountries.find((c) => c.name === origin.name)
        const destCountry = majorCountries.find((c) => c.name === destination.name)

        if (originCountry && destCountry) {
          const originPos = countryPositionsRef.current[originCountry.code]
          const destPos = countryPositionsRef.current[destCountry.code]

          if (originPos && destPos) {
            // Draw a more visible connection line with animation effect
            ctx.beginPath()
            ctx.moveTo(originPos.x, originPos.y)

            // Create a curved line
            const controlX = (originPos.x + destPos.x) / 2
            const controlY = Math.min(originPos.y, destPos.y) - 50

            ctx.quadraticCurveTo(controlX, controlY, destPos.x, destPos.y)

            // Use a gradient for the line
            const gradient = ctx.createLinearGradient(originPos.x, originPos.y, destPos.x, destPos.y)
            gradient.addColorStop(0, "#3b82f6") // Blue at origin
            gradient.addColorStop(1, "#ef4444") // Red at destination

            ctx.strokeStyle = gradient
            ctx.lineWidth = 3
            ctx.stroke()

            // Add animated particles along the path
            drawAnimatedPathParticles(ctx, originPos, destPos, controlX, controlY)

            // Add arrow at destination
            const angle = Math.atan2(destPos.y - controlY, destPos.x - controlX)
            ctx.beginPath()
            ctx.moveTo(destPos.x, destPos.y)
            ctx.lineTo(destPos.x - 15 * Math.cos(angle - Math.PI / 6), destPos.y - 15 * Math.sin(angle - Math.PI / 6))
            ctx.lineTo(destPos.x - 15 * Math.cos(angle + Math.PI / 6), destPos.y - 15 * Math.sin(angle + Math.PI / 6))
            ctx.closePath()
            ctx.fillStyle = "#ef4444"
            ctx.fill()

            // Add distance indicator
            const distance = Math.sqrt(Math.pow(destPos.x - originPos.x, 2) + Math.pow(destPos.y - originPos.y, 2))
            const midX = (originPos.x + destPos.x) / 2
            const midY = (originPos.y + destPos.y) / 2 - 20

            // Draw a background for the distance text
            const distanceText = `${Math.round(distance / 5)} km`
            const textWidth = ctx.measureText(distanceText).width
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
            ctx.beginPath()
            ctx.roundRect(midX - textWidth / 2 - 10, midY - 10, textWidth + 20, 20, 10)
            ctx.fill()

            ctx.font = "bold 12px Arial"
            ctx.fillStyle = "#ffffff"
            ctx.textAlign = "center"
            ctx.fillText(distanceText, midX, midY)
          }
        }
      }

      // Draw instructions panel with improved styling
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(10, displayHeight - 70, displayWidth - 20, 60)
      ctx.strokeStyle = "#ffcc00"
      ctx.lineWidth = 1
      ctx.strokeRect(10, displayHeight - 70, displayWidth - 20, 60)

      ctx.font = "bold 14px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText(
        mapMode === "origin"
          ? "Click on a country to select your origin"
          : "Now click on a country to select your destination",
        displayWidth / 2,
        displayHeight - 45,
      )

      // Draw legend with improved styling
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(displayWidth / 2 - 100, displayHeight - 20, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "left"
      ctx.font = "12px Arial"
      ctx.fillText("Origin", displayWidth / 2 - 85, displayHeight - 17)

      ctx.fillStyle = "#ef4444"
      ctx.beginPath()
      ctx.arc(displayWidth / 2 + 10, displayHeight - 20, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.fillStyle = "#ffffff"
      ctx.fillText("Destination", displayWidth / 2 + 25, displayHeight - 17)
    }

    // Draw animated particles along the path
    const drawAnimatedPathParticles = (
      ctx: CanvasRenderingContext2D,
      start: { x: number; y: number },
      end: { x: number; y: number },
      controlX: number,
      controlY: number,
    ) => {
      // Fewer particles with less animation
      const numParticles = 3
      const time = Date.now() / 2000 // Slower animation

      for (let i = 0; i < numParticles; i++) {
        // Calculate position along the path (0 to 1)
        const t = (time * 0.3 + i / numParticles) % 1

        // Quadratic bezier curve formula
        const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * controlX + t * t * end.x
        const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlY + t * t * end.y

        // Draw particle
        const radius = 2.5
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)

        // Simpler coloring with less gradient
        const color =
          t < 0.5
            ? "rgba(59, 130, 246, 0.6)" // Blue at start
            : "rgba(239, 68, 68, 0.6)" // Red at end

        ctx.fillStyle = color
        ctx.fill()
      }
    }

    // Handle mouse down for dragging
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click only
        isDragging = true
        dragStartX = e.clientX
        dragStartY = e.clientY
        dragStartRotation = rotation
        canvas.style.cursor = "grabbing"
      }
    }

    // Handle mouse up to end dragging
    const handleMouseUp = () => {
      isDragging = false
      canvas.style.cursor = "default"
    }

    // Handle mouse move for dragging and hovering
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Disable rotation for now
      if (isDragging) {
        canvas.style.cursor = "grabbing"
      } else {
        // Existing hover detection code
        let foundCountry = false
        let closestCountry = null
        let closestDistance = Number.POSITIVE_INFINITY

        Object.entries(countryPositionsRef.current).forEach(([code, position]) => {
          const country = majorCountries.find((c) => c.code === code)
          if (!country) return

          // Skip if filtering by region and country is not in that region
          if (activeRegion && !country.region.includes(activeRegion)) {
            return
          }

          const dx = mouseX - position.x
          const dy = mouseY - position.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Track the closest country even if not directly over it
          if (distance < closestDistance) {
            closestDistance = distance
            closestCountry = country
          }

          // Check if directly over a country marker
          if (distance <= position.radius + 5) {
            // Increased detection radius for better usability
            setHoveredCountry(country.name)
            foundCountry = true
            canvas.style.cursor = "pointer"
          }
        })

        // If not directly over any country but close to one (within 25px), still show it
        if (!foundCountry && closestDistance < 25 && closestCountry) {
          setHoveredCountry(closestCountry.name)
          foundCountry = true
          canvas.style.cursor = "pointer"
        }

        if (!foundCountry) {
          setHoveredCountry(null)
          canvas.style.cursor = "grab"
        }

        lastMousePosRef.current = { x: mouseX, y: mouseY }
      }

      // Redraw map on hover to show tooltips
      drawMap()
    }

    // Handle click
    const handleClick = (e: MouseEvent) => {
      // Check if clicked on a country
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let closestCountry = null
      let closestDistance = Number.POSITIVE_INFINITY

      Object.entries(countryPositionsRef.current).forEach(([code, position]) => {
        const country = majorCountries.find((c) => c.code === code)
        if (!country) return

        // Skip if filtering by region and country is not in that region
        if (activeRegion && !country.region.includes(activeRegion)) {
          return
        }

        const dx = mouseX - position.x
        const dy = mouseY - position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Track the closest country
        if (distance < closestDistance) {
          closestDistance = distance
          closestCountry = country
        }

        if (distance <= position.radius + 10) {
          // Increased click radius for better usability
          const country = majorCountries.find((c) => c.code === code)
          if (country) {
            const location = {
              name: country.name,
              coordinates: country.coordinates,
            }

            if (mapMode === "origin") {
              onSelectOrigin(location)
              setMapMode("destination")
            } else {
              onSelectDestination(location)
              setMapMode("origin")
            }

            // Add a pulse animation effect
            const pulseAnimation = () => {
              let radius = position.radius
              let opacity = 1
              const animate = () => {
                radius += 2
                opacity -= 0.05

                if (opacity > 0) {
                  ctx.beginPath()
                  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
                  ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`
                  ctx.fill()
                  requestAnimationFrame(animate)
                } else {
                  drawMap()
                }
              }
              animate()
            }

            pulseAnimation()
          }
        }
      })

      // If didn't click directly on a country but close to one (within 25px), select it
      if (closestCountry && closestDistance < 25) {
        const position = countryPositionsRef.current[closestCountry.code]
        const location = {
          name: closestCountry.name,
          coordinates: closestCountry.coordinates,
        }

        if (mapMode === "origin") {
          onSelectOrigin(location)
          setMapMode("destination")
        } else {
          onSelectDestination(location)
          setMapMode("origin")
        }

        // Add a pulse animation effect
        const pulseAnimation = () => {
          let radius = position.radius
          let opacity = 1
          const animate = () => {
            radius += 2
            opacity -= 0.05

            if (opacity > 0) {
              ctx.beginPath()
              ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`
              ctx.fill()
              requestAnimationFrame(animate)
            } else {
              drawMap()
            }
          }
          animate()
        }

        pulseAnimation()
      }
    }

    // Animate the globe rotation
    const animate = () => {
      setRotation((prev) => prev + 0.0002)
      drawMap()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate)

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseUp) // Stop dragging if mouse leaves canvas

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseUp)
    }
  }, [origin, destination, onSelectOrigin, onSelectDestination, activeRegion, rotation])

  // Function to filter by region
  const handleRegionFilter = (region: string | null) => {
    setActiveRegion(region === activeRegion ? null : region)
  }

  // Function to handle zoom
  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? prev * 1.2 : prev / 1.2
      return Math.max(0.5, Math.min(2, newZoom))
    })
  }

  const filteredCountries = majorCountries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Search and history section */}
      <div className="space-y-2">
        <SearchCountry
          onSelectCountry={(country) => {
            if (mapMode === "origin") {
              onSelectOrigin({
                name: country.name,
                coordinates: country.coordinates,
              })
              setMapMode("destination")
            } else {
              onSelectDestination({
                name: country.name,
                coordinates: country.coordinates,
              })
              setMapMode("origin")
            }

            // Focus on the selected country by animating to its position
            const position = countryPositionsRef.current[country.code]
            if (position) {
              // Flash animation for the selected country
              const ctx = canvasRef.current?.getContext("2d")
              if (ctx) {
                const flashAnimation = () => {
                  let radius = position.radius
                  let opacity = 1
                  const animate = () => {
                    radius += 2
                    opacity -= 0.05

                    if (opacity > 0) {
                      ctx.beginPath()
                      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2)
                      ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`
                      ctx.fill()
                      requestAnimationFrame(animate)
                    } else {
                      if (canvasRef.current) {
                        const canvas = canvasRef.current
                        const ctx = canvas.getContext("2d", { alpha: true, antialias: true })
                        if (ctx) {
                          drawMap()
                        }
                      }
                    }
                  }
                  animate()
                }
                flashAnimation()
              }
            }
          }}
          placeholder={`Search for ${mapMode === "origin" ? "origin" : "destination"} country...`}
        />

        <div className="flex items-center text-sm text-gray-300">
          <span className="mr-2">Mode:</span>
          <button
            onClick={() => setMapMode("origin")}
            className={`px-3 py-1 rounded-full mr-2 ${
              mapMode === "origin" ? "bg-blue-500 text-white" : "bg-black text-gray-300"
            }`}
          >
            Origin
          </button>
          <button
            onClick={() => setMapMode("destination")}
            className={`px-3 py-1 rounded-full ${
              mapMode === "destination" ? "bg-red-500 text-white" : "bg-black text-gray-300"
            }`}
          >
            Destination
          </button>
        </div>
      </div>

      {/* Region filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleRegionFilter(null)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            activeRegion === null ? "bg-primary text-black font-medium" : "bg-black text-gray-300 hover:bg-secondary"
          }`}
        >
          All Regions
        </button>
        {["North America", "South America", "Europe", "Africa", "Asia", "Oceania"].map((region) => (
          <button
            key={region}
            onClick={() => handleRegionFilter(region)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeRegion === region
                ? "bg-primary text-black font-medium"
                : "bg-black text-gray-300 hover:bg-secondary"
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      <div className="relative w-full h-[650px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-white text-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading Map...</p>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{
            imageRendering: "crisp-edges",
            transform: `scale(${zoom})`,
            transition: "transform 0.3s ease-out",
            cursor: "grab",
          }}
        />

        {/* Zoom controls */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
          <button
            onClick={() => handleZoom("in")}
            className="w-10 h-10 rounded-full bg-black/70 border border-gray-700 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
          >
            +
          </button>
          <button
            onClick={() => handleZoom("out")}
            className="w-10 h-10 rounded-full bg-black/70 border border-gray-700 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
          >
            -
          </button>
          <button
            onClick={() => {
              setRotation(0)
              setZoom(1)
            }}
            className="w-10 h-10 rounded-full bg-black/70 border border-gray-700 text-white flex items-center justify-center hover:bg-black/90 transition-colors mt-2"
            title="Reset view"
          >
            ⌂
          </button>
        </div>

        {/* Instructions overlay */}
      </div>

      {/* Travel History component */}
      <TravelHistory
        onSelectHistory={(originName, destinationName) => {
          // Find countries by name
          const originCountry = majorCountries.find((c) => c.name === originName)
          const destCountry = majorCountries.find((c) => c.name === destinationName)

          if (originCountry) {
            onSelectOrigin({
              name: originCountry.name,
              coordinates: originCountry.coordinates,
            })
          }

          if (destCountry) {
            onSelectDestination({
              name: destCountry.name,
              coordinates: destCountry.coordinates,
            })
          }
        }}
      />

      {/* Current selection info */}
      <div className="bg-black/30 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-300">{origin ? origin.name : "Select origin country"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {destination ? destination.name : "Select destination country"}
            </span>
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
          </div>
        </div>

        {origin && destination && (
          <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between items-center">
            <div className="text-xs text-gray-400">
              Origin: {origin.coordinates.lat.toFixed(2)}, {origin.coordinates.lng.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Destination: {destination.coordinates.lat.toFixed(2)}, {destination.coordinates.lng.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
