"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"
import { useUser, SignInButton } from "@clerk/nextjs"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const { items, removeFromCart, updateRentalDays, getTotalRental, getTotalDeposit, clearCart } = useCart()
  const { isSignedIn } = useUser()
  if (!isOpen) return null

  const totalRental = getTotalRental()
  const totalDeposit = getTotalDeposit()

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close cart"
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-card h-full flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-bold text-foreground">
              Your Cart
            </h2>
            <span className="text-sm font-sans text-muted-foreground">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-serif text-lg font-semibold text-foreground">
                Your cart is empty
              </p>
              <p className="text-sm font-sans text-muted-foreground max-w-xs">
                Browse our collection and add your favorite pieces to start renting.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 mt-2 rounded-xl bg-primary text-primary-foreground font-sans font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.product.id}
                  item={item}
                  onRemove={() => removeFromCart(item.product.id)}
                  onUpdateDays={(days) => updateRentalDays(item.product.id, days)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-border bg-muted/50 p-6 flex flex-col gap-4">
            
            {/* Summary */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm font-sans">
                <span className="text-muted-foreground">Total Rental</span>
                <span className="font-semibold text-foreground">
                  ₹{totalRental.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-sans">
                <span className="text-muted-foreground">Security Deposit</span>
                <span className="font-semibold text-foreground">
                  ₹{totalDeposit.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="border-t border-border pt-2 mt-1 flex items-center justify-between">
                <span className="font-sans font-medium text-foreground">
                  Total Payable
                </span>
                <span className="font-serif text-xl font-bold text-primary">
                  ₹{(totalRental + totalDeposit).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Actions */}
            {/* Actions */}
            <div className="flex flex-col gap-2">
              
              {/* SMART CHECKOUT BUTTON */}
              {isSignedIn ? (
                <Link 
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-sans font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                  <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-sans font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm">
                    Login to Place Order
                  </button>
                </SignInButton>
              )}
              
              <button
                onClick={clearCart}
                className="w-full py-2.5 rounded-xl border border-border text-muted-foreground font-sans text-sm hover:bg-muted hover:text-foreground transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <p className="text-xs font-sans text-muted-foreground text-center">
              Deposit is fully refundable upon return of items in good condition.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CartItemCard({
  item,
  onRemove,
  onUpdateDays,
}: {
  item: { product: any; rentalDays: number }
  onRemove: () => void
  onUpdateDays: (days: number) => void
}) {
  const [imgError, setImgError] = useState(false)
  const itemTotal = item.product.rentalPricePerDay * item.rentalDays

  return (
    <div className="flex gap-4 bg-background rounded-xl p-3 border border-border shadow-sm">
      {/* Image */}
      <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
        {!imgError ? (
          <Image
            src={item.product.imageUrl?.startsWith('http') ? item.product.imageUrl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.product.id}.jpg`}
            alt={item.product.productDisplay}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-muted-foreground opacity-40" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col gap-1 min-w-0 py-1">
        <h4 className="font-sans text-sm font-medium text-foreground line-clamp-2 leading-snug">
          {item.product.productDisplay}
        </h4>
        <p className="text-xs font-sans text-muted-foreground">
          ₹{item.product.rentalPricePerDay} / day
        </p>

        {/* Rental days stepper */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center border border-border rounded-md overflow-hidden bg-muted/50">
            <button
              onClick={() => onUpdateDays(item.rentalDays - 1)}
              disabled={item.rentalDays <= 1}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease rental days"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-sans font-medium text-foreground">
              {item.rentalDays}
            </span>
            <button
              onClick={() => onUpdateDays(item.rentalDays + 1)}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Increase rental days"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-sans text-sm font-semibold text-foreground">
            ₹{itemTotal.toLocaleString("en-IN")}
          </span>
          <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}