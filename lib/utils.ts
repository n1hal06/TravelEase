import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Counter to keep track of IDs (will reset on server restart)
const idCounters: Record<string, number> = {
  default: 100, // Start from 100 for default counter
  travel: 100,
  passenger: 100,
  order: 100,
  billing: 100,
  flight: 100,
  resort: 100,
  vehicle: 100,
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Calculate days between two dates
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

// Generate a sequential ID with a maximum of 3 digits
export function generateUniqueId(prefix = "default"): number {
  // Get the counter for this prefix or use default
  const counterKey = prefix.replace(/[_-]/g, "").toLowerCase()

  // Initialize counter if it doesn't exist
  if (!idCounters[counterKey]) {
    idCounters[counterKey] = 100 // Start from 100
  }

  // Get current counter value and increment for next use
  const id = idCounters[counterKey]++

  // Reset counter if it exceeds 999 (3 digits)
  if (idCounters[counterKey] > 999) {
    idCounters[counterKey] = 100
  }

  return id
}
