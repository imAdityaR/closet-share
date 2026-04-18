import { fetchAdminInventory, verifyAdminSession } from "@/lib/admin-actions"
import { redirect } from "next/navigation"
import { AdminInventoryClient } from "./client"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) redirect("/admin/login")

  const inventory = await fetchAdminInventory()

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 font-sans">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Inventory Manager</h1>
        <p className="text-muted-foreground">Add new products to your catalog and manage stock.</p>
      </div>

      <AdminInventoryClient initialInventory={inventory} />
    </div>
  )
}