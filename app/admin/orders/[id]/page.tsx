export const dynamic = "force-dynamic"

import { getAdminOrderDetails, verifyAdminSession } from "@/lib/admin-actions"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, User } from "lucide-react"

// Update params to be a Promise as required by Next.js 15
export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap the params cleanly
  const resolvedParams = await params
  const rawId = resolvedParams.id
  
  // 2. Check Auth
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) redirect("/admin/login")

  // 3. REMOVED ParseInt! Pass the raw string directly to prevent JS precision loss
  const order = await getAdminOrderDetails(rawId)

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-serif mb-4">Order Not Found</h2>
        <Link href="/admin/orders" className="text-primary hover:underline">Return to Orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 font-sans">
      
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/admin/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 mb-3 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
            Order ORD-{order.id}
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
              {order.status}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Placed on {order.createdAt}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border bg-muted/20 flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Items Rented</h2>
            </div>
            
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 flex items-start sm:items-center gap-4">
                  <div className="relative w-16 h-20 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                    
                    {/* THE FIX: Implemented the Smart Source Ternary! */}
                    <Image 
                      src={item.imageUrl?.startsWith('http') ? item.imageUrl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.id}.jpg`} 
                      alt={item.name} 
                      fill 
                      className="object-cover" 
                    />

                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">₹{item.price_at_rental} / day</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-foreground">₹{(item.price_at_rental * item.rental_days).toLocaleString('en-IN')}</div>
                    <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                      {item.rental_days} Days
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 border-t border-border bg-muted/10">
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span className="text-primary">₹{order.totalPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Details */}
        <div className="space-y-6">
          
          {/* Customer Info */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2 border-b border-border pb-3">
              <User className="w-4 h-4 text-muted-foreground" /> Customer Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span> <span className="font-medium">{order.customer.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span> <span className="font-medium">{order.customer.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span> <span className="font-medium">{order.customer.phone}</span></div>
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2 border-b border-border pb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" /> Logistics
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span> <span className="font-medium">{order.deliveryType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start</span> <span className="font-medium">{order.rentalStart}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">End</span> <span className="font-medium">{order.rentalEnd}</span></div>
            </div>
          </div>

          {/* Payment & Address */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="w-4 h-4 text-muted-foreground" /> Fulfillment
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Shipping Address</span>
                <p className="font-medium leading-relaxed">{order.customer.address}</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Payment Method</span>
                <div className="flex items-center gap-1.5 font-medium">
                  <CreditCard className="w-4 h-4" /> {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}