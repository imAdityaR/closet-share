"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { FilterSidebar } from "@/components/filter-sidebar"
import { ProductGrid } from "@/components/product-grid"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

export function CatalogClient({ products }: { products: any[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // 1. READ DIRECTLY FROM THE URL (No local useState needed!)
  const activeFilters = {
    gender: searchParams.getAll("gender"),
    masterCategory: searchParams.getAll("masterCategory"),
    season: searchParams.getAll("season"),
    usage: searchParams.getAll("usage"),
  }
  
  // Grab the max price from the URL (default to 2000 if not set)
  const maxPrice = Number(searchParams.get("maxPrice")) || 2000

  const [sortBy, setSortBy] = useState("featured")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // 2. FILTER PRODUCTS BASED ON URL PARAMS
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const genderOk = activeFilters.gender.length === 0 || activeFilters.gender.includes(p.gender)
      // Note: checking p.category OR p.masterCategory just in case your DB mapped it differently
      const categoryOk = activeFilters.masterCategory.length === 0 || activeFilters.masterCategory.includes(p.category || p.masterCategory)
      const seasonOk = activeFilters.season.length === 0 || activeFilters.season.includes(p.season)
      const usageOk = activeFilters.usage.length === 0 || activeFilters.usage.includes(p.usage)
      
      // Filter by your awesome new slider!
      const itemPrice = Number(p.price || p.rentalPrice || p.rentalpriceperday)
      const priceOk = itemPrice <= maxPrice

      return genderOk && categoryOk && seasonOk && usageOk && priceOk
    })
  }, [activeFilters, maxPrice, products])

  // Count active filters for the mobile badge
  const totalActiveFilters = Object.values(activeFilters).flat().length + (searchParams.has("maxPrice") ? 1 : 0)

  // Remove a specific filter chip from the URL
  const removeFilter = (category: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentValues = params.getAll(category)
    params.delete(category)
    currentValues.filter((v) => v !== value).forEach((v) => params.append(category, v))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="bg-muted/30 border-b border-border px-5 md:px-8 py-6 md:py-8">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              The Collection
            </h1>
            <p className="text-sm font-sans text-muted-foreground mt-2 max-w-xl">
              Browse our complete catalog of premium rental pieces. Use the filters to find exactly what you need for your next event.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-5 md:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-3">
          
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden flex items-center gap-2 text-sm font-sans text-foreground bg-card border border-border px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {totalActiveFilters > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {totalActiveFilters}
              </span>
            )}
          </button>

          <p className="hidden md:block text-sm font-sans text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredProducts.length}</span> items available
          </p>

          {/* Active filter chips (Updated to remove from URL) */}
          <div className="hidden md:flex flex-wrap gap-1.5 flex-1 justify-center">
            {Object.entries(activeFilters).flatMap(([cat, vals]) =>
              vals.map((val) => (
                <button
                  key={`${cat}-${val}`}
                  onClick={() => removeFilter(cat, val)}
                  className="flex items-center gap-1 text-xs font-sans bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {val} <X className="w-3 h-3" />
                </button>
              ))
            )}
            {/* Show chip for max price if it's altered from default */}
            {searchParams.has("maxPrice") && (
               <button
                 onClick={() => {
                   const params = new URLSearchParams(searchParams.toString())
                   params.delete("maxPrice")
                   router.push(`${pathname}?${params.toString()}`, { scroll: false })
                 }}
                 className="flex items-center gap-1 text-xs font-sans bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
               >
                 Under ₹{maxPrice} <X className="w-3 h-3" />
               </button>
            )}
          </div>

          <div className="relative ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none text-sm font-sans text-foreground bg-card border border-border rounded-lg pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring hover:bg-muted transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-8">
          
          {/* Desktop Sidebar (THE FIX: Only passing totalResults!) */}
          <div className="hidden md:block w-52 shrink-0">
            <FilterSidebar totalResults={filteredProducts.length} />
          </div>

          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div className="md:hidden fixed inset-0 z-40 flex">
              <button
                className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="relative z-50 w-72 max-w-[85vw] bg-background h-full overflow-y-auto p-6 flex flex-col gap-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif text-lg font-bold text-foreground">Filters</span>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Mobile Sidebar (THE FIX: Only passing totalResults!) */}
                <FilterSidebar totalResults={filteredProducts.length} />
                
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="mt-auto w-full py-3 rounded-xl bg-primary text-primary-foreground font-sans font-medium text-sm"
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={filteredProducts} sortBy={sortBy} />
          </div>
        </div>
      </main>
    </div>
  )
}