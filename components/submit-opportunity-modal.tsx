"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, CheckCircle2 } from "lucide-react"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

interface SubmitOpportunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  opportunityName: string
  opportunityType: string
  description: string
  link: string
  userName: string
  userTwitter: string
}

export function SubmitOpportunityModal({ open, onOpenChange }: SubmitOpportunityModalProps) {
  const createSubmission = useMutation(api.submissions.create)
  const [formData, setFormData] = useState<FormData>({
    opportunityName: "",
    opportunityType: "",
    description: "",
    link: "",
    userName: "",
    userTwitter: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Prevent body scroll when modal is open
  useBodyScrollLock(open)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.opportunityName || !formData.opportunityType || !formData.description || !formData.link) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Call Convex mutation directly to ensure same logic in all environments
      await createSubmission({
        opportunityName: formData.opportunityName,
        opportunityType: formData.opportunityType,
        description: formData.description,
        link: formData.link,
        userName: formData.userName || undefined,
        userTwitter: formData.userTwitter || undefined,
        status: "pending",
      })

      setShowSuccess(true)

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({
          opportunityName: "",
          opportunityType: "",
          description: "",
          link: "",
          userName: "",
          userTwitter: "",
        })
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      console.error("Submission error:", error)
      alert("Failed to submit. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && onOpenChange(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              layout
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl lg:max-w-4xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
            >
              {!showSuccess ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                    <h2 className="font-serif text-2xl font-light text-foreground">Submit Opportunity</h2>
                    <motion.button
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
                    {/* Opportunity Fields - Grid Layout */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Opportunity Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="text"
                          name="opportunityName"
                          value={formData.opportunityName}
                          onChange={handleChange}
                          placeholder="e.g., Y Combinator Startup School"
                          className="bg-muted/50 border-muted focus:border-foreground focus:scale-[1.01] transition-transform"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Opportunity Type <span className="text-destructive">*</span>
                        </label>
                        <select
                          name="opportunityType"
                          value={formData.opportunityType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-muted/50 border border-muted rounded-lg text-sm focus:outline-none focus:border-foreground focus:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <option value="">Select type</option>
                          <option value="bootcamp">Bootcamp</option>
                          <option value="grant">Grant</option>
                          <option value="fellowship">Fellowship</option>
                          <option value="funding">Funding</option>
                          <option value="credits">Credits</option>
                          <option value="program">Program</option>
                          <option value="scholarship">Scholarship</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Link <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="url"
                          name="link"
                          value={formData.link}
                          onChange={handleChange}
                          placeholder="https://..."
                          className="bg-muted/50 border-muted focus:border-foreground focus:scale-[1.01] transition-transform"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Description <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Brief description of the opportunity..."
                          rows={4}
                          className="w-full px-3 py-2 bg-muted/50 border border-muted rounded-lg text-sm focus:outline-none focus:border-foreground focus:scale-[1.01] transition-all resize-none disabled:opacity-50"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* User Fields */}
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground font-medium mb-4">Optional Information</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Your Name</label>
                          <Input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="Your name"
                            className="bg-muted/50 border-muted focus:border-foreground focus:scale-[1.01] transition-transform"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Twitter / linkedin</label>
                          <Input
                            type="text"
                            name="userTwitter"
                            value={formData.userTwitter}
                            onChange={handleChange}
                            placeholder="@username or linkedin.com/..."
                            className="bg-muted/50 border-muted focus:border-foreground focus:scale-[1.01] transition-transform"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-border flex-shrink-0">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" disabled={isSubmitting} className="w-full cursor-pointer">
                          {isSubmitting ? "Submitting..." : "Submit Opportunity"}
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", damping: 15, stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-serif text-2xl font-light text-foreground mb-2"
                  >
                    Thank You!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-muted-foreground"
                  >
                    Your opportunity has been submitted for review.
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
