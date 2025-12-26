"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getFaviconUrl, getFaviconUrlSync } from "@/lib/favicon"
import { AlertCircle, Loader2 } from "lucide-react"

interface EditOpportunityDialogProps {
  opportunity: any
  onClose: () => void
  onSuccess: () => void
}

export function EditOpportunityDialog({ opportunity, onClose, onSuccess }: EditOpportunityDialogProps) {
  const updateMutation = useMutation(api.opportunities.update)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState(opportunity.logoUrl)
  const [isFetchingLogo, setIsFetchingLogo] = useState(false)

  const [formData, setFormData] = useState({
    title: opportunity.title,
    provider: opportunity.provider,
    description: opportunity.description,
    description_full: opportunity.description_full,
    applyUrl: opportunity.applyUrl,
    deadline: new Date(opportunity.deadline).toISOString().split("T")[0],
    status: opportunity.status,
    categoryTags: opportunity.categoryTags?.join(", ") || "",
    applicableGroups: opportunity.applicableGroups?.join(", ") || "",
    regions: opportunity.regions?.join(", ") || "",
    fundingTypes: opportunity.fundingTypes?.join(", ") || "",
    eligibility: opportunity.eligibility || "",
  })

  // Auto-fetch favicon when applyUrl changes
  useEffect(() => {
    const fetchFavicon = async () => {
      if (formData.applyUrl && formData.applyUrl.startsWith("http") && formData.applyUrl !== opportunity.applyUrl) {
        setIsFetchingLogo(true)
        try {
          // Set immediate sync version for instant feedback
          const syncUrl = getFaviconUrlSync(formData.applyUrl)
          if (syncUrl) setLogoUrl(syncUrl)
          
          // Then fetch the actual favicon
          const faviconUrl = await getFaviconUrl(formData.applyUrl)
          if (faviconUrl) {
            setLogoUrl(faviconUrl)
          }
        } catch (err) {
          console.error("Failed to fetch favicon:", err)
        } finally {
          setIsFetchingLogo(false)
        }
      }
    }

    // Debounce the favicon fetch
    const timeoutId = setTimeout(fetchFavicon, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.applyUrl, opportunity.applyUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await updateMutation({
        id: opportunity._id,
        title: formData.title,
        provider: formData.provider,
        logoUrl: logoUrl,
        description: formData.description,
        description_full: formData.description_full,
        applyUrl: formData.applyUrl,
        deadline: new Date(formData.deadline).getTime(),
        status: formData.status as "active" | "inactive" | "archived",
        categoryTags: formData.categoryTags.split(",").map((t) => t.trim()),
        applicableGroups: formData.applicableGroups.split(",").map((t) => t.trim()),
        regions: formData.regions.split(",").map((t) => t.trim()),
        fundingTypes: formData.fundingTypes.split(",").map((t) => t.trim()),
        eligibility: formData.eligibility,
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update opportunity")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Edit Opportunity</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex gap-3">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title *</label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Provider *</label>
              <input
                required
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Short Description *</label>
              <input
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Full Description *</label>
              <textarea
                required
                value={formData.description_full}
                onChange={(e) => setFormData({ ...formData, description_full: e.target.value })}
                rows={3}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Application URL *</label>
              <input
                required
                type="url"
                value={formData.applyUrl}
                onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Logo (Auto-fetched from URL)</label>
              <div className="mt-2 space-y-2">
                {logoUrl && (
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                    <img 
                      src={logoUrl} 
                      alt="Favicon" 
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{logoUrl}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Automatically fetched from the application URL
                      </p>
                    </div>
                    {isFetchingLogo && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                )}
                {!logoUrl && formData.applyUrl && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching favicon...</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Deadline *</label>
              <input
                required
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Category Tags</label>
              <input
                value={formData.categoryTags}
                onChange={(e) => setFormData({ ...formData, categoryTags: e.target.value })}
                placeholder="Bootcamp, Grant, Education"
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Applicable Groups</label>
              <input
                value={formData.applicableGroups}
                onChange={(e) => setFormData({ ...formData, applicableGroups: e.target.value })}
                placeholder="Students, Developers, Entrepreneurs"
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Regions</label>
              <input
                value={formData.regions}
                onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
                placeholder="North America, Europe, Asia"
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Funding Types</label>
              <input
                value={formData.fundingTypes}
                onChange={(e) => setFormData({ ...formData, fundingTypes: e.target.value })}
                placeholder="Grants, Credits, Equity"
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-foreground">Eligibility</label>
              <textarea
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="Who is eligible?"
                rows={2}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
