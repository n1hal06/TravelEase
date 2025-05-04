"use client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DatabaseSeeder from "../../../seed-database"

export default function SeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-heading font-semibold text-primary">
            TravelEase
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <DatabaseSeeder />
      </main>
    </div>
  )
}
