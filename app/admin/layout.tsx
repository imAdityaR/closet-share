"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { logoutAdmin } from "@/lib/admin-actions" // Assuming you put logoutAdmin here
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navLinks = [
    { name: "Home", href: "/admin" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Helpdesk", href: "/admin/helpdesk" },
    { name: "Inventory", href: "/admin/products" },
  ]

  return (
    <div className="min-h-screen bg-muted/30 font-sans flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
          href="/"
          className="flex items-center shrink-0"
          aria-label="ClosetShare home"
        >
          <Image
            src="/LogoLandscapeNoBG.png"
            alt="ClosetShare logo"
            width={120}
            height={40}
            priority
          />
        <span className="text-xs text-foreground uppercase tracking-widest ml-1 bg-muted px-2 py-1 rounded">Admin</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <button 
            onClick={() => logoutAdmin()} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}