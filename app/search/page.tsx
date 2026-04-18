import { sql } from "@/lib/db"
import { ProductCard } from "@/components/product-card"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ""
  
  // Pagination Setup
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10))
  const ITEMS_PER_PAGE = 12
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  if (!query) {
    return (
      <main className="min-h-screen bg-background pt-24 px-5">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-serif text-3xl font-bold">Search Products</h1>
          <p className="font-sans text-muted-foreground mt-2">Enter a search term above to find items.</p>
        </div>
      </main>
    )
  }

  const searchTerm = `%${query}%`

  // 1. Get the TOTAL count of matching items to calculate total pages
  const countResult = await sql`
    SELECT COUNT(*)
    FROM products
    WHERE productdisplay ILIKE ${searchTerm} 
       OR articletype ILIKE ${searchTerm}
       OR mastercategory ILIKE ${searchTerm}
       OR basecolour ILIKE ${searchTerm}
  `
  const totalItems = parseInt(countResult[0].count, 10)
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // 2. Fetch only the items for the CURRENT page
  const dbProducts = await sql`
    SELECT *
    FROM products
    WHERE productdisplay ILIKE ${searchTerm} 
       OR articletype ILIKE ${searchTerm}
       OR mastercategory ILIKE ${searchTerm}
       OR basecolour ILIKE ${searchTerm}
    ORDER BY id DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `

  const products = dbProducts.map((p) => ({
    id: p.id,
    gender: p.gender,
    masterCategory: p.mastercategory,
    subCategory: p.subcategory,
    articleType: p.articletype,
    baseColour: p.basecolour,
    season: p.season,
    year: p.year,
    usage: p.usage,
    productDisplay: p.productdisplay,
    rentalPricePerDay: p.rentalpriceperday,
    securityDeposit: p.securitydeposit,
    imageUrl: p.imageurl,
  }))

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="bg-secondary/20 border-b border-border px-5 md:px-8 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            Search Results
          </h1>
          <p className="font-sans text-muted-foreground text-lg">
            Showing results for <span className="text-foreground font-semibold">"{query}"</span> 
            {totalItems > 0 && ` (${totalItems} items)`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="font-serif text-2xl font-semibold mb-2">No matches found</h2>
            <p className="font-sans text-muted-foreground">Try adjusting your search term or browse our categories.</p>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border">
                {/* Previous Button */}
                {currentPage > 1 ? (
                  <Link 
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                    className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg bg-background hover:bg-muted text-foreground transition-colors text-sm font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed text-sm font-medium opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}

                {/* Page Indicator */}
                <span className="text-sm font-sans font-medium text-muted-foreground">
                  Page <span className="text-foreground">{currentPage}</span> of <span className="text-foreground">{totalPages}</span>
                </span>

                {/* Next Button */}
                {currentPage < totalPages ? (
                  <Link 
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                    className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg bg-background hover:bg-muted text-foreground transition-colors text-sm font-medium"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button disabled className="flex items-center gap-1 px-4 py-2 border border-border rounded-lg bg-muted/50 text-muted-foreground cursor-not-allowed text-sm font-medium opacity-50">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}