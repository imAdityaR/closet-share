export const dynamic = "force-dynamic";

import { getAdminDashboardMetrics, verifyAdminSession } from "@/lib/admin-actions"
import { getPendingRequests } from "@/lib/import-action" // <-- Added to fetch the queue
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image" // <-- Added for product thumbnails
import { 
  IndianRupee, 
  PackageSearch, 
  Clock, 
  Shirt, 
  ArrowRight,
  AlertCircle,
  Bell,  // <-- Added
  User   // <-- Added
} from "lucide-react"

export default async function AdminHome() {
  // 1. Strict Security Check
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) redirect("/admin/login")

  // 2. Fetch Live Data
  const data = await getAdminDashboardMetrics()
  const requestsRes = await getPendingRequests() // Fetch pending requests
  const pendingRequests = requestsRes?.success ? requestsRes.data ?? [] : []

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 font-sans">
      
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Welcome back, Admin</h1>
        <p className="text-muted-foreground">Here is what is happening with ClosetShare today.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Revenue Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-foreground">₹{data.stats.revenue.toLocaleString('en-IN')}</h3>
        </div>

        {/* Active Rentals Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Out with Customers</p>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <PackageSearch className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-foreground">{data.stats.active} <span className="text-sm font-normal text-muted-foreground">items</span></h3>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-card p-6 rounded-2xl border border-primary/30 ring-1 ring-primary/10 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Needs Processing</p>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-foreground">{data.stats.pending} <span className="text-sm font-normal text-muted-foreground">orders</span></h3>
        </div>

        {/* Catalog Size Card */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Catalog Size</p>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Shirt className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-foreground">{data.stats.products} <span className="text-sm font-normal text-muted-foreground">items</span></h3>
        </div>

      </div>

      {/* Two Column Layout for the bottom half */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Action Needed (Wider) */}
        <div className="lg:col-span-2 space-y-8">

          {/* NEW: Pending Custom Requests (Matches the Indigo theme of the Import page) */}
          {pendingRequests.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-emerald-100 flex items-center justify-between bg-emerald-100/50">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Bell className="w-5 h-5" />
                  <h2 className="font-semibold">Action Needed: Pending Custom Requests</h2>
                </div>
                <Link href="/admin/products/import" className="text-sm font-medium text-emerald-700 flex items-center gap-1 hover:underline">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="divide-y divide-emerald-50 bg-white">
                {(pendingRequests ?? []).slice(0, 5).map((req: any) => (
                  <div key={req.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 relative rounded bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                        <Image src={req.scraped_image_url} alt="Req" fill className="object-cover" unoptimized />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900 block mb-1 line-clamp-1">{req.scraped_title}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> {req.user_email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Link 
                        href="/admin/products/import" 
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Needed: Processing Orders */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-5 h-5" />
                <h2 className="font-semibold text-foreground">Action Needed: Processing Orders</h2>
              </div>
              <Link href="/admin/orders" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="divide-y divide-border">
              {data.actionNeeded.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  You are all caught up! No pending orders to process.
                </div>
              ) : (
                data.actionNeeded.map((order: any) => (
                  <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <span className="font-mono font-medium text-foreground block mb-1">ORD-{order.id}</span>
                      <span className="text-sm text-muted-foreground">{order.customerName} • Placed {order.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-foreground">₹{order.total.toLocaleString('en-IN')}</span>
                      <Link 
                        href="/admin/orders" 
                        className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Process Order
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links / System Health */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/admin/orders" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-all group">
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Manage All Orders</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/helpdesk" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-all group">
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Customer Helpdesk</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin/reviews" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-all group">
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Critical Reviews</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Optional: System Status */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">System Status</h3>
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm text-muted-foreground">All systems operational</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}