"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "./auth-provider"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditOpportunityDialog } from "./edit-opportunity-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { Pencil, Copy, Archive, MoreVertical, AlertCircle, ArchiveRestore } from "lucide-react"

interface OpportunitiesManagementProps {
  onRefresh: () => void
  onStatusFilterChange?: (filter: "all" | "active" | "inactive" | "archived") => void
}

export function OpportunitiesManagement({ onRefresh, onStatusFilterChange }: OpportunitiesManagementProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "archived">("all")
  
  // Notify parent of status filter changes
  const handleStatusFilterChange = (filter: typeof statusFilter) => {
    setStatusFilter(filter)
    if (onStatusFilterChange) {
      onStatusFilterChange(filter)
    }
  }
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const opportunities = useQuery(api.opportunities.list, {
    status: statusFilter,
    search: searchQuery,
    includeArchived: statusFilter === "archived",
  })

  const duplicateMutation = useMutation(api.opportunities.duplicate)
  const archiveMutation = useMutation(api.opportunities.archive)
  const unarchiveMutation = useMutation(api.opportunities.unarchive)

  const handleDuplicate = async (opportunity: any) => {
    if (!user) {
      setError("Authentication required")
      return
    }
    try {
      await duplicateMutation({
        id: opportunity._id,
        adminId: user.username,
        adminEmail: user.username,
        status: "inactive",
        titleSuffix: " (Copy)",
      })
      onRefresh()
    } catch (err) {
      setError("Failed to duplicate opportunity")
    }
  }

  const handleArchive = async (opportunity: any) => {
    if (!user) {
      setError("Authentication required")
      return
    }
    try {
      await archiveMutation({
        id: opportunity._id,
        adminId: user.username,
        adminEmail: user.username,
      })
      onRefresh()
    } catch (err) {
      setError("Failed to archive opportunity")
    }
  }

  const handleUnarchive = async (opportunity: any) => {
    if (!user) {
      setError("Authentication required")
      return
    }
    try {
      await unarchiveMutation({
        id: opportunity._id,
        adminId: user.username,
        adminEmail: user.username,
        status: "inactive",
      })
      onRefresh()
    } catch (err) {
      setError("Failed to unarchive opportunity")
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-destructive/10 border border-destructive/20 rounded-md p-4 flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
            <motion.button
              onClick={() => setError(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-destructive/60 hover:text-destructive text-sm cursor-pointer"
            >
              Dismiss
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search by title, provider, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-4"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "active", "inactive", "archived"].map((status, index) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange(status as typeof statusFilter)}
                className="text-xs capitalize cursor-pointer"
              >
                {status}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {opportunities ? `${opportunities.length} opportunity${opportunities.length !== 1 ? "ies" : ""}` : "Loading..."}
      </div>

      {/* Management Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 hover:bg-muted/50 transition-colors">
                <th className="text-left px-4 py-3 font-semibold text-foreground w-12">Logo</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground flex-1 min-w-64">Details</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground w-32">Deadline</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground w-20">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground w-28">Verified</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!opportunities ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Loading opportunities...</p>
                    </div>
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <p>No opportunities found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {opportunities.map((opportunity, index) => (
                    <motion.tr
                      key={opportunity._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="border-b border-border hover:bg-muted/20 transition-all duration-200 cursor-pointer"
                      whileHover={{ backgroundColor: "rgba(var(--muted), 0.2)", x: 2 }}
                    >
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/50">
                        {opportunity.logoUrl ? (
                          <Image
                            src={opportunity.logoUrl || "/placeholder.svg"}
                            alt={opportunity.provider}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                            }}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">−</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm">{opportunity.title}</p>
                        <p className="text-xs text-muted-foreground">{opportunity.provider}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{opportunity.description}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          opportunity.status === "active"
                            ? "default"
                            : opportunity.status === "archived"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs capitalize"
                      >
                        {opportunity.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {opportunity.verifiedAt
                        ? new Date(opportunity.verifiedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "−"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {opportunity.archivedAt ? (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnarchive(opportunity)}
                              className="text-xs gap-1 cursor-pointer text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                              title="Unarchive"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            </Button>
                          </motion.div>
                        ) : (
                          <>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingOpportunity(opportunity)}
                                className="text-xs gap-1 cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(opportunity)}
                                className="text-xs gap-1 cursor-pointer"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(opportunity)}
                                className="text-xs gap-1 cursor-pointer"
                                title="Archive"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </Button>
                            </motion.div>
                          </>
                        )}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(opportunity)}
                            className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/20 dark:hover:bg-destructive/30 cursor-pointer"
                            title="Delete"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </motion.div>
                      </div>
                    </td>
                  </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingOpportunity && (
        <EditOpportunityDialog
          opportunity={editingOpportunity}
          onClose={() => setEditingOpportunity(null)}
          onSuccess={() => {
            setEditingOpportunity(null)
            onRefresh()
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmDialog
          opportunity={deleteTarget}
          onConfirm={() => {
            setDeleteTarget(null)
            onRefresh()
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
