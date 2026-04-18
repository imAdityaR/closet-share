"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Bell, ShoppingBag, CheckCircle2 } from "lucide-react"
import { getUserNotifications, markNotificationAsRead } from "@/lib/actions"
import { useCart } from "@/lib/cart-context" 

export default function NotificationBell() {
  const router = useRouter()
  const { addToCart } = useCart()
  
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications on mount
  useEffect(() => {
    async function loadNotifs() {
      const res = await getUserNotifications()
      if (res.success) setNotifications(res.data)
    }
    loadNotifs()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Optimistic UI update function
  const handleMarkAsRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await markNotificationAsRead(id)
  }

  // Handle clicking the notification body (Routes to product)
  const handleNotificationClick = (id: number, productId: number) => {
    handleMarkAsRead(id)
    setIsOpen(false)
    router.push(`/product/${productId}`)
  }

  // Handle clicking the Add to Cart button
  const handleAddToCart = (e: React.MouseEvent, notif: any) => {
    e.preventDefault()
    e.stopPropagation()

    // 1. Mark as read instantly in UI
    handleMarkAsRead(notif.id)

    // 2. Construct the exact Product object the CartContext expects
    const productForCart = {
      id: notif.product_id,
      productDisplay: notif.productDisplay,
      imageUrl: notif.imageurl || notif.imageUrl || "/placeholder-image.jpg",
      // Postgres lowercases columns, so we check both to be safe
      rentalPricePerDay: notif.rentalpriceperday || notif.rentalPricePerDay || 0,
      securityDeposit: notif.securitydeposit || notif.securityDeposit || 0,
      
      // Provide fallback empty strings for missing non-essential data
      gender: "",
      masterCategory: "",
      subCategory: "",
      articleType: "",
      baseColour: "",
      season: "",
      year: new Date().getFullYear(),
      usage: ""
    }

    // 3. Add to cart context with default 3 days
    addToCart(productForCart, 3)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* The Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && <span className="text-xs text-gray-500">{unreadCount} unread</span>}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No new notifications.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.product_id)}
                  className={`relative p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex gap-4 ${notif.is_read ? 'opacity-70' : 'bg-emerald-50/30'}`}
                >
                  {/* Unread Indicator Dot */}
                  {!notif.is_read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                  
                  {/* Product Image */}
                  <div className="w-14 h-16 relative rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200 ml-2">
                    <Image 
                      src={notif.imageurl || notif.imageUrl || "/placeholder-image.jpg"} 
                      alt="Product" 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm text-gray-800 leading-tight mb-2">
                      {notif.message}
                    </p>
                    
                    {/* The Dynamic Button State */}
                    {!notif.is_read ? (
                      <button 
                        onClick={(e) => handleAddToCart(e, notif)}
                        className="self-start flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    ) : (
                      <div className="self-start flex items-center gap-1 text-xs font-medium text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}