"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ArrowDown, Badge } from "lucide-react"
import { OpportunitiesTable } from "@/components/list"
import { OpportunityModal } from "@/components/modal"
import { SubmitOpportunityModal } from "@/components/submit"
import { Button } from "@/components/ui/button"
import type { Opportunity } from "@/types/opportunity"

export default function HomePage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  
  const opportunities = useQuery(api.opportunities.list, { status: "active" })
  const opportunityCount = opportunities?.length || 0

  const scrollToOpportunities = () => {
    document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero Section - Revamped */}
      <header className="relative overflow-hidden border-b border-border flex items-center justify-center min-h-[50vh] sm:min-h-[60vh]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <motion.div 
            className="space-y-4 sm:space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge with count */}
            {opportunityCount > 0 && (

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-foreground"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="inline-flex"
                >
                  <Badge className="w-4 h-4 text-primary" />
                </motion.span>
              
                <span>{opportunityCount} active opportunities</span>
              </motion.div>              
            )}
            
            <motion.h1 
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight text-foreground leading-[0.95]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="block bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text">Explore, Review, & Apply</span>
              <motion.span 
                className="block text-muted-foreground/70 mt-2 sm:mt-3 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                to the best opportunities.
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Currently open grants, programs, and benefits for developers, students, and early-stage startups.
              Each entry is manually reviewed and tagged by application status.
            </motion.p>
            
            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="pt-2"
            >
              <motion.button
                onClick={scrollToOpportunities}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg cursor-pointer group relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:bg-muted/50"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">View Opportunities</span>
                <motion.div
                  className="relative z-10"
                  initial={false}
                  animate={{ y: 0 }}
                  whileHover={{ y: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowDown className="w-4 h-4" />
                </motion.div>
                {/* Hover effect background */}
                <motion.div
                  className="absolute inset-0 bg-primary/5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Content Section */}
      <div id="opportunities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 w-full">
        {/* Section Header */}
        <motion.div 
          className="mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2 sm:mb-3">
            All Opportunities
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Explore vetted programs from leading companies and organizations</p>
        </motion.div>

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
      <footer className="border-t border-border bg-muted/30 py-8 sm:py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} srcx. A neutral listing of all active opportunities.
            </div>
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50"
            >
              <span
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                aria-hidden="true"
              />
              Submit Opportunities
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}
