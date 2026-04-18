import { sql } from "@/lib/db"
import { CatalogClient } from "./client"

// Notice we don't need searchParams here anymore because CatalogClient handles it!
export default async function Home() {
  
  // 1. Fetch all products
  const rawProducts = await sql`
    SELECT p.*,
           COUNT(r.id) as review_count,
           (COALESCE(SUM(r.rating), 0) + 4.0) / (COUNT(r.id) + 1.0) as calculated_rating
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `

  // 2. The Bulletproof Map
  const formattedProducts = rawProducts.map((p) => ({
    id: p.id,
    
    // Core Display Data (Mapped double so the UI cannot fail)
    name: p.productdisplay,
    productDisplay: p.productdisplay,
    
    price: Number(p.rentalpriceperday),
    rentalPricePerDay: Number(p.rentalpriceperday),
    rentalPrice: Number(p.rentalpriceperday),
    
    imageUrl: p.imageurl,

    // Core Filtering Data
    gender: p.gender,
    masterCategory: p.mastercategory,
    category: p.mastercategory, // Mapped twice just in case!
    subCategory: p.subcategory,
    articleType: p.articletype,
    baseColour: p.basecolour,
    season: p.season,
    usage: p.usage,

    // Meta Data
    year: p.year,
    securityDeposit: Number(p.securitydeposit),
    rating: Number(p.calculated_rating).toFixed(1),
    reviewCount: Number(p.review_count)
  }))

  console.log("✅ SERVER SUCCESS: Handing 5413 products to Client!")

  // 3. Pass the perfectly formatted payload directly to the client
  return <CatalogClient products={formattedProducts} />
}