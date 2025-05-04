"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldCheck, User } from "lucide-react"

export default function SelectRolePage() {
  const router = useRouter()

  const handleUserClick = () => {
    // Redirect to the original home page
    router.push("/home")
  }

  const handleAdminClick = () => {
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">TravelEase</h1>
        <p className="text-xl text-muted-foreground">Select your role to continue</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          className="bg-card border border-border rounded-xl p-8 flex flex-col items-center cursor-pointer"
          onClick={handleUserClick}
        >
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">User</h2>
          <p className="text-muted-foreground text-center">
            Browse travel options, book trips, and manage your bookings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          className="bg-card border border-border rounded-xl p-8 flex flex-col items-center cursor-pointer"
          onClick={handleAdminClick}
        >
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin</h2>
          <p className="text-muted-foreground text-center">
            Manage discounts, view bookings, and access administrative tools
          </p>
        </motion.div>
      </div>
    </div>
  )
}
