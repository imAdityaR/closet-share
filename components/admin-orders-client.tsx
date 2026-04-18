"use client"

import { useState, useTransition } from "react"
import Link from "next/link" // <--- Added Link import
import { updateOrderStatus } from "@/lib/actions"
import { Package, Clock, Calendar, ChevronDown, RefreshCw, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminOrder {
  id: number
  userEmail: string
  customerName: string
  phone: string
  totalPaid: number
  status: string
  deliveryType: string
  rentalStart: string
  rentalEnd: string
  datePlaced: string
  items: { id: number; name: string }[]
}

const STATUS_OPTIONS = ["Processing", "Active", "Returned", "Cancelled"]

export function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Split orders into categories
  const urgentOrders = orders.filter(o => o.deliveryType === "Now")
  const prebookedOrders = orders.filter(o => o.deliveryType === "Pre-book")
    .sort((a, b) => new Date(a.rentalStart).getTime() - new Date(b.rentalStart).getTime())

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setUpdatingId(orderId)

    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus)
      } catch (error) {
        alert("Failed to update status.")
        setOrders(initialOrders)
      } finally {
        setUpdatingId(null)
      }
    })
  }

  const OrderTable = ({ data, isUrgent }: { data: AdminOrder[], isUrgent: boolean }) => (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-10">
      <div className={cn("p-4 border-b flex items-center gap-2", isUrgent ? "bg-red-50/50 border-red-100 text-red-700" : "bg-muted/50 border-border text-foreground")}>
        {isUrgent ? <AlertCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
        <h2 className="font-semibold">{isUrgent ? "Urgent (Instant Delivery)" : "Pre-Booked Orders"}</h2>
        <span className="ml-auto text-sm font-medium">{data.length} orders</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-muted/30 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">{isUrgent ? "Time Placed" : "Rental Start"}</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No orders in this category.</td></tr>
            ) : (
              data.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  
                  {/* CHANGED: Made Order ID a clickable Link */}
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/orders/${order.id}`} 
                      className="font-mono font-medium text-primary hover:underline block"
                    >
                      ORD-{order.id}
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      {isUrgent ? <Clock className="w-4 h-4 text-orange-500"/> : <Calendar className="w-4 h-4 text-blue-500"/>}
                      {isUrgent ? order.datePlaced : order.rentalStart}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{order.items.length} items</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative w-max">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isPending && updatingId === order.id}
                        className={cn(
                          "appearance-none border rounded-lg py-1.5 pl-3 pr-8 text-sm font-medium focus:outline-none cursor-pointer disabled:opacity-50",
                          order.status === "Returned" ? "text-green-700 border-green-200 bg-green-50" :
                          order.status === "Processing" ? "text-amber-700 border-amber-200 bg-amber-50" :
                          "text-blue-700 border-blue-200 bg-blue-50"
                        )}
                      >
                        {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      {isPending && updatingId === order.id && <RefreshCw className="w-3.5 h-3.5 text-primary absolute -right-6 top-1/2 -translate-y-1/2 animate-spin" />}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
      <OrderTable data={urgentOrders} isUrgent={true} />
      <OrderTable data={prebookedOrders} isUrgent={false} />
    </div>
  )
}