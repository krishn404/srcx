import type React from "react"
import { AdminRedirect } from "@/components/admin/admin-redirect"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminRedirect>{children}</AdminRedirect>
}
