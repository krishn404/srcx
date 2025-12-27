"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import type { Opportunity } from "@/types/opportunity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

interface OpportunityModalProps {
  opportunity: Opportunity
  onClose: () => void
  isOpen?: boolean
}

export function OpportunityModal({
  opportunity,
  onClose,
  isOpen = true,
}: OpportunityModalProps) {
  useBodyScrollLock(isOpen)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const daysUntilDeadline = Math.ceil(
    (opportunity.deadline - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="opportunity-modal"
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <div
              className="bg-background border border-border rounded-lg w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-lg pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  {opportunity.logoUrl && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Image
                        src={opportunity.logoUrl || "/placeholder.svg"}
                        alt={opportunity.provider}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold truncate text-sm sm:text-base">
                      {opportunity.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {opportunity.provider}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-muted"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-semibold text-sm mb-2">
                    About this opportunity
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {opportunity.description_full}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      Deadline
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(opportunity.deadline).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" }
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {daysUntilDeadline > 0
                        ? `${daysUntilDeadline} day${
                            daysUntilDeadline !== 1 ? "s" : ""
                          } remaining`
                        : "Deadline passed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium">
                      {new Date(opportunity.updatedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.categoryTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    For Whom
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.applicableGroups.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={() =>
                      window.open(opportunity.applyUrl, "_blank")
                    }
                    className="w-full h-10"
                  >
                    Apply Now
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    You'll be redirected to the official application page
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
