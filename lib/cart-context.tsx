"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"
import { fetchCart, syncCartItem, removeCartItemDB, clearUserCartDB } from "./actions"

export interface Product {
  id: number
  productDisplay: string
  gender: string
  masterCategory: string
  subCategory: string
  articleType: string
  baseColour: string
  season: string
  year: number
  usage: string
  rentalPricePerDay: number
  securityDeposit: number
  imageUrl?: string
}

export interface CartItem {
  product: Product
  rentalDays: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, rentalDays?: number) => void
  removeFromCart: (productId: number) => void
  updateRentalDays: (productId: number, days: number) => void
  clearCart: () => void
  getTotalRental: () => number
  getTotalDeposit: () => number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchCart().then((dbCart) => setItems(dbCart))
    } else if (isLoaded && !isSignedIn) {
      setItems([])
    }
  }, [isLoaded, isSignedIn])

  const addToCart = useCallback((product: Product, rentalDays = 3) => {
    const exists = items.find((item) => item.product.id === product.id)
    const newDays = exists ? exists.rentalDays + rentalDays : rentalDays
    
    syncCartItem(product.id, newDays).catch(console.error)

    setItems((prev) => {
      if (prev.find((item) => item.product.id === product.id)) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, rentalDays: newDays } : item
        )
      }
      return [...prev, { product, rentalDays }]
    })
  }, [items])

  const removeFromCart = useCallback((productId: number) => {
    removeCartItemDB(productId).catch(console.error) 
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const updateRentalDays = useCallback((productId: number, days: number) => {
    const validDays = Math.max(1, days)
    syncCartItem(productId, validDays).catch(console.error) 
    
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, rentalDays: validDays } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    clearUserCartDB().catch(console.error) 
    setItems([])
  }, [])

  const getTotalRental = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.rentalPricePerDay * item.rentalDays, 0)
  }, [items])

  const getTotalDeposit = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.securityDeposit, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateRentalDays, 
        clearCart, 
        getTotalRental, 
        getTotalDeposit, 
        itemCount: items.length 
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}