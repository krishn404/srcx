"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getFaviconUrl, getFaviconUrlSync } from "@/lib/favicon"
import { AlertCircle, Loader2 } from "lucide-react"

interface CreateOpportunityFormProps {
  onSuccess: () => void
}

export function CreateOpportunityForm({ onSuccess }: CreateOpportunityFormProps) {
  const { user } = useAuth()
  const createMutation = useMutation(api.opportunities.create)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState("")
  const [isFetchingLogo, setIsFetchingLogo] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    description: "",
    description_full: "",
    applyUrl: "",
    deadline: "",
    status: "active" as const,
    categoryTags: "",
    applicableGroups: "",
    regions: "",
    fundingTypes: "",
    eligibility: "",
  })

  // Auto-fetch favicon when applyUrl changes
  useEffect(() => {
    const fetchFavicon = async () => {
      if (formData.applyUrl && formData.applyUrl.startsWith("http")) {
        setIsFetchingLogo(true)
        try {
          // Set immediate sync version for instant feedback
          const syncUrl = getFaviconUrlSync(formData.applyUrl)
          if (syncUrl) setLogoUrl(syncUrl)
          
          // Then fetch the actual favicon (may be the same, but ensures it exists)
          const faviconUrl = await getFaviconUrl(formData.applyUrl)
          if (faviconUrl) {
            setLogoUrl(faviconUrl)
          }
        } catch (err) {
          console.error("Failed to fetch favicon:", err)
        } finally {
          setIsFetchingLogo(false)
        }
      } else if (!formData.applyUrl) {
        setLogoUrl("")
      }
    }

    // Debounce the favicon fetch
    const timeoutId = setTimeout(fetchFavicon, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.applyUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!formData.title || !formData.provider || !formData.applyUrl || !formData.deadline) {
        throw new Error("Please fill in all required fields")
      }

      if (!user) {
        throw new Error("Authentication required. Please log in.")
      }

      await createMutation({
        title: formData.title,
        provider: formData.provider,
        logoUrl: logoUrl || getFaviconUrlSync(formData.applyUrl) || `https://www.google.com/s2/favicons?domain=example.com&sz=64`,
        description: formData.description,
        description_full: formData.description_full,
        applyUrl: formData.applyUrl,
        deadline: new Date(formData.deadline).getTime(),
        status: formData.status,
        categoryTags: formData.categoryTags.split(",").map((t) => t.trim()),
        applicableGroups: formData.applicableGroups.split(",").map((t) => t.trim()),
        regions: formData.regions.split(",").map((t) => t.trim()),
        fundingTypes: formData.fundingTypes.split(",").map((t) => t.trim()),
        eligibility: formData.eligibility,
        createdBy: user.username,
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create opportunity")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex gap-3">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Title *</label>
          <Input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Y Combinator Startup School"
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Provider *</label>
          <Input
            required
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            placeholder="e.g., Y Combinator"
            className="mt-2"
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
            {!formData.applyUrl && (
              <p className="text-xs text-muted-foreground">
                Logo will be automatically fetched when you enter the Application URL above
              </p>
            )}
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Short Description *</label>
          <Input
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description shown in table"
            className="mt-2"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Full Description *</label>
          <Textarea
            required
            value={formData.description_full}
            onChange={(e) => setFormData({ ...formData, description_full: e.target.value })}
            placeholder="Detailed description for modal"
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Application URL *</label>
          <Input
            required
            type="url"
            value={formData.applyUrl}
            onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
            placeholder="https://example.com/apply"
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Deadline *</label>
          <Input
            required
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="mt-2"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Category Tags</label>
          <Input
            value={formData.categoryTags}
            onChange={(e) => setFormData({ ...formData, categoryTags: e.target.value })}
            placeholder="Bootcamp, Grant, Education (comma-separated)"
            className="mt-2"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Applicable Groups</label>
          <Input
            value={formData.applicableGroups}
            onChange={(e) => setFormData({ ...formData, applicableGroups: e.target.value })}
            placeholder="Students, Developers, Entrepreneurs (comma-separated)"
            className="mt-2"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Regions</label>
          <Input
            value={formData.regions}
            onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
            placeholder="North America, Europe, Asia (comma-separated)"
            className="mt-2"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Funding Types</label>
          <Input
            value={formData.fundingTypes}
            onChange={(e) => setFormData({ ...formData, fundingTypes: e.target.value })}
            placeholder="Grants, Credits, Equity (comma-separated)"
            className="mt-2"
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium text-foreground">Eligibility</label>
          <Textarea
            value={formData.eligibility}
            onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            placeholder="Who is eligible for this opportunity?"
            rows={2}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-border">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? "Creating..." : "Create Opportunity"}
        </Button>
      </div>
    </form>
  )
}
