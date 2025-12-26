"use client"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "./auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"

interface DeleteConfirmDialogProps {
  opportunity: any
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({ opportunity, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const archiveMutation = useMutation(api.opportunities.archive)

  const handleConfirm = async () => {
    if (!user) {
      setError("Authentication required")
      return
    }
    setIsDeleting(true)
    setError(null)
    try {
      await archiveMutation({
        id: opportunity._id,
        adminId: user.username,
        adminEmail: user.username,
      })
      onConfirm()
    } catch (err) {
      setError("Failed to archive opportunity")
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <DialogTitle>Archive Opportunity</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-foreground font-medium">{opportunity.title}</p>
          <p className="text-sm text-muted-foreground">by {opportunity.provider}</p>
          <p className="text-sm text-muted-foreground">
            This opportunity will be archived and can be restored later. It will be hidden from the public listing.
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Archiving..." : "Archive"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
