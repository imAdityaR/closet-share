export const dynamic = "force-dynamic";
import { verifyAdminSession } from "@/lib/admin-actions" // Your custom auth
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { AdminOrdersClient } from "@/components/admin-orders-client"

export default async function AdminOrdersPage() {
  // Use custom admin auth instead of Clerk
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) redirect("/admin/login")

  const dbOrders = await sql`
    SELECT 
      o.id, o.created_at, o.status, o.total_paid, 
      o.delivery_type, o.rental_start, o.rental_end,
      u.email as user_email, a.full_name, a.phone_number,
      COALESCE(
        json_agg(
          json_build_object('id', p.id, 'name', p.productdisplay)
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) as items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN addresses a ON o.address_id = a.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id, u.email, a.full_name, a.phone_number
    ORDER BY o.created_at DESC
  `

  const allOrders = dbOrders.map((o) => ({
    id: o.id,
    userEmail: o.user_email || "Unknown User",
    customerName: o.full_name || "N/A",
    phone: o.phone_number || "N/A",
    totalPaid: Number(o.total_paid || 0),
    status: o.status || "Active",
    deliveryType: o.delivery_type || "Pre-book",
    rentalStart: o.rental_start ? new Date(o.rental_start).toISOString().split('T')[0] : "",
    rentalEnd: o.rental_end ? new Date(o.rental_end).toISOString().split('T')[0] : "",
    datePlaced: new Date(o.created_at).toLocaleDateString(),
    date: new Date(o.created_at).toLocaleDateString(),
    items: o.items || []
  }))

  return <AdminOrdersClient initialOrders={allOrders} />
}