"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Image from "next/image"
import type { Opportunity } from "@/types/opportunity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

      const matchesCategory = !selectedCategory || opp.categoryTags.includes(selectedCategory)

      return matchesSearch && matchesCategory
    })
  }, [opportunities, searchQuery, selectedCategory])

  // Get unique categories for filter
  const allCategories = useMemo(() => {
    if (!opportunities) return []
    return Array.from(new Set(opportunities.flatMap((opp) => opp.categoryTags))).sort()
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
      <div className="text-xs sm:text-sm text-muted-foreground">
        {filteredOpportunities.length}{" "}
        {filteredOpportunities.length > 1 ? "opportunities" : "opportunity"}
      </div>

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
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No opportunities match your search
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
                            src={opportunity.logoUrl || "/placeholder.svg"}
                            alt={opportunity.provider}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=48&width=48"
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
                        {opportunity.categoryTags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {opportunity.categoryTags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{opportunity.categoryTags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No opportunities match your search</div>
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
                        src={opportunity.logoUrl || "/placeholder.svg"}
                        alt={opportunity.provider}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=48&width=48"
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
                      {opportunity.categoryTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {opportunity.categoryTags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{opportunity.categoryTags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
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
