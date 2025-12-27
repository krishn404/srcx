"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ExternalLink, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { useAuth } from "./auth-provider"

interface SubmissionsManagementProps {
  onRefresh?: () => void
}

export function SubmissionsManagement({ onRefresh }: SubmissionsManagementProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const submissions = useQuery(
    api.submissions.list,
    statusFilter === "all" ? {} : { status: statusFilter }
  )

  const updateStatusMutation = useMutation(api.submissions.updateStatus)
  const createOpportunityMutation = useMutation(api.opportunities.create)
  const deleteSubmissionsMutation = useMutation(api.submissions.deleteSubmissions)

  const handleStatusUpdate = async (id: Id<"submissions">, newStatus: "approved" | "rejected" | "pending") => {
    try {
      await updateStatusMutation({
        id,
        status: newStatus,
      })
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error("Failed to update submission status:", error)
      alert("Failed to update submission status")
    }
  }

  const handleApprove = async (submission: any) => {
    if (!user) {
      alert("Authentication required")
      return
    }

    try {
      // Create opportunity from submission
      const opportunityTypeToCategory = (type: string): string[] => {
        const mapping: Record<string, string[]> = {
          bootcamp: ["Bootcamp"],
          grant: ["Grant", "Funding"],
          fellowship: ["Fellowship"],
          funding: ["Funding"],
          credits: ["Credits"],
          program: ["Program"],
          scholarship: ["Scholarship"],
          other: ["Other"],
        }
        return mapping[type.toLowerCase()] || [type]
      }

      await createOpportunityMutation({
        title: submission.opportunityName,
        description: submission.description,
        description_full: submission.description,
        provider: submission.userName || "Unknown",
        logoUrl: "", // Default empty logo
        categoryTags: opportunityTypeToCategory(submission.opportunityType),
        applicableGroups: [],
        applyUrl: submission.link,
        deadline: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days from now
        status: "active",
        regions: [],
        fundingTypes: [],
        eligibility: "",
        createdBy: user.username,
      })

      // Update submission status to approved
      await handleStatusUpdate(submission._id, "approved")
      setIsViewDialogOpen(false)
    } catch (error) {
      console.error("Failed to approve and create opportunity:", error)
      alert("Failed to approve submission and create opportunity")
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (filteredSubmissions) {
      if (selectedIds.size === filteredSubmissions.length) {
        setSelectedIds(new Set())
      } else {
        setSelectedIds(new Set(filteredSubmissions.map((s) => s._id)))
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} submission(s)? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteSubmissionsMutation({
        ids: Array.from(selectedIds) as Id<"submissions">[],
      })
      setSelectedIds(new Set())
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error("Failed to delete submissions:", error)
      alert("Failed to delete submissions")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredSubmissions = submissions?.filter((submission) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      submission.opportunityName.toLowerCase().includes(query) ||
      submission.opportunityType.toLowerCase().includes(query) ||
      submission.description.toLowerCase().includes(query) ||
      submission.userName?.toLowerCase().includes(query) ||
      submission.userTwitter?.toLowerCase().includes(query)
    )
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search by opportunity name, type, description, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-4"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((status, index) => (
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
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                className="text-xs capitalize cursor-pointer"
              >
                {status === "pending" && statusFilter === "pending" && <Clock className="w-3.5 h-3.5 mr-1" />}
                {status}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Results Count and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredSubmissions
            ? `${filteredSubmissions.length} submission${filteredSubmissions.length !== 1 ? "s" : ""}`
            : "Loading..."}
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
            </Button>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 hover:bg-muted/50 transition-colors">
                <th className="text-left px-4 py-3 font-semibold text-foreground w-12">
                  <Checkbox
                    checked={filteredSubmissions ? selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0 : false}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground min-w-48">Opportunity</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground min-w-32">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground min-w-40">Submitted By</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground w-32">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground w-40">Submitted</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!filteredSubmissions ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Loading submissions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <p>No submissions found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.map((submission, index) => (
                    <motion.tr
                      key={submission._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="border-b border-border hover:bg-muted/20 transition-all duration-200 cursor-pointer"
                      whileHover={{ backgroundColor: "rgba(var(--muted), 0.2)", x: 2 }}
                      onClick={(e) => {
                        // Don't open dialog if clicking on checkbox or action buttons
                        const target = e.target as HTMLElement
                        if (
                          target.closest('input[type="checkbox"]') ||
                          target.closest('button') ||
                          target.closest('a')
                        ) {
                          return
                        }
                        setSelectedSubmission(submission)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(submission._id)}
                          onCheckedChange={() => handleToggleSelect(submission._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground text-sm">{submission.opportunityName}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{submission.description}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {submission.opportunityType}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {submission.userName && (
                            <p className="text-xs text-foreground font-medium">{submission.userName}</p>
                          )}
                          {submission.userTwitter && (
                            <p className="text-xs text-muted-foreground">{submission.userTwitter}</p>
                          )}
                          {!submission.userName && !submission.userTwitter && (
                            <p className="text-xs text-muted-foreground italic">Anonymous</p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(submission.status)} className="text-xs capitalize gap-1">
                          {getStatusIcon(submission.status)}
                          {submission.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(submission.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {submission.status === "pending" && (
                            <>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(submission)}
                                  className="text-xs gap-1 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer"
                                  title="Approve & Create Opportunity"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(submission._id, "rejected")}
                                  className="text-xs gap-1 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                                  title="Reject"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </motion.div>
                            </>
                          )}
                          {submission.status !== "pending" && (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(submission._id, "pending")}
                                className="text-xs gap-1 cursor-pointer"
                                title="Reset to Pending"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </Button>
                            </motion.div>
                          )}
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

      {/* View Submission Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Submission Details</DialogTitle>
            <DialogDescription>Review the full submission details</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6 mt-4">
              {/* Opportunity Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Opportunity Name</h3>
                  <p className="text-base font-medium text-foreground">{selectedSubmission.opportunityName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Type</h3>
                  <Badge variant="outline" className="text-sm capitalize">
                    {selectedSubmission.opportunityType}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedSubmission.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Link</h3>
                  <a
                    href={selectedSubmission.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {selectedSubmission.link}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* User Info */}
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Submitted By</h3>
                  {selectedSubmission.userName ? (
                    <p className="text-sm text-foreground">{selectedSubmission.userName}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Anonymous</p>
                  )}
                </div>

                {selectedSubmission.userTwitter && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Twitter / linkedin</h3>
                    <p className="text-sm text-foreground">{selectedSubmission.userTwitter}</p>
                  </div>
                )}
              </div>

              {/* Status & Dates */}
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Status</h3>
                  <Badge
                    variant={getStatusBadgeVariant(selectedSubmission.status)}
                    className="text-sm capitalize gap-1"
                  >
                    {getStatusIcon(selectedSubmission.status)}
                    {selectedSubmission.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Submitted</h3>
                  <p className="text-sm text-foreground">
                    {new Date(selectedSubmission.createdAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {selectedSubmission.reviewedAt && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Reviewed</h3>
                    <p className="text-sm text-foreground">
                      {new Date(selectedSubmission.reviewedAt).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex gap-2">
                {selectedSubmission.status === "pending" && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(selectedSubmission)
                      }}
                      className="flex-1 gap-2 cursor-pointer"
                      variant="default"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Create Opportunity
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedSubmission._id, "rejected")
                        setIsViewDialogOpen(false)
                      }}
                      className="flex-1 gap-2 cursor-pointer"
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedSubmission.status !== "pending" && (
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedSubmission._id, "pending")
                      setIsViewDialogOpen(false)
                    }}
                    className="flex-1 gap-2 cursor-pointer"
                    variant="outline"
                  >
                    <Clock className="w-4 h-4" />
                    Reset to Pending
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

