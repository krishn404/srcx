"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import type { Opportunity } from "@/types/opportunity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { normalizeTags } from "@/lib/constants"
import { getFaviconUrlWithFallback } from "@/lib/favicon"

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

  const daysUntilDeadline = opportunity.deadline 
    ? Math.ceil((opportunity.deadline - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="opportunity-modal"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background border border-border rounded-2xl w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-between p-6 border-b border-border shrink-0"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {opportunity.logoUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden"
                    >
                      <Image
                        src={opportunity.logoUrl}
                        alt={opportunity.provider}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={async (e) => {
                          // Fallback to generated placeholder favicon
                          const fallback = await getFaviconUrlWithFallback(opportunity.applyUrl)
                          e.currentTarget.src = fallback
                        }}
                      />
                    </motion.div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl sm:text-2xl font-light text-foreground truncate">
                      {opportunity.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                      {opportunity.provider}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold text-sm mb-3">
                    About this opportunity
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {opportunity.description_full}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      Deadline
                    </p>
                    {opportunity.deadline ? (
                      <>
                        <p className="text-sm font-medium">
                          {new Date(opportunity.deadline).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {daysUntilDeadline && daysUntilDeadline > 0
                            ? `${daysUntilDeadline} day${
                                daysUntilDeadline !== 1 ? "s" : ""
                              } remaining`
                            : "Deadline passed"}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-medium">
                        Rolling deadline
                      </p>
                    )}
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {normalizeTags(opportunity.categoryTags || []).map((tag, index) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                      >
                        <Badge variant="secondary">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    For Whom
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.applicableGroups.map((group, index) => (
                      <motion.div
                        key={group}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45 + index * 0.05 }}
                      >
                        <Badge variant="outline">
                          {group}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4 border-t border-border shrink-0"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() =>
                        window.open(opportunity.applyUrl, "_blank")
                      }
                      className="w-full h-10 cursor-pointer"
                    >
                      Apply Now
                    </Button>
                  </motion.div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    You'll be redirected to the official application page
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
