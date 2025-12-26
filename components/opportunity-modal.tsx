"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import type { Opportunity } from "@/types/opportunity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface OpportunityModalProps {
  opportunity: Opportunity
  onClose: () => void
}

export function OpportunityModal({ opportunity, onClose }: OpportunityModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const daysUntilDeadline = Math.ceil((opportunity.deadline - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {opportunity.logoUrl && (
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Image
                    src={opportunity.logoUrl || "/placeholder.svg"}
                    alt={opportunity.provider}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                    }}
                  />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground truncate">{opportunity.title}</h2>
                <p className="text-sm text-muted-foreground">{opportunity.provider}</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 rounded-full hover:bg-muted"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-2">About this opportunity</h3>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {opportunity.description_full}
              </p>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">Deadline</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {daysUntilDeadline > 0
                    ? `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? "s" : ""} remaining`
                    : "Deadline passed"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">Last Updated</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(opportunity.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {opportunity.categoryTags.map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge variant="secondary" className="cursor-default">
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Applicable Groups */}
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2">For Whom</p>
              <div className="flex flex-wrap gap-2">
                {opportunity.applicableGroups.map((group, index) => (
                  <motion.div
                    key={group}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge variant="outline" className="cursor-default">
                      {group}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-border">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => window.open(opportunity.applyUrl, "_blank")}
                  className="w-full h-10 cursor-pointer"
                >
                  Apply Now
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                You'll be redirected to the official application page
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
