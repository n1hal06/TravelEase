"use client"

import { useEffect, useState } from "react"
import { Search, Eye, User, Mail, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

type UserRecord = {
  userid: number
  firstname: string
  lastname: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  verified: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // Remove ordering by created_at since it doesn't exist
      const { data, error } = await supabase.from("users").select("*").order("userid", { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error: any) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (user: UserRecord) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.userid.toString().includes(searchLower) ||
      user.firstname.toLowerCase().includes(searchLower) ||
      user.lastname.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.city && user.city.toLowerCase().includes(searchLower)) ||
      (user.country && user.country.toLowerCase().includes(searchLower)) ||
      false
    )
  })

  return (
    <>
      <header className="bg-card border-b border-border h-16 flex items-center px-6">
        <h1 className="text-xl font-medium">User Management</h1>
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm bg-secondary rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Users Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "No users match your search criteria." : "There are no users in the system yet."}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.userid} className="hover:bg-secondary/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{user.userid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.firstname} {user.lastname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.city && user.country ? `${user.city}, ${user.country}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.verified
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {user.verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary/80" onClick={() => handleViewDetails(user)}>
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">User Details #{selectedUser.userid}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">First Name</p>
                    <p className="text-sm font-medium">{selectedUser.firstname}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Name</p>
                    <p className="text-sm font-medium">{selectedUser.lastname}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="text-sm font-medium">#{selectedUser.userid}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.verified
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {selectedUser.verified ? "Verified" : "Unverified"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{selectedUser.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{selectedUser.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="text-sm font-medium">{selectedUser.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="text-sm font-medium">{selectedUser.country || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Removed Account Information section that referenced created_at */}
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowDetailsModal(false)} className="apple-button">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
