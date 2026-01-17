"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "./auth"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multiselect"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditOpportunityDialog } from "./edit-dialog"
import { DeleteConfirmDialog } from "./delete-dialog"
import { Pencil, Copy, Archive, MoreVertical, AlertCircle, ArchiveRestore, GripVertical, Search } from "lucide-react"
import { getFaviconUrlWithFallback } from "@/lib/favicon"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface OpportunitiesManagementProps {
  onRefresh: () => void
  onStatusFilterChange?: (filter: "all" | "active" | "inactive" | "archived") => void
}

// Sortable Row Component
function SortableRow({ 
  opportunity, 
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onUnarchive,
  isOver,
  dropPosition: rowDropPosition,
}: {
  opportunity: any
  index: number
  onEdit: (opp: any) => void
  onDelete: (opp: any) => void
  onDuplicate: (opp: any) => void
  onArchive: (opp: any) => void
  onUnarchive: (opp: any) => void
  isOver?: boolean
  dropPosition?: 'above' | 'below' | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <>
      {/* Drop indicator above */}
      {isOver && rowDropPosition === 'above' && (
        <tr>
          <td colSpan={7} className="px-4 py-0 h-0 relative">
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="h-0.5 bg-primary rounded-full mx-4 shadow-[0_0_8px_hsl(var(--primary))]"
            />
          </td>
        </tr>
      )}
      <motion.tr
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isDragging ? 0.3 : (isOver ? 0.7 : 1), y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        className={`border-b border-border hover:bg-muted/20 transition-all duration-200 ${isDragging ? 'z-50 shadow-lg' : ''} ${isOver ? 'bg-primary/5' : ''}`}
      >
      <td className="px-4 py-3">
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none select-none"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-5 h-5" />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
          {opportunity.logoUrl ? (
            <Image
              src={opportunity.logoUrl}
              alt={opportunity.provider}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={async (e) => {
                const fallback = await getFaviconUrlWithFallback(opportunity.applyUrl)
                e.currentTarget.src = fallback
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
        {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) : "—"}
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
          className="text-xs"
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {opportunity.archivedAt ? (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onUnarchive(opportunity)
                }}
                className="text-xs gap-1 cursor-pointer text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/40"
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(opportunity)
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(opportunity)
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(opportunity)
                  }}
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
              onClick={(e) => {
                e.stopPropagation()
                onDelete(opportunity)
              }}
              className="text-xs gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/20 dark:hover:bg-destructive/30 cursor-pointer"
              title="Delete"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        </div>
      </td>
    </motion.tr>
    {/* Drop indicator below */}
    {isOver && rowDropPosition === 'below' && (
      <tr>
        <td colSpan={7} className="px-4 py-0 h-0 relative">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="h-0.5 bg-primary rounded-full mx-4"
            style={{ boxShadow: '0 0 8px rgba(var(--primary), 0.5)' }}
          />
        </td>
      </tr>
    )}
    </>
  )
}

type SortOption = "recent" | "updated" | "ongoing" | "deadline" | "default"

export function OpportunitiesManagement({ onRefresh, onStatusFilterChange }: OpportunitiesManagementProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>(["all"])
  const [sortBy, setSortBy] = useState<SortOption>("default")
  
  // Notify parent of status filter changes
  const handleStatusFilterChange = (filters: string[]) => {
    // If "all" is selected with other filters, remove "all"
    if (filters.includes("all") && filters.length > 1) {
      filters = filters.filter(f => f !== "all")
    }
    // If no filters selected, default to "all"
    if (filters.length === 0) {
      filters = ["all"]
    }
    
    setStatusFilters(filters)
    
    // Notify parent for backward compatibility
    if (onStatusFilterChange) {
      if (filters.includes("all")) {
        onStatusFilterChange("all")
      } else if (filters.length === 1) {
        onStatusFilterChange(filters[0] as any)
      } else {
        onStatusFilterChange("all")
      }
    }
  }
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null)

  // Determine query parameters - use "all" if multiple statuses or "all" is selected
  const queryStatus = statusFilters.includes("all") || statusFilters.length > 1 
    ? "all" 
    : (statusFilters[0] as "active" | "inactive" | "archived" | "all")
  
  const allOpportunities = useQuery(api.opportunities.list, {
    status: queryStatus,
    search: searchQuery,
    includeArchived: statusFilters.includes("archived") || statusFilters.includes("all"),
  })

  // Client-side filtering and sorting
  const opportunities = useMemo(() => {
    if (!allOpportunities) return undefined

    let filtered = [...allOpportunities]

    // Filter by status (client-side for multi-select)
    if (!statusFilters.includes("all") && statusFilters.length > 0) {
      filtered = filtered.filter(opp => {
        const isArchived = !!opp.archivedAt
        
        // Check if matches any of the selected statuses
        if (statusFilters.includes("archived") && isArchived) return true
        if (statusFilters.includes("active") && opp.status === "active" && !isArchived) return true
        if (statusFilters.includes("inactive") && opp.status === "inactive" && !isArchived) return true
        
        return false
      })
    }
    // If "all" is selected, don't filter (show all based on query)

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          // Recently added - newest first
          return b.createdAt - a.createdAt
        
        case "updated":
          // Recently updated - most recent first
          return b.updatedAt - a.updatedAt
        
        case "ongoing":
          // Ongoing opportunities (active with no deadline or deadline in future)
          const aOngoing = a.status === "active" && (!a.deadline || a.deadline > Date.now())
          const bOngoing = b.status === "active" && (!b.deadline || b.deadline > Date.now())
          if (aOngoing && !bOngoing) return -1
          if (!aOngoing && bOngoing) return 1
          // Within ongoing, sort by deadline (nearest first)
          if (aOngoing && bOngoing) {
            if (!a.deadline && !b.deadline) return 0
            if (!a.deadline) return 1
            if (!b.deadline) return -1
            return a.deadline - b.deadline
          }
          // Otherwise maintain default order
          return 0
        
        case "deadline":
          // Near deadline - nearest first
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return a.deadline - b.deadline
        
        case "default":
        default:
          // Default: sortOrder first, then deadline
          if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
            return a.sortOrder - b.sortOrder
          }
          if (a.sortOrder !== undefined) return -1
          if (b.sortOrder !== undefined) return 1
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return a.deadline - b.deadline
      }
    })

    return filtered
  }, [allOpportunities, statusFilters, sortBy])

  const duplicateMutation = useMutation(api.opportunities.duplicate)
  const archiveMutation = useMutation(api.opportunities.archive)
  const unarchiveMutation = useMutation(api.opportunities.unarchive)
  const reorderMutation = useMutation(api.opportunities.reorder)

  // Drag and drop sensors - with activation distance to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setOverId(null)
    setDropPosition(null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id || !opportunities) {
      setOverId(null)
      setDropPosition(null)
      return
    }

    const activeIndex = opportunities.findIndex((opp) => opp._id === active.id)
    const overIndex = opportunities.findIndex((opp) => opp._id === over.id)

    if (activeIndex === -1 || overIndex === -1) {
      setOverId(null)
      setDropPosition(null)
      return
    }

    // Determine drop position based on relative positions
    // If dragging down, show indicator below; if dragging up, show above
    const direction = activeIndex < overIndex ? 'below' : 'above'
    
    setOverId(over.id as string)
    setDropPosition(direction)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)
    setDropPosition(null)

    if (!over || active.id === over.id || !opportunities || !user) return

    const oldIndex = opportunities.findIndex((opp) => opp._id === active.id)
    const newIndex = opportunities.findIndex((opp) => opp._id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    if (oldIndex !== newIndex) {
      const reorderedItems = arrayMove(opportunities, oldIndex, newIndex)
      
      // Update sortOrder for all items - start from 0
      const itemsToUpdate = reorderedItems.map((opp, index) => ({
        id: opp._id,
        sortOrder: index,
      }))

      try {
        await reorderMutation({
          items: itemsToUpdate,
          adminId: user.username,
          adminEmail: user.username,
        })
        // Don't call onRefresh immediately - let Convex handle the update
        // The query will automatically refetch with new sortOrder
      } catch (err) {
        console.error("Reorder error:", err)
        setError("Failed to reorder opportunities")
        // Refresh to get back to original state
        onRefresh()
      }
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
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="Search by title, provider, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <MultiSelect
              options={["all", "active", "inactive", "archived"]}
              selected={statusFilters}
              onChange={handleStatusFilterChange}
              placeholder="Filter by status..."
              className="min-w-[180px]"
            />
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-10 min-w-[200px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Manual Order)</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="deadline">Near Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {opportunities ? `${opportunities.length} opportunity${opportunities.length !== 1 ? "ies" : ""}` : "Loading..."}
      </div>

      {/* Management Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 hover:bg-muted/50 transition-colors">
                  <th className="text-left px-4 py-3 font-semibold text-foreground w-12"></th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground w-12">Logo</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground flex-1 min-w-64">Details</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground w-32">Deadline</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground w-20">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground w-28">Verified</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext items={opportunities?.map((opp) => opp._id) || []} strategy={rectSortingStrategy}>
                  {!opportunities ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Loading opportunities...</p>
                        </div>
                      </td>
                    </tr>
                  ) : opportunities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        <div className="space-y-2">
                          <p>No opportunities found</p>
                          <p className="text-xs">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {opportunities.map((opportunity, index) => (
                        <SortableRow
                          key={opportunity._id}
                          opportunity={opportunity}
                          index={index}
                          onEdit={setEditingOpportunity}
                          onDelete={setDeleteTarget}
                          onDuplicate={handleDuplicate}
                          onArchive={handleArchive}
                          onUnarchive={handleUnarchive}
                          isOver={overId === opportunity._id}
                          dropPosition={overId === opportunity._id ? dropPosition : null}
                        />
                      ))}
                      {/* Drop indicator at the bottom when dragging over last item */}
                      {activeId && overId && opportunities.length > 0 && 
                       overId === opportunities[opportunities.length - 1]._id && 
                       dropPosition === 'below' && (
                        <tr>
                          <td colSpan={7} className="px-4 py-0 h-0 relative">
                            <motion.div
                              initial={{ opacity: 0, scaleX: 0 }}
                              animate={{ opacity: 1, scaleX: 1 }}
                              className="h-0.5 bg-primary rounded-full mx-4"
                              style={{ boxShadow: '0 0 8px rgba(var(--primary), 0.5)' }}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </SortableContext>
              </tbody>
            </table>
            <DragOverlay>
              {activeId && opportunities ? (() => {
                const activeOpportunity = opportunities.find(opp => opp._id === activeId)
                if (!activeOpportunity) return null
                
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1.02, rotate: 2 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm bg-card border-2 border-primary shadow-2xl rounded-lg overflow-hidden cursor-grabbing"
                    style={{ 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                      width: '600px',
                      maxWidth: '90vw',
                    }}
                  >
                    <table className="w-full">
                      <tbody>
                        <tr className="bg-muted/30">
                          <td className="px-4 py-3 w-12">
                            <GripVertical className="w-5 h-5 text-primary" />
                          </td>
                          <td className="px-4 py-3 w-12">
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                              {activeOpportunity.logoUrl ? (
                                <Image
                                  src={activeOpportunity.logoUrl}
                                  alt={activeOpportunity.provider}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  onError={async (e) => {
                                    const fallback = await getFaviconUrlWithFallback(activeOpportunity.applyUrl)
                                    e.currentTarget.src = fallback
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-semibold text-muted-foreground">−</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground text-sm">{activeOpportunity.title}</p>
                              <p className="text-xs text-muted-foreground">{activeOpportunity.provider}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{activeOpportunity.description}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {activeOpportunity.deadline ? new Date(activeOpportunity.deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                activeOpportunity.status === "active"
                                  ? "default"
                                  : activeOpportunity.status === "archived"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {activeOpportunity.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {activeOpportunity.verifiedAt
                              ? new Date(activeOpportunity.verifiedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "−"}
                          </td>
                          <td className="px-4 py-3 text-right w-40">
                            <div className="flex items-center justify-end gap-1">
                              <GripVertical className="w-3.5 h-3.5 text-primary/50" />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </motion.div>
                )
              })() : null}
            </DragOverlay>
          </DndContext>
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
