"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"
import { getUserWishlist,trackProductEngagement } from "./actions"


interface WishlistContextType {
  wishlisted: Set<number>
  isWishlisted: (id: number) => boolean
  toggleWishlist: (id: number) => void
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlisted, setWishlisted] = useState<Set<number>>(new Set())
  const { isSignedIn, isLoaded } = useUser()

  // Pull wishlist from DB on load or refresh
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getUserWishlist().then((items) => setWishlisted(new Set(items)))
    } else if (isLoaded && !isSignedIn) {
      setWishlisted(new Set())
    }
  }, [isLoaded, isSignedIn])

  const isWishlisted = (id: number) => wishlisted.has(id)

  const toggleWishlist = (id: number) => {
    trackProductEngagement(id,"wishlist")
    setWishlisted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <WishlistContext.Provider value={{ wishlisted, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider")
  return context
}