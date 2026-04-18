"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Package, Calendar, DollarSign, CheckCircle2, Copy, Check, ChevronRight } from "lucide-react"

export function OrderDetailsClient({ order, startDate, endDate }: { order: any, startDate: string, endDate: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`ORD-${order.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-8">
        <Link 
          href="/profile?tab=orders" 
          className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 mb-6 gap-4">
          <div>
            {/* Simple, readable Mono font for the Order ID with a Copy Button */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-mono text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                ORD-{order.id}
              </h1>
              <button 
                onClick={handleCopy} 
                className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                aria-label="Copy Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="font-sans text-sm text-muted-foreground">
              Placed on {startDate}
            </p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-sm font-sans font-semibold px-4 py-1.5 rounded-full flex items-center gap-2 self-start md:self-auto">
            <CheckCircle2 className="w-4 h-4" />
            {order.status || "Active"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-sans text-muted-foreground">Rental Period</p>
              <p className="font-sans font-medium text-foreground">
                {startDate} — {endDate}
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-sans text-muted-foreground">Total Paid</p>
              <p className="font-sans font-medium text-foreground">
                ₹{Number(order.total_amount || order.totalamount || order.total_paid || order.amount || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
          Items in this Order ({order.items?.length || 0})
        </h2>
        
        <div className="flex flex-col gap-4">
          {order.items?.map((item: any, idx: number) => (
            <OrderLineItem key={idx} item={item} />
          ))}
        </div>
      </div>
    </main>
  )
}

// Extracted into a smaller component so each image manages its own loading/error state
function OrderLineItem({ item }: { item: any }) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link 
      href={`/product/${item.id}`} 
      className="group flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="w-16 h-20 bg-muted rounded-md flex items-center justify-center shrink-0 overflow-hidden relative">
        {!imgError ? (
          <Image
            src={item.imageUrl?.startsWith('http') ? item.imageUrl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.id}.jpg`}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="64px"
          />
        ) : (
          <Package className="w-6 h-6 text-muted-foreground opacity-50" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {item.name}
        </p>
        <p className="font-sans text-sm text-muted-foreground mt-0.5">
          Product ID: {item.id}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="font-sans font-semibold text-primary">
          ₹{item.price}/day
        </p>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}