"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { gsap } from "gsap"
import { countries } from "@/lib/countries-data"

type GlobeMapProps = {
  onSelectOrigin: (location: any) => void
  onSelectDestination: (location: any) => void
  origin: any
  destination: any
}

export default function GlobeMap({ onSelectOrigin, onSelectDestination, origin, destination }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mapMode, setMapMode] = useState<"origin" | "destination">(origin ? "destination" : "origin")
  const [isLoading, setIsLoading] = useState(true)

  // Store Three.js objects in refs to access them in event handlers
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const globeRef = useRef<THREE.Mesh | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const countryObjectsRef = useRef<{ [key: string]: THREE.Mesh }>({})

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene
    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color(0x000000)

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    cameraRef.current = camera
    camera.position.z = 200

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    rendererRef.current = renderer
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.minDistance = 120
    controls.maxDistance = 300
    controls.enablePan = false

    // Create globe
    const globeRadius = 100
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64)
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x3a3a3a,
      emissive: 0x112244,
      specular: 0x333333,
      shininess: 5,
    })

    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    globeRef.current = globe
    scene.add(globe)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    // Add stars background
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
    })

    const starVertices = []
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000
      starVertices.push(x, y, z)
    }

    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    // Add grid lines
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 })

    // Longitude lines
    for (let i = 0; i < 24; i++) {
      const longitude = (i * 15 - 180) * (Math.PI / 180)
      const points = []

      for (let j = 0; j <= 180; j++) {
        const latitude = (j - 90) * (Math.PI / 180)
        const x = globeRadius * Math.cos(latitude) * Math.cos(longitude)
        const y = globeRadius * Math.sin(latitude)
        const z = globeRadius * Math.cos(latitude) * Math.sin(longitude)

        points.push(new THREE.Vector3(x, y, z))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, gridMaterial)
      scene.add(line)
    }

    // Latitude lines
    for (let i = 0; i < 12; i++) {
      const latitude = (i * 15 - 90) * (Math.PI / 180)
      const points = []

      for (let j = 0; j <= 360; j++) {
        const longitude = (j - 180) * (Math.PI / 180)
        const x = globeRadius * Math.cos(latitude) * Math.cos(longitude)
        const y = globeRadius * Math.sin(latitude)
        const z = globeRadius * Math.cos(latitude) * Math.sin(longitude)

        points.push(new THREE.Vector3(x, y, z))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, gridMaterial)
      scene.add(line)
    }

    // Add country markers
    countries.forEach((country) => {
      const lat = country.coordinates.lat * (Math.PI / 180)
      const lng = country.coordinates.lng * (Math.PI / 180)

      const x = globeRadius * Math.cos(lat) * Math.cos(lng)
      const y = globeRadius * Math.sin(lat)
      const z = globeRadius * Math.cos(lat) * Math.sin(lng)

      const markerGeometry = new THREE.SphereGeometry(1.5, 16, 16)
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.8,
      })

      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.set(x, y, z)
      marker.userData = { countryName: country.name, countryCode: country.code }

      scene.add(marker)
      countryObjectsRef.current[country.code] = marker
    })

    // Update marker colors for origin and destination
    updateMarkerColors()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Handle mouse move for raycasting
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1

      // Update tooltip position
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${event.clientX + 10}px`
        tooltipRef.current.style.top = `${event.clientY + 10}px`
      }
    }

    containerRef.current.addEventListener("mousemove", handleMouseMove)

    // Handle click for country selection
    const handleClick = () => {
      if (!sceneRef.current || !cameraRef.current) return

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children)

      if (intersects.length > 0) {
        const selectedObject = intersects[0].object

        if (selectedObject.userData && selectedObject.userData.countryName) {
          const location = {
            name: selectedObject.userData.countryName,
            coordinates: {
              lat: 0,
              lng: 0,
            },
          }

          // Find the country in our data to get accurate coordinates
          const countryData = countries.find((c) => c.name === selectedObject.userData.countryName)
          if (countryData) {
            location.coordinates = countryData.coordinates
          }

          if (mapMode === "origin") {
            onSelectOrigin(location)
            setMapMode("destination")
          } else {
            onSelectDestination(location)
            setMapMode("origin")
          }

          // Update marker colors
          updateMarkerColors()

          // Animate to selected country
          animateToCountry(selectedObject.position)
        }
      }
    }

    containerRef.current.addEventListener("click", handleClick)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      // Raycasting for hover effect
      if (cameraRef.current && sceneRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
        const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children)

        let foundCountry = false

        for (let i = 0; i < intersects.length; i++) {
          const obj = intersects[i].object

          if (obj.userData && obj.userData.countryName) {
            setHoveredCountry(obj.userData.countryName)
            foundCountry = true

            // Highlight hovered country
            if (obj.material instanceof THREE.MeshBasicMaterial && !isOriginOrDestination(obj.userData.countryName)) {
              obj.material.color.set(0xffcc00)
              obj.material.opacity = 1
            }

            break
          }
        }

        if (!foundCountry) {
          setHoveredCountry(null)

          // Reset colors for non-selected countries
          Object.values(countryObjectsRef.current).forEach((marker) => {
            if (
              marker.userData &&
              !isOriginOrDestination(marker.userData.countryName) &&
              marker.material instanceof THREE.MeshBasicMaterial
            ) {
              marker.material.color.set(0xcccccc)
              marker.material.opacity = 0.8
            }
          })
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    // Initial animation
    gsap.to(camera.position, {
      z: 200,
      duration: 2,
      ease: "power2.out",
      onComplete: () => setIsLoading(false),
    })

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove)
        containerRef.current.removeEventListener("click", handleClick)

        if (rendererRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement)
        }
      }
    }
  }, [])

  // Update marker colors when origin or destination changes
  useEffect(() => {
    updateMarkerColors()
  }, [origin, destination])

  // Helper function to check if a country is origin or destination
  const isOriginOrDestination = (countryName: string) => {
    return (origin && origin.name === countryName) || (destination && destination.name === countryName)
  }

  // Update marker colors based on selection
  const updateMarkerColors = () => {
    Object.values(countryObjectsRef.current).forEach((marker) => {
      if (marker.userData && marker.material instanceof THREE.MeshBasicMaterial) {
        if (origin && marker.userData.countryName === origin.name) {
          marker.material.color.set(0x3b82f6) // Blue for origin
          marker.material.opacity = 1
          marker.scale.set(1.5, 1.5, 1.5)
        } else if (destination && marker.userData.countryName === destination.name) {
          marker.material.color.set(0xef4444) // Red for destination
          marker.material.opacity = 1
          marker.scale.set(1.5, 1.5, 1.5)
        } else {
          marker.material.color.set(0xcccccc) // Default color
          marker.material.opacity = 0.8
          marker.scale.set(1, 1, 1)
        }
      }
    })

    // Add connection line between origin and destination
    if (origin && destination && sceneRef.current) {
      // Remove any existing connection line
      const existingLine = sceneRef.current.children.find((child) => child.userData && child.userData.isConnectionLine)
      if (existingLine) {
        sceneRef.current.remove(existingLine)
      }

      const originMarker = countryObjectsRef.current[countries.find((c) => c.name === origin.name)?.code || ""]
      const destMarker = countryObjectsRef.current[countries.find((c) => c.name === destination.name)?.code || ""]

      if (originMarker && destMarker) {
        const points = []
        points.push(originMarker.position.clone())

        // Create an arc between points
        const midPoint = new THREE.Vector3()
          .addVectors(originMarker.position.clone(), destMarker.position.clone())
          .multiplyScalar(0.5)

        // Push the midpoint outward
        const distance = originMarker.position.distanceTo(destMarker.position)
        midPoint.normalize().multiplyScalar(100 + distance * 0.2)

        points.push(midPoint)
        points.push(destMarker.position.clone())

        const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2])

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50))
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffcc00,
          linewidth: 2,
        })

        const connectionLine = new THREE.Line(lineGeometry, lineMaterial)
        connectionLine.userData = { isConnectionLine: true }
        sceneRef.current.add(connectionLine)
      }
    }
  }

  // Animate camera to focus on a country
  const animateToCountry = (position: THREE.Vector3) => {
    if (!cameraRef.current || !controlsRef.current) return

    const targetPosition = position.clone().normalize().multiplyScalar(200)

    gsap.to(cameraRef.current.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (controlsRef.current) {
          controlsRef.current.update()
        }
      },
    })
  }

  // Controls for zoom and reset
  const handleZoomIn = () => {
    if (!cameraRef.current) return
    gsap.to(cameraRef.current.position, {
      x: cameraRef.current.position.x * 0.8,
      y: cameraRef.current.position.y * 0.8,
      z: cameraRef.current.position.z * 0.8,
      duration: 0.5,
      ease: "power2.out",
    })
  }

  const handleZoomOut = () => {
    if (!cameraRef.current) return
    gsap.to(cameraRef.current.position, {
      x: cameraRef.current.position.x * 1.25,
      y: cameraRef.current.position.y * 1.25,
      z: cameraRef.current.position.z * 1.25,
      duration: 0.5,
      ease: "power2.out",
    })
  }

  const handleReset = () => {
    if (!cameraRef.current) return
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 0,
      z: 200,
      duration: 1,
      ease: "power2.inOut",
    })
  }

  return (
    <div className="relative w-full h-[600px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading 3D Globe...</p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
      ></div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`absolute px-3 py-1.5 bg-black/80 text-white text-sm rounded-lg pointer-events-none transition-opacity duration-200 z-20 ${
          hoveredCountry ? "opacity-100" : "opacity-0"
        }`}
      >
        {hoveredCountry}
      </div>

      {/* Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <span className="text-xl">+</span>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <span className="text-xl">-</span>
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors mt-2"
        >
          <span className="text-xl">⌂</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg z-10">
        <p className="text-sm">
          {mapMode === "origin"
            ? "Click on a country to select your origin"
            : "Now click on a country to select your destination"}
        </p>
        <div className="flex gap-4 mt-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Origin</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
            <span>Hovered</span>
          </div>
        </div>
      </div>
    </div>
  )
}
