"use client"

import { Button } from "@/components/ui/button"
import { AdminLogoutButton } from "./admin-logout-button"
import { Plus } from "lucide-react"

interface AdminHeaderProps {
  onAddClick: () => void
  onCreateClick?: () => void
  totalOpportunities?: number
}

export function AdminHeader({ onAddClick, onCreateClick, totalOpportunities }: AdminHeaderProps) {
  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 md:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-foreground">Opportunities</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage and curate {totalOpportunities || 0} opportunities</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button onClick={onCreateClick || onAddClick} className="gap-2 flex-1 sm:flex-initial" size="sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Opportunity</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <AdminLogoutButton />
        </div>
      </div>
    </header>
  )
}
