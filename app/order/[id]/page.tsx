import { notFound, redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { OrderDetailsClient } from "@/components/order-details-client"
interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailsPage({ params }: Props) {
  const user = await currentUser()
  if (!user) redirect("/")

  const { id } = await params
  // Fetch the specific order and its items
  const dbOrder = await sql`
    SELECT 
      o.id, o.created_at, o.status, o.total_paid, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.productdisplay,
            'price', p.rentalpriceperday,
            'image', p.imageurl
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = ${id} AND o.user_id = ${user.id}
    GROUP BY o.id
  `

  if (dbOrder.length === 0) return notFound()

  const order = dbOrder[0]
  const startDate = new Date(order.created_at)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 3)

  return (
    <OrderDetailsClient 
      order={order} 
      startDate={startDate.toLocaleDateString()} 
      endDate={endDate.toLocaleDateString()} 
    />
  )
}