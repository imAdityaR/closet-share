"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { filterOptions } from "@/lib/data"
import { cn } from "@/lib/utils"

const FILTER_LABELS: Record<string, string> = {
  gender: "Gender",
  masterCategory: "Category",
  season: "Season",
  usage: "Usage",
}

function FilterGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-border pb-5">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-1 text-sm font-sans font-semibold text-foreground uppercase tracking-widest"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul className="mt-3 flex flex-col gap-2">
          {options.map((opt) => {
            const checked = selected.includes(opt)
            return (
              <li key={opt}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <span
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors duration-150",
                      checked
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary"
                    )}
                  >
                    {checked && (
                      <svg
                        className="w-2.5 h-2.5 text-primary-foreground"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => onChange(opt)}
                    aria-label={opt}
                  />
                  <span className="text-sm font-sans text-foreground group-hover:text-primary transition-colors">
                    {opt}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function FilterSidebar({ totalResults }: { totalResults: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Read current active filters directly from the URL
  const activeFilters = {
    gender: searchParams.getAll("gender"),
    masterCategory: searchParams.getAll("masterCategory"),
    season: searchParams.getAll("season"),
    usage: searchParams.getAll("usage"),
  }

  // Price State (Defaulting to 2000 max if none set)
  const initialMaxPrice = searchParams.get("maxPrice") || "2000"
  const [localMaxPrice, setLocalMaxPrice] = useState(initialMaxPrice)

  const totalActive = Object.values(activeFilters).flat().length + (searchParams.has("maxPrice") ? 1 : 0)

  // Update URL for Checkboxes
  const handleFilterChange = (category: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentValues = params.getAll(category)

    if (currentValues.includes(value)) {
      params.delete(category)
      currentValues.filter((v) => v !== value).forEach((v) => params.append(category, v))
    } else {
      params.append(category, value)
    }

    params.delete("page") 
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Update URL for Slider (Triggers when user lets go of slider)
  const handlePriceCommit = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("maxPrice", localMaxPrice)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleClearAll = () => {
    setLocalMaxPrice("2000") // Reset local slider visually
    router.push(pathname, { scroll: false })
  }

  return (
    <aside className="w-full flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-foreground" />
          <span className="font-sans font-semibold text-sm uppercase tracking-widest text-foreground">
            Filters
          </span>
          {totalActive > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {totalActive}
            </span>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground font-sans">
        {totalResults} item{totalResults !== 1 ? "s" : ""} available
      </p>

      {/* Filter groups */}
      <div className="flex flex-col gap-5">
        {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map((key) => (
          <FilterGroup
            key={key}
            label={FILTER_LABELS[key]}
            options={filterOptions[key]}
            selected={activeFilters[key as keyof typeof activeFilters]}
            onChange={(val) => handleFilterChange(key, val)}
          />
        ))}
      </div>

      {/* Functional Max Price Slider */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-sans font-semibold uppercase tracking-widest text-foreground">
            Max Price
          </p>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
            ₹{localMaxPrice} / day
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>₹99</span>
          <span>₹2000+</span>
        </div>
        
        <input
          type="range"
          min="99"
          max="2000"
          step="50"
          value={localMaxPrice}
          onChange={(e) => setLocalMaxPrice(e.target.value)}
          onMouseUp={handlePriceCommit}
          onTouchEnd={handlePriceCommit}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    </aside>
  )
}