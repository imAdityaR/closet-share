import { fetchAdminComplaints, verifyAdminSession } from "@/lib/admin-actions"
import { redirect } from "next/navigation"
import { AdminHelpdeskClient } from "./client"

export const dynamic = "force-dynamic"

export default async function AdminHelpdeskPage() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) redirect("/admin/login")

  const complaints = await fetchAdminComplaints()

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 font-sans">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Helpdesk Command Center</h1>
        <p className="text-muted-foreground">Manage and resolve customer complaints.</p>
      </div>

      <AdminHelpdeskClient initialComplaints={complaints} />
    </div>
  )
}