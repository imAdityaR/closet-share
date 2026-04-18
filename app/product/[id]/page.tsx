import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { ProductDetailClient } from "@/components/product-detail-client"
import { checkReviewEligibility, getProductReviews } from "@/lib/actions"
// Note: Removed OrderDetailsClient if unused to clean up imports
import { trackProductEngagement } from "@/lib/actions"
import YouMayAlsoLike from '@/components/YouMayAlsoLike' // <-- IMPORT AI COMPONENT HERE
import SmartCompleteTheLook from '@/components/SmartCompleteTheLook' // <-- IMPORT AI COMPONENT HERE

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const productId = parseInt(id, 10)

  // 🛑 FIRE THE TRACKER!
  await trackProductEngagement(productId,"view")

  if (isNaN(productId)) return notFound()

  const dbProducts = await sql`
    SELECT p.*,
           COUNT(r.id) as review_count,
           (COALESCE(SUM(r.rating), 0) + 4.0) / (COUNT(r.id) + 1.0) as calculated_rating
    FROM products p
    LEFT JOIN reviews r ON p.id = r.product_id
    WHERE p.id = ${productId}
    GROUP BY p.id
    LIMIT 1
  `

  if (dbProducts.length === 0) return notFound()

  const p = dbProducts[0]
  const product = {
    id: p.id,
    gender: p.gender,
    mastercategory: p.mastercategory,
    subcategory: p.subcategory,
    articletype: p.articletype,
    basecolour: p.basecolour,
    season: p.season,
    year: p.year,
    usage: p.usage,
    productDisplay: p.productdisplay,
    rentalpriceperday: p.rentalpriceperday,
    securityDeposit: p.securitydeposit,
    imageUrl: p.imageurl,
    rating: Number(p.calculated_rating).toFixed(1),
    reviewCount: Number(p.review_count)
  }

  const canReview = await checkReviewEligibility(productId)
  const reviews = await getProductReviews(productId)

  // PASS THE AI COMPONENT AS CHILDREN
  return (
    <ProductDetailClient product={product} canReview={canReview} initialReviews={reviews}>
      <YouMayAlsoLike 
        currentProduct={{
          id: product.id,
          productDisplay: product.productDisplay,
          mastercategory: product.mastercategory,
          gender: product.gender
        }} 
      />
      <SmartCompleteTheLook 
        currentProduct={{
          id: product.id,
          productDisplay: product.productDisplay,
          mastercategory: product.mastercategory,
          subcategory: product.subcategory, // Zaroori hai filter ke liye
          gender: product.gender,
          basecolour: product.basecolour,   // Zaroori hai color matching ke liye
          usage: product.usage              // Zaroori hai occasion (casual/formal) ke liye
        }} 
      />
    </ProductDetailClient>
  )
}