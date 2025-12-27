"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminHeader } from "@/components/admin/admin-header"
import { OpportunitiesManagement } from "@/components/admin/opportunities-management"
import { SubmissionsManagement } from "@/components/admin/submissions-management"
import { AddOpportunityDialog } from "@/components/admin/add-opportunity-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("opportunities")
  const [opportunitiesStatusFilter, setOpportunitiesStatusFilter] = useState<"all" | "active" | "inactive" | "archived">("all")

  // Get opportunities count based on current filter (matching OpportunitiesManagement query)
  const opportunities = useQuery(api.opportunities.list, {
    status: opportunitiesStatusFilter,
    includeArchived: opportunitiesStatusFilter === "archived",
  })

  const submissions = useQuery(api.submissions.list, {})
  const pendingSubmissionsCount = submissions?.filter((s) => s.status === "pending").length || 0

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminHeader onAddClick={() => setIsAddDialogOpen(true)} totalOpportunities={opportunities?.length || 0} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto">
            <TabsTrigger value="opportunities" className="cursor-pointer text-xs sm:text-sm">
              <span className="hidden sm:inline">Opportunities</span>
              <span className="sm:hidden">Opps</span>
              {opportunities && (
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-muted rounded-full">
                  {opportunities.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="submissions" className="cursor-pointer text-xs sm:text-sm">
              <span className="hidden sm:inline">Submissions</span>
              <span className="sm:hidden">Subs</span>
              {submissions && (
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-muted rounded-full">
                  {submissions.length}
                </span>
              )}
              {pendingSubmissionsCount !== undefined && pendingSubmissionsCount > 0 && (
                <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full font-semibold">
                  {pendingSubmissionsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="mt-0">
            <OpportunitiesManagement 
              key={refreshTrigger} 
              onRefresh={handleAddSuccess}
              onStatusFilterChange={setOpportunitiesStatusFilter}
            />
          </TabsContent>

          <TabsContent value="submissions" className="mt-0">
            <SubmissionsManagement onRefresh={handleRefresh} />
          </TabsContent>
        </Tabs>
      </div>

      <AddOpportunityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </main>
  )
}
