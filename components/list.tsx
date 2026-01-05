"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Image from "next/image"
import type { Opportunity } from "@/types/opportunity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PREDEFINED_TAGS, type PredefinedTag, normalizeTags } from "@/lib/constants"
import { getFaviconUrlWithFallback } from "@/lib/favicon"
import { FileText, Search, ArrowUpRight } from "lucide-react"
import { DeadlineBadge } from "@/components/deadline-badge"

interface OpportunitiesTableProps {
  onSelectOpportunity: (opportunity: Opportunity) => void
}

export function OpportunitiesTable({ onSelectOpportunity }: OpportunitiesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<PredefinedTag | null>(null)

  // Fetch opportunities from Convex
  const opportunities = useQuery(api.opportunities.list, {
    status: "active",
  })

  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return []

    return opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.provider.toLowerCase().includes(searchQuery.toLowerCase())

      const normalizedTags = normalizeTags(opp.categoryTags || [])
      const matchesCategory = !selectedCategory || normalizedTags.includes(selectedCategory)

      return matchesSearch && matchesCategory
    })
  }, [opportunities, searchQuery, selectedCategory])

  // Get unique categories for filter - only from predefined tags
  const allCategories = useMemo(() => {
    if (!opportunities) return []
    const usedTags = new Set<string>()
    opportunities.forEach((opp) => {
      const normalized = normalizeTags(opp.categoryTags || [])
      normalized.forEach((tag) => usedTags.add(tag))
    })
    // Return only predefined tags that are actually used, sorted
    return PREDEFINED_TAGS.filter((tag) => usedTags.has(tag))
  }, [opportunities])

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Search and Filters */}
      <motion.div 
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Search input - primary, takes remaining width */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search opportunities, providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full text-base border-2 focus:border-primary/50 transition-colors shadow-sm"
          />
        </div>

        {/* Filter tags - compact pill buttons aligned to the right on larger screens */}
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs cursor-pointer rounded-md px-4 h-9 font-medium transition-all hover:scale-105"
          >
            All
          </Button>
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs cursor-pointer rounded-md px-4 h-9 font-medium transition-all hover:scale-105"
            >
              {category}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Results Count */}
      {opportunities !== undefined && opportunities.length > 0 && (
        <motion.div 
          className="text-sm sm:text-base text-muted-foreground font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {filteredOpportunities.length}{" "}
          {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"}
        </motion.div>
      )}

      {/* Table - Responsive */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left px-4 sm:px-6 py-4 font-semibold text-foreground w-16 text-xs uppercase tracking-wider">Logo</th>
                <th className="text-left px-4 sm:px-6 py-4 font-semibold text-foreground flex-1 min-w-64 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 sm:px-6 py-4 font-semibold text-foreground w-48 text-xs uppercase tracking-wider">Tags</th>
                <th className="text-left px-4 sm:px-6 py-4 font-semibold text-foreground w-32 text-xs uppercase tracking-wider">Deadline</th>
                <th className="text-right px-4 sm:px-6 py-4 font-semibold text-foreground w-28 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {opportunities === undefined ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading opportunities...
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 sm:py-16">
                    <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                          No opportunities yet
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-sm">
                          We're curating the best grants, bootcamps, and programs for students and developers. Check back soon for exciting opportunities!
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 sm:py-16">
                    <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center">
                        <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                          No opportunities match your search
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          Try adjusting your filters or search terms to find what you're looking for.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opportunity, index) => (
                  <motion.tr
                    key={opportunity._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="border-b border-border hover:bg-muted/40 cursor-pointer transition-all duration-200 group"
                    onClick={() => onSelectOpportunity(opportunity)}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors shadow-sm">
                        {opportunity.logoUrl ? (
                          <Image
                            src={opportunity.logoUrl}
                            alt={opportunity.provider}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            onError={async (e) => {
                              // Fallback to generated placeholder favicon
                              const fallback = await getFaviconUrlWithFallback(opportunity.applyUrl)
                              e.currentTarget.src = fallback
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1.5">
                        <p className="font-semibold text-foreground line-clamp-1 text-sm group-hover:text-primary transition-colors">{opportunity.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{opportunity.description}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {normalizeTags(opportunity.categoryTags || []).slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-medium rounded-full px-2.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {normalizeTags(opportunity.categoryTags || []).length > 2 && (
                          <Badge variant="outline" className="text-xs font-medium rounded-full px-2.5 py-0.5">
                            +{normalizeTags(opportunity.categoryTags || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {opportunity.deadline && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                            {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <DeadlineBadge deadline={opportunity.deadline} />
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <Button
                        size="sm"
                        className="text-xs cursor-pointer rounded-full px-4 h-8 font-medium group/btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(opportunity.applyUrl, "_blank")
                        }}
                      >
                        Apply
                        <ArrowUpRight className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
          {opportunities === undefined ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-border">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-xl font-semibold text-foreground">
                  No opportunities yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  We're curating the best grants, bootcamps, and programs for students and developers. Check back soon for exciting opportunities!
                </p>
              </div>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-border">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-xl font-semibold text-foreground">
                  No opportunities match your search
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
              </div>
            </div>
          ) : (
            filteredOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border border-border rounded-xl p-5 space-y-4 hover:bg-muted/40 cursor-pointer transition-all duration-200 hover:shadow-md bg-card group"
                onClick={() => onSelectOpportunity(opportunity)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors shadow-sm">
                    {opportunity.logoUrl ? (
                      <Image
                        src={opportunity.logoUrl}
                        alt={opportunity.provider}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        onError={async (e) => {
                          // Fallback to generated placeholder favicon
                          const fallback = await getFaviconUrlWithFallback(opportunity.applyUrl)
                          e.currentTarget.src = fallback
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">{opportunity.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{opportunity.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {normalizeTags(opportunity.categoryTags || []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-medium rounded-full px-2.5 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {normalizeTags(opportunity.categoryTags || []).length > 3 && (
                        <Badge variant="outline" className="text-xs font-medium rounded-full px-2.5 py-0.5">
                          +{normalizeTags(opportunity.categoryTags || []).length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="flex flex-col gap-2">
                        {opportunity.deadline && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <DeadlineBadge deadline={opportunity.deadline} />
                      </div>
                      <Button
                        size="sm"
                        className="text-xs cursor-pointer rounded-full px-4 h-8 font-medium group/btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(opportunity.applyUrl, "_blank")
                        }}
                      >
                        Apply
                        <ArrowUpRight className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
