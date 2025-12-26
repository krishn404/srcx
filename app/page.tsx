"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { OpportunitiesTable } from "@/components/opportunities-table"
import { OpportunityModal } from "@/components/opportunity-modal"
import { SubmitOpportunityModal } from "@/components/submit-opportunity-modal"
import type { Opportunity } from "@/types/opportunity"

export default function HomePage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero Section - Minimal Centered */}
      <header className="relative overflow-hidden border-b border-border flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="font-serif text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight text-foreground leading-tight"
            >
              Discover Opportunities
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              A curated, neutral platform aggregating active programs, grants, bootcamps, funding, and benefit programs
              for students and developers.
            </motion.p>
          </motion.div>
        </div>
      </header>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full"
      >
        {/* Section Header */}
        <div className="mb-12">
          <h2 id="opportunities" className="font-serif text-3xl font-light text-foreground mb-2">
            All Opportunities
          </h2>
          <p className="text-muted-foreground">Explore vetted programs from leading companies and organizations</p>
        </div>

        {/* Table */}
        <OpportunitiesTable onSelectOpportunity={setSelectedOpportunity} />
      </motion.div>

      {/* Modal */}
      {selectedOpportunity && (
        <OpportunityModal opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} />
      )}

      {/* Submit Modal */}
      <SubmitOpportunityModal open={submitModalOpen} onOpenChange={setSubmitModalOpen} />

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2025 Student & Developer Opportunities. A neutral listing service.
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                About
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Privacy
              </motion.a>
              <motion.button
                onClick={() => setSubmitModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Submit Opportunities
              </motion.button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
