"use client"

import { useState } from "react"
import { Navbar } from "./navbar"
import { CartDrawer } from "./cart-drawer"
import { AuthModal } from "./auth-modal"

interface RootLayoutClientProps {
  children: React.ReactNode
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [authOpen, setAuthOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      {/* Navbar triggers the global modals */}
      <Navbar 
        onOpenAuth={() => setAuthOpen(true)} 
        onOpenCart={() => setCartOpen(true)} 
      />
      
      {/* The current page being viewed */}
      {children}
      
      {/* Global Overlays */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
      />
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
      />
    </>
  )
}