"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateOpportunityForm } from "./create-opportunity-form"

interface AddOpportunityDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddOpportunityDialog({ isOpen, onClose, onSuccess }: AddOpportunityDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Create New Opportunity</DialogTitle>
        </DialogHeader>
        <CreateOpportunityForm
          onSuccess={() => {
            onSuccess()
            onClose()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
