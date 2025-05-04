"use client"

import { useEffect, useRef } from "react"

interface AnimatedBackgroundProps {
  className?: string
}

export default function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initial resize
    resizeCanvas()

    // Handle window resize
    window.addEventListener("resize", resizeCanvas)

    // Create stars
    const stars: Star[] = []
    const numStars = Math.floor((window.innerWidth * window.innerHeight) / 1000)

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.01,
        hue: Math.random() * 60 + 210, // Blue to purple hues
        twinkleSpeed: Math.random() * 0.01 + 0.003,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // Create nebula clouds
    const nebulae: Nebula[] = []
    const numNebulae = 3

    for (let i = 0; i < numNebulae; i++) {
      nebulae.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 300 + 200,
        opacity: Math.random() * 0.05 + 0.02,
        hue: Math.random() * 60 + 210, // Blue to purple hues
        speed: Math.random() * 0.1 + 0.05,
        direction: Math.random() * Math.PI * 2,
      })
    }

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw nebulae
      nebulae.forEach((nebula) => {
        // Move nebula
        nebula.x += Math.cos(nebula.direction) * nebula.speed
        nebula.y += Math.sin(nebula.direction) * nebula.speed

        // Bounce off edges
        if (nebula.x < -nebula.radius) nebula.x = canvas.width + nebula.radius
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius
        if (nebula.y < -nebula.radius) nebula.y = canvas.height + nebula.radius
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius

        // Draw nebula
        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius)
        gradient.addColorStop(0, `hsla(${nebula.hue}, 100%, 50%, ${nebula.opacity})`)
        gradient.addColorStop(1, "hsla(0, 0%, 0%, 0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw stars
      stars.forEach((star) => {
        // Move star
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }

        // Twinkle effect
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5
        const currentOpacity = star.opacity * twinkle

        // Draw star
        ctx.fillStyle = `hsla(${star.hue}, 100%, 90%, ${currentOpacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`} />
}

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  speed: number
  hue: number
  twinkleSpeed: number
  twinklePhase: number
}

interface Nebula {
  x: number
  y: number
  radius: number
  opacity: number
  hue: number
  speed: number
  direction: number
}
