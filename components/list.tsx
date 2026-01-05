"use client"

import { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Image from "next/image"
import type { Opportunity } from "@/types/opportunity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PREDEFINED_TAGS, normalizeTags } from "@/lib/constants"
import { getFaviconUrlWithFallback } from "@/lib/favicon"
import { FileText, Search } from "lucide-react"
import { DeadlineBadge } from "@/components/deadline-badge"

interface OpportunitiesTableProps {
  onSelectOpportunity: (opportunity: Opportunity) => void
}

export function OpportunitiesTable({ onSelectOpportunity }: OpportunitiesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filters */}
      <div className="space-y-3 sm:space-y-4">
        <Input
          type="search"
          placeholder="Search opportunities, providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs cursor-pointer"
          >
            All
          </Button>
          {allCategories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs cursor-pointer"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {opportunities !== undefined && opportunities.length > 0 && (
        <div className="text-xs sm:text-sm text-muted-foreground">
          {filteredOpportunities.length}{" "}
          {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"}
        </div>
      )}

      {/* Table - Responsive */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold text-foreground w-16">Logo</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold text-foreground flex-1 min-w-64">Title</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold text-foreground w-48">Tags</th>
                <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-semibold text-foreground w-32">Deadline</th>
                <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-semibold text-foreground w-28">Action</th>
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
                filteredOpportunities.map((opportunity) => (
                  <tr
                    key={opportunity._id}
                    className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => onSelectOpportunity(opportunity)}
                  >
                    <td className="px-3 sm:px-4 py-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {opportunity.logoUrl ? (
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
                        ) : (
                          <div className="w-full h-full bg-muted"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground line-clamp-1 text-sm">{opportunity.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{opportunity.description}</p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {normalizeTags(opportunity.categoryTags || []).slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {normalizeTags(opportunity.categoryTags || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{normalizeTags(opportunity.categoryTags || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {opportunity.deadline && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
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
                    <td className="px-3 sm:px-4 py-3 text-right">
                      <Button
                        size="sm"
                        className="text-xs cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(opportunity.applyUrl, "_blank")
                        }}
                      >
                        Apply
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-3">
          {opportunities === undefined ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-lg font-semibold text-foreground">
                  No opportunities yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  We're curating the best grants, bootcamps, and programs for students and developers. Check back soon for exciting opportunities!
                </p>
              </div>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-lg font-semibold text-foreground">
                  No opportunities match your search
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
              </div>
            </div>
          ) : (
            filteredOpportunities.map((opportunity) => (
              <div
                key={opportunity._id}
                className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onSelectOpportunity(opportunity)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {opportunity.logoUrl ? (
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
                    ) : (
                      <div className="w-full h-full bg-muted"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{opportunity.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{opportunity.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {normalizeTags(opportunity.categoryTags || []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {normalizeTags(opportunity.categoryTags || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{normalizeTags(opportunity.categoryTags || []).length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col gap-1.5">
                        {opportunity.deadline && (
                          <span className="text-xs text-muted-foreground">
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
                        className="text-xs cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(opportunity.applyUrl, "_blank")
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
