import { Suspense } from "react" // 1. Import Suspense
import { sql } from "@/lib/db"
import { CatalogClient } from "./client"

export default async function Home() {
  
  // Fetch products from Neon Database
  const rawProducts = await sql`
    SELECT p.*,
           COUNT(r.id) as review_count,
           (COALESCE(SUM(r.rating), 0) + 4.0) / (COUNT(r.id) + 1.0) as calculated_rating
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `

  const formattedProducts = rawProducts.map((p) => ({
    id: p.id,
    name: p.productdisplay,
    productDisplay: p.productdisplay,
    price: Number(p.rentalpriceperday),
    rentalPricePerDay: Number(p.rentalpriceperday),
    rentalPrice: Number(p.rentalpriceperday),
    imageUrl: p.imageurl,
    gender: p.gender,
    masterCategory: p.mastercategory,
    category: p.mastercategory,
    subCategory: p.subcategory,
    articleType: p.articletype,
    baseColour: p.basecolour,
    season: p.season,
    usage: p.usage,
    year: p.year,
    securityDeposit: Number(p.securitydeposit),
    rating: Number(p.calculated_rating).toFixed(1),
    reviewCount: Number(p.review_count)
  }))

  console.log("✅ SERVER SUCCESS: Handing products to Client!")

  return (
    // 2. Wrap the Client Component in Suspense
    // This tells Next.js: "This part is dynamic, don't crash the build!"
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#D4E7C5] border-t-[#A67B5B] rounded-full animate-spin" />
        <p className="font-sans text-stone-500 animate-pulse">Curating the collection...</p>
      </div>
    }>
      <CatalogClient products={formattedProducts} />
    </Suspense>
  )
}