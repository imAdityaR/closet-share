"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { 
  getSearchResults, 
  getUserSearchHistory, 
  saveSearchQuery, 
  deleteSearchQuery, 
  clearAllSearchHistory 
} from "@/lib/actions"
import { cn } from "@/lib/utils"

const TRENDING_CATEGORIES = [
  { label: "Dresses", icon: "👗" },
  { label: "Blazers", icon: "🧥" },
  { label: "Sarees", icon: "🎀" },
  { label: "Jackets", icon: "🧥" },
  { label: "Lehengas", icon: "✨" },
  { label: "Formal Wear", icon: "🎩" },
]

export function SearchBar() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from DB (if logged in) or LocalStorage (if guest)
  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn) {
      getUserSearchHistory().then(setRecentSearches)
    } else {
      const saved = localStorage.getItem("closetshare_recent_searches")
      if (saved) setRecentSearches(JSON.parse(saved))
    }
  }, [isSignedIn, isLoaded, isOpen]) // Re-fetch when opened to ensure fresh data

  // Debounced Database Search for Products
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true)
        const results = await getSearchResults(query.trim())
        setDbProducts(results)
        setIsSearching(false)
      } else {
        setDbProducts([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const suggestedSearches = query.trim()
    ? Array.from(new Set(dbProducts.map((p) => p.articleType))).slice(0, 3)
    : []

  // Execute Search & Save to DB/Local
  const handleSearch = (searchTerm: string) => {
    const cleanTerm = searchTerm.trim()
    if (cleanTerm) {
      // Optimistic UI Update
      const newRecent = [cleanTerm, ...recentSearches.filter((s) => s !== cleanTerm)].slice(0, 5)
      setRecentSearches(newRecent)
      
      // Save to correct storage
      if (isSignedIn) {
        saveSearchQuery(cleanTerm).catch(console.error)
      } else {
        localStorage.setItem("closetshare_recent_searches", JSON.stringify(newRecent))
      }
      
      setIsOpen(false)
      router.push(`/search?q=${encodeURIComponent(cleanTerm)}`)
    }
  }

  // Delete Single History Item
  const clearRecentSearch = (search: string) => {
    const newRecent = recentSearches.filter((s) => s !== search)
    setRecentSearches(newRecent)
    
    if (isSignedIn) {
      deleteSearchQuery(search).catch(console.error)
    } else {
      localStorage.setItem("closetshare_recent_searches", JSON.stringify(newRecent))
    }
  }

  // Clear All History
  const clearAllRecent = () => {
    setRecentSearches([])
    if (isSignedIn) {
      clearAllSearchHistory().catch(console.error)
    } else {
      localStorage.removeItem("closetshare_recent_searches")
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl z-50">
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(query)
          }}
          placeholder="Search for dresses, blazers..."
          className={cn(
            "w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200",
            "text-sm font-sans"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          
          {/* Default State (Empty Query) */}
          {!query && (
            <>
              {recentSearches.length > 0 && (
                <div className="border-b border-border px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wide">
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearAllRecent}
                      className="text-xs font-sans text-primary hover:opacity-75 transition-opacity"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => {
                          setQuery(search)
                          handleSearch(search)
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-sm font-sans group"
                      >
                        {search}
                        <X
                          className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearRecentSearch(search)
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-4 py-4">
                <h3 className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Trending Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {TRENDING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => {
                        setQuery(cat.label)
                        handleSearch(cat.label)
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-sans text-foreground text-left"
                    >
                      <span className="text-base">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Typing State */}
          {query && (
            <>
              {suggestedSearches.length > 0 && (
                <div className="border-b border-border px-4 py-4">
                  <h3 className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Suggested Searches
                  </h3>
                  <div className="flex flex-col gap-2">
                    {suggestedSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSearch(search)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-sans text-foreground text-left"
                      >
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {dbProducts.length > 0 ? (
                <div className="px-4 py-4">
                  <h3 className="text-xs font-sans font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Products
                  </h3>
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                    {dbProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={product.imageUrl?.startsWith('http') ? product.imageUrl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${product.id}.jpg`}
                            alt={product.productDisplay}
                            fill
                            className="object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {product.productDisplay}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-sans bg-muted text-muted-foreground px-2 py-0.5 rounded">
                              {product.articleType}
                            </span>
                            <span className="text-sm font-sans font-bold text-primary">
                              ₹{product.rentalPricePerDay}/day
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                !isSearching && (
                  <div className="p-6 text-center">
                    <p className="text-sm font-sans text-muted-foreground">
                      No products found for "{query}"
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}