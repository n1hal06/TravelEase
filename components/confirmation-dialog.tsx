"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2 } from "lucide-react"

type ConfirmationDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Continue",
  cancelText = "Skip to the next step",
}: ConfirmationDialogProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  const handleConfirm = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onConfirm()
    }, 300)
  }

  if (!isOpen && !isClosing) return null

  return (
    <AnimatePresence>
      {(isOpen || isClosing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-card rounded-2xl p-6 shadow-xl border border-border max-w-md w-full mx-4 z-50"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mr-4">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>

            <p className="text-muted-foreground mb-6">{message}</p>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button onClick={handleClose} className="apple-button-secondary order-2 sm:order-1 w-full sm:w-auto">
                {cancelText}
              </button>
              <button onClick={handleConfirm} className="apple-button order-1 sm:order-2 w-full sm:w-auto">
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
