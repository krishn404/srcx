"use client"

import { useState } from "react"
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground leading-tight">
              Discover Opportunities
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              A curated, neutral platform aggregating active programs, grants, bootcamps, funding, and benefit programs
              for students and developers.
            </p>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 w-full">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 id="opportunities" className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-1 sm:mb-2">
            All Opportunities
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Explore vetted programs from leading companies and organizations</p>
        </div>

        {/* Table */}
        <OpportunitiesTable onSelectOpportunity={setSelectedOpportunity} />
      </div>

      {/* Modal */}
      {selectedOpportunity && (
        <OpportunityModal opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} />
      )}

      {/* Submit Modal */}
      <SubmitOpportunityModal open={submitModalOpen} onOpenChange={setSubmitModalOpen} />

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-6 sm:py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} srcx. A neutral listing of all active opportunities.
            </div>
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Submit Opportunities
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}
