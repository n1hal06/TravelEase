"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Tag } from "lucide-react"
import { createDiscount, deleteDiscount, getAllDiscounts } from "@/lib/admin-operations"

type Discount = {
  discountid: number
  code: string
  discounttype: string
  amount?: number | null
  expiry_date: string | null | undefined
  is_active?: boolean | null
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    discounttype: "percentage",
    amount: 10,
    expiry_date: "",
    is_active: true,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAllDiscounts()
      setDiscounts(data || [])
    } catch (error: any) {
      console.error("Error fetching discounts:", error)
      setError(error.message || "Failed to load discounts")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.code.trim()) {
        throw new Error("Discount code is required")
      }

      if (formData.amount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      // Create discount
      await createDiscount({
        code: formData.code.trim(),
        discounttype: formData.discounttype,
        amount: formData.amount,
        expiry_date: formData.expiry_date ?? undefined,
        is_active: formData.is_active,
      })

      // Reset form and close modal
      setFormData({
        code: "",
        discounttype: "percentage",
        amount: 10,
        expiry_date: "",
        is_active: true,
      })
      setShowAddModal(false)

      // Refresh discounts
      fetchDiscounts()
    } catch (error: any) {
      console.error("Error adding discount:", error)
      setFormError(error.message || "An error occurred while adding the discount")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (discount: Discount) => {
    setSelectedDiscount(discount)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedDiscount) return

    try {
      await deleteDiscount(selectedDiscount.discountid)
      setShowDeleteModal(false)
      setSelectedDiscount(null)
      fetchDiscounts()
    } catch (error: any) {
      console.error("Error deleting discount:", error)
    }
  }

  // Helper function to safely format amount
  const formatAmount = (amount: number | null | undefined, type: string) => {
    if (amount === null || amount === undefined) return "N/A"

    if (type === "percentage") {
      return `${amount}%`
    } else {
      return `$${amount.toFixed(2)}`
    }
  }

  return (
    <>
      <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-medium">Discount Coupons</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Discount
        </button>
      </header>

      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/20 text-destructive p-4 rounded-lg">
            <p className="font-medium">Error loading discounts</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchDiscounts}
              className="mt-4 px-4 py-2 bg-card border border-border rounded-md hover:bg-secondary transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : discounts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Discount Coupons</h3>
            <p className="text-muted-foreground mb-6">Create your first discount coupon to offer special deals.</p>
            <button onClick={() => setShowAddModal(true)} className="apple-button inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expiry Date
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
                {discounts.map((discount) => (
                  <tr key={discount.discountid} className="hover:bg-secondary/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{discount.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">
                      {discount.discounttype || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatAmount(discount.amount, discount.discounttype || "")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {discount.expiry_date ? new Date(discount.expiry_date).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          discount.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {discount.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(discount)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Discount Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Add Discount Coupon</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                ×
              </button>
            </div>

            <form onSubmit={handleAddDiscount} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium mb-1">
                  Discount Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. SUMMER2023"
                  required
                />
              </div>

              <div>
                <label htmlFor="discounttype" className="block text-sm font-medium mb-1">
                  Discount Type
                </label>
                <select
                  id="discounttype"
                  name="discounttype"
                  value={formData.discounttype}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  min="0"
                  step={formData.discounttype === "percentage" ? "1" : "0.01"}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.discounttype === "percentage"
                    ? "Enter percentage value (e.g. 10 for 10%)"
                    : "Enter dollar amount"}
                </p>
              </div>

              <div>
                <label htmlFor="expiry_date" className="block text-sm font-medium mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm">
                  Active
                </label>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-destructive/20 text-destructive text-sm">{formError}</div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="apple-button" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                      Adding...
                    </>
                  ) : (
                    "Add Discount"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDiscount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Delete Discount</h2>
              <button onClick={() => setShowDeleteModal(false)} className="text-muted-foreground hover:text-foreground">
                ×
              </button>
            </div>

            <p className="mb-6">
              Are you sure you want to delete the discount code <strong>{selectedDiscount.code}</strong>? This action
              cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
