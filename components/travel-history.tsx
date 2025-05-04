"use client"

import { useState, useEffect } from "react"
import { Clock, ArrowRight } from "lucide-react"

type TravelHistoryEntry = {
  id: string
  origin: string
  destination: string
  timestamp: number
}

type TravelHistoryProps = {
  onSelectHistory: (origin: string, destination: string) => void
}

export default function TravelHistory({ onSelectHistory }: TravelHistoryProps) {
  const [historyEntries, setHistoryEntries] = useState<TravelHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("travelHistory")
    if (savedHistory) {
      try {
        setHistoryEntries(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse travel history:", e)
        setHistoryEntries([])
      }
    }
  }, [])

  // Method to add a new history entry (to be called from parent)
  const addHistoryEntry = (origin: string, destination: string) => {
    const newEntry = {
      id: Date.now().toString(),
      origin,
      destination,
      timestamp: Date.now(),
    }

    const updatedHistory = [newEntry, ...historyEntries].slice(0, 5) // Keep only 5 most recent
    setHistoryEntries(updatedHistory)
    localStorage.setItem("travelHistory", JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistoryEntries([])
    localStorage.removeItem("travelHistory")
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div>
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center text-sm text-primary hover:text-primary/80 mb-2"
      >
        <Clock className="h-4 w-4 mr-1" />
        {showHistory ? "Hide Travel History" : "Show Travel History"}
      </button>

      {showHistory && (
        <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden mb-4">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-300">Recent Searches</h3>
            {historyEntries.length > 0 && (
              <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-white">
                Clear All
              </button>
            )}
          </div>

          {historyEntries.length > 0 ? (
            <div className="max-h-48 overflow-auto">
              {historyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 hover:bg-black/70 cursor-pointer border-t border-gray-800 first:border-0"
                  onClick={() => onSelectHistory(entry.origin, entry.destination)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-white">{entry.origin}</span>
                      <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />
                      <span className="text-white">{entry.destination}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 px-3 text-center text-gray-400 text-sm">No travel history yet</div>
          )}
        </div>
      )}
    </div>
  )
}
