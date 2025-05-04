"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminDebugPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdminTable() {
      try {
        const response = await fetch("/api/admin-check")
        const data = await response.json()
        setResult(data)
      } catch (err: any) {
        setError(err.message || "Failed to check admin table")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminTable()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin System Debug</h1>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Admin Table Check</h2>

        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Checking admin table...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-md">
                <span className="font-medium">Table Status:</span>
              </div>
              <div className="p-3">
                {result?.success ? (
                  <span className="text-green-600 font-medium">Available</span>
                ) : (
                  <span className="text-destructive font-medium">Unavailable</span>
                )}
              </div>

              <div className="bg-muted p-3 rounded-md">
                <span className="font-medium">Has Admin Data:</span>
              </div>
              <div className="p-3">
                {result?.hasData ? (
                  <span className="text-green-600 font-medium">Yes</span>
                ) : (
                  <span className="text-amber-600 font-medium">No</span>
                )}
              </div>
            </div>

            {result?.sampleData && (
              <div>
                <h3 className="font-medium mb-2">Sample Admin Data:</h3>
                <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(result.sampleData, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-4">
              <Link
                href="/admin/login"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to Login Page
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Session Debug</h2>

        <button
          onClick={() => {
            const session = localStorage.getItem("adminSession")
            alert(session ? `Current session: ${session}` : "No session found")
          }}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
        >
          Check Current Session
        </button>
      </div>
    </div>
  )
}
