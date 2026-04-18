"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { PackageOpen, ChevronLeft, ChevronRight } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  sortBy: string
}

const ITEMS_PER_PAGE = 20

export function ProductGrid({ products, sortBy }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.rentalPricePerDay - b.rentalPricePerDay
      case "price-desc":
        return b.rentalPricePerDay - a.rentalPricePerDay
      case "newest":
        return b.year - a.year
      default:
        return 0
    }
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const displayedProducts = sorted.slice(startIdx, endIdx)

  // Reset to page 1 when products change (e.g., filter change)
  useEffect(() => {
    setCurrentPage(1)
  }, [products, sortBy])

  const handlePageChange = (newPage: number) => {
    // Simulate brief loading state
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPage(newPage)
      setIsLoading(false)
      // Scroll to top of grid
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 300)
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <PackageOpen className="w-12 h-12 text-muted-foreground opacity-40" />
        <p className="font-serif text-xl text-foreground">No items found</p>
        <p className="text-sm font-sans text-muted-foreground">
          Try adjusting your filters to see more results.
        </p>
      </div>
    )
  }

  return (
    <section aria-label="Products">
      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-lg" />
      )}

      {/* Product grid */}
      <div className={`transition-opacity duration-200 ${isLoading ? "opacity-50" : "opacity-100"}`}>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination controls */}
      <div className="mt-12 flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground font-sans font-medium text-sm transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page indicator */}
        <div className="flex items-center gap-1">
          {/* First page button */}
          {currentPage > 2 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                disabled={isLoading}
                className="w-9 h-9 rounded-lg border border-border bg-card text-foreground font-sans font-medium text-sm hover:bg-muted transition-colors disabled:cursor-not-allowed"
              >
                1
              </button>
              {currentPage > 3 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
            </>
          )}

          {/* Page numbers around current */}
          {Array.from(
            { length: Math.min(3, totalPages) },
            (_, i) => {
              if (totalPages <= 3) return currentPage - 1 + i
              if (currentPage <= 2) return 1 + i
              if (currentPage >= totalPages - 1) return totalPages - 2 + i
              return currentPage - 1 + i
            }
          ).map((page) => {
            if (page < 1 || page > totalPages) return null
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={`w-9 h-9 rounded-lg font-sans font-medium text-sm transition-all disabled:cursor-not-allowed ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground border border-primary"
                    : "border border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {page}
              </button>
            )
          })}

          {/* Last page button */}
          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={isLoading}
                className="w-9 h-9 rounded-lg border border-border bg-card text-foreground font-sans font-medium text-sm hover:bg-muted transition-colors disabled:cursor-not-allowed"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Text indicator */}
        <span className="text-sm font-sans text-muted-foreground mx-2">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </span>

        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground font-sans font-medium text-sm transition-all hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Item count indicator */}
      <p className="text-center mt-6 text-xs font-sans text-muted-foreground">
        Showing {startIdx + 1}–{Math.min(endIdx, sorted.length)} of{" "}
        <span className="font-semibold text-foreground">{sorted.length}</span> items
      </p>
    </section>
  )
}
