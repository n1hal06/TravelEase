import type React from "react"
import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { TravelProvider } from "@/components/travel-context"
import { AdminProvider } from "@/components/admin-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "TravelEase - Premium Travel Experience",
  description: "Plan your journey with our premium travel booking platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        <AdminProvider>
          <TravelProvider>{children}</TravelProvider>
        </AdminProvider>
      </body>
    </html>
  )
}
