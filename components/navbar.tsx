"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingBag, Menu, X, User, Sparkles } from "lucide-react" 
import { useUser, UserButton } from "@clerk/nextjs"
import { useCart } from "@/lib/cart-context"
import { SearchBar } from "./search-bar"
import { cn } from "@/lib/utils"
import NotificationBell from "./notification-bell"
interface NavbarProps {
  onOpenAuth: () => void
  onOpenCart: () => void
}

export function Navbar({ onOpenAuth, onOpenCart }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount } = useCart()
  const { isSignedIn } = useUser()
  const pathname = usePathname() 
  
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // 🛑 THE FIX: Conditionally insert "For You" only if isSignedIn is true
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "New Arrivals", href: "/new-arrivals" },
    ...(isSignedIn ? [{ label: "For You", href: "/for-you" }] : []), 
    { label: "Muse Studio", href: "/muse-ai", isSpecial: true }, 
    { label: "About", href: "/about" },
    { label: "Contact Us", href: "/helpdesk" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      
      {/* --- SUBTLE SHINE ANIMATION --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gentle-shine {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(0.95); 
            filter: drop-shadow(0 0 0 rgba(0,0,0,0)); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05); 
            filter: drop-shadow(0 0 3px currentColor); 
          }
        }
        .animate-gentle-shine {
          animation: gentle-shine 3.5s ease-in-out infinite;
        }
      `}} />

      <div className="max-w-screen-xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0"
          aria-label="ClosetShare home"
        >
          <Image
            src="/LogoLandScapeNoBG.png"
            alt="ClosetShare logo"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-sans transition-colors whitespace-nowrap flex items-center gap-1.5",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground font-medium hover:bg-muted hover:text-foreground"
                )}
              >
                {link.isSpecial ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-gentle-shine fill-primary/20" />
                    <span className={isActive ? "text-primary" : "text-foreground"}>
                      {link.label}
                    </span>
                  </>
                ) : (
                  link.label
                )}
              </Link>
            )
          })}
        </nav>

        {/* Search Bar Integration */}
        <div className="hidden sm:block flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isSignedIn && <NotificationBell />}
          {/* Custom Profile Icon Link */}
          {isSignedIn && (
            <Link
              href="/profile"
              aria-label="My Profile"
              className={cn(
                "relative w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                pathname === "/profile" ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={onOpenCart}
            aria-label="Cart"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-sans font-bold rounded-full px-1">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>

          {/* CLERK AUTHENTICATION UI */}
          <div className="flex items-center ml-1">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9"
                  }
                }}
              />
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-sans font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            )}
          </div>
          
          {/* Mobile hamburger */}
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((p) => !p)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="lg:hidden border-t border-border bg-background px-5 pb-4 pt-2 flex flex-col gap-1 overflow-visible"
          aria-label="Mobile navigation"
        >
          {/* Search bar specifically for mobile users */}
          <div className="py-3 border-b border-border mb-2 sm:hidden z-50">
             <SearchBar />
          </div>

          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "py-2.5 px-3 rounded-md text-sm font-sans transition-colors flex items-center gap-2",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-foreground font-medium hover:bg-muted"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.isSpecial ? (
                  <>
                    <Sparkles className="w-4 h-4 text-primary animate-gentle-shine fill-primary/20" />
                    <span>{link.label}</span>
                  </>
                ) : (
                  link.label
                )}
              </Link>
            )
          })}

          {!isSignedIn && (
            <button
              onClick={() => {
                setMobileOpen(false)
                onOpenAuth()
              }}
              className="mt-3 w-full flex items-center justify-center px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-sans font-medium"
            >
              Sign In
            </button>
          )}
        </nav>
      )}
    </header>
  )
}