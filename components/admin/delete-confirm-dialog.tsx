"use client"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "./auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Archive } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DeleteConfirmDialogProps {
  opportunity: any
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({ opportunity, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<"archive" | "delete">("archive")
  const archiveMutation = useMutation(api.opportunities.archive)
  const hardDeleteMutation = useMutation(api.opportunities.hardDelete)

  const handleConfirm = async () => {
    if (!user) {
      setError("Authentication required")
      return
    }
    setIsDeleting(true)
    setError(null)
    try {
      if (deleteType === "archive") {
        await archiveMutation({
          id: opportunity._id,
          adminId: user.username,
          adminEmail: user.username,
        })
      } else {
        await hardDeleteMutation({
          id: opportunity._id,
          adminId: user.username,
          adminEmail: user.username,
        })
      }
      onConfirm()
    } catch (err) {
      setError(deleteType === "archive" ? "Failed to archive opportunity" : "Failed to delete opportunity")
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md lg:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <DialogTitle>Remove Opportunity</DialogTitle>
              <DialogDescription>Choose how you want to remove this opportunity</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-foreground font-medium">{opportunity.title}</p>
            <p className="text-sm text-muted-foreground">by {opportunity.provider}</p>
          </div>

          <Tabs value={deleteType} onValueChange={(value) => setDeleteType(value as "archive" | "delete")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="archive" className="cursor-pointer">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </TabsTrigger>
              <TabsTrigger value="delete" className="cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </TabsTrigger>
            </TabsList>
            <TabsContent value="archive" className="mt-4">
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground">Archive (Recommended)</p>
                <p className="text-xs text-muted-foreground">
                  The opportunity will be archived and hidden from public listings. You can restore it later from the
                  archived section. This is reversible.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="delete" className="mt-4">
              <div className="space-y-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive">Permanent Delete</p>
                <p className="text-xs text-muted-foreground">
                  The opportunity will be permanently deleted from the database. This action cannot be undone. All data
                  will be lost.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant={deleteType === "delete" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {deleteType === "archive" ? (
              <>
                <Archive className="w-4 h-4" />
                {isDeleting ? "Archiving..." : "Archive"}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
