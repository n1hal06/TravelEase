"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AdminCheckPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [createStatus, setCreateStatus] = useState<any>(null)

  useEffect(() => {
    checkAdminSetup()
  }, [])

  async function checkAdminSetup() {
    try {
      setLoading(true)
      const response = await fetch("/api/check-admin")
      const data = await response.json()
      setDbInfo(data)
    } catch (err: any) {
      setError(err.message || "Failed to check admin setup")
    } finally {
      setLoading(false)
    }
  }

  async function createTestAdmin() {
    try {
      setLoading(true)
      const response = await fetch("/api/check-admin", {
        method: "POST",
      })
      const data = await response.json()
      setCreateStatus(data)
      // Refresh the DB info
      checkAdminSetup()
    } catch (err: any) {
      setError(err.message || "Failed to create test admin")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center mb-8">
        <Link href="/admin/login" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Login
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Database Check</h1>

        {loading && <p>Loading database information...</p>}

        {error && <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">Error: {error}</div>}

        {dbInfo && (
          <div className="bg-card p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Database Information</h2>
            <div className="bg-secondary p-4 rounded overflow-auto">
              <pre className="text-sm">{JSON.stringify(dbInfo, null, 2)}</pre>
            </div>
          </div>
        )}

        {createStatus && (
          <div className="bg-card p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Test Admin Result</h2>
            <div
              className={`p-4 rounded ${createStatus.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {createStatus.message}
            </div>
            {createStatus.admin && (
              <div className="bg-secondary p-4 rounded mt-4 overflow-auto">
                <pre className="text-sm">{JSON.stringify(createStatus.admin, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={checkAdminSetup}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            Refresh Database Info
          </button>
          <button
            onClick={createTestAdmin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            Create Test Admin
          </button>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Login Instructions</h3>
          <p className="text-yellow-800">
            After creating a test admin, you can log in with:
            <br />
            User ID: <strong>1</strong>
            <br />
            Password: <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
