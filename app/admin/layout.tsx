"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Users, Package, Tag, LogOut, Menu, X } from "lucide-react"
import { useAdmin } from "@/components/admin-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminSession, logout, isLoading } = useAdmin()
  const [isMounted, setIsMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isLoading && !adminSession && !pathname?.includes("/admin/login")) {
      router.push("/admin/login")
    }
  }, [adminSession, isLoading, pathname, router])

  // Don't render anything until client-side hydration is complete
  if (!isMounted) {
    return null
  }

  // If on login page, just render children
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // If still loading or not authenticated, show loading state
  if (isLoading || !adminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Travels", href: "/admin/travels", icon: Package },
    { name: "Discounts", href: "/admin/discounts", icon: Tag },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed z-50 bottom-4 right-4 md:hidden bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-border">
          <h1 className="text-xl font-bold text-primary">TravelEase Admin</h1>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Logged in as <span className="font-medium text-foreground">{adminSession.userId}</span>
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-border">
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
