"use client"

import { useState } from "react"
import { Star, Check, Minus, Plus } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/data"
import { cn } from "@/lib/utils"

export function ProductDetailActions({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [days, setDays] = useState(3)
  const [addedToCart, setAddedToCart] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const handleRent = () => {
    addToCart(product, days)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Rental day stepper */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-foreground">
          Rental duration
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDays((d) => Math.max(1, d - 1))}
            aria-label="Decrease days"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-sans text-base font-semibold text-foreground w-16 text-center">
            {days} {days === 1 ? "day" : "days"}
          </span>
          <button
            onClick={() => setDays((d) => Math.min(30, d + 1))}
            aria-label="Increase days"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="font-sans text-sm text-muted-foreground ml-2">
            Total: <span className="font-semibold text-foreground">₹{product.rentalPricePerDay * days}</span>
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleRent}
          disabled={addedToCart}
          className={cn(
            "flex-1 py-3.5 rounded-xl font-sans font-medium text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2",
            addedToCart
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
          )}
        >
          {addedToCart ? (
            <>
              <Check className="w-4 h-4" />
              Added to Cart
            </>
          ) : (
            "Rent Now"
          )}
        </button>
        <button
          onClick={() => setWishlisted((w) => !w)}
          aria-label={wishlisted ? "Remove from favourites" : "Add to favourites"}
          className={cn(
            "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0",
            wishlisted
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-primary hover:border-primary"
          )}
        >
          <Star className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  )
}
