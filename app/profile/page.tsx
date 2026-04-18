import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { ProfileClient } from "@/components/profile-client"
// 1. ADD THIS IMPORT:
import { getUserAddresses } from "@/lib/actions"

export default async function ProfilePage() {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  // Fetch Real Wishlist
  const dbWishlist = await sql`
    SELECT p.* FROM products p
    INNER JOIN wishlist w ON p.id = w.product_id
    WHERE w.user_id = ${user.id}
  `

  const wishlistProducts = dbWishlist.map((p) => ({
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

  // Fetch Real Orders WITH their connected items
  const dbOrders = await sql`
    SELECT 
      o.id,
      o.created_at,
      o.status,
      o.total_paid,
      COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.productdisplay
          )
        ) FILTER (WHERE p.id IS NOT NULL), 
        '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ${user.id}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `

  const orderHistory = dbOrders.map((o) => {
    const startDate = new Date(o.created_at)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 3)

    return {
      id: `ORD-${o.id}`,
      rawId: o.id,
      items: o.items || [], 
      totalPaid: Number(o.total_paid || o.totalamount || 0),
      status: o.status || "Active",
      rentalDates: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    }
  })

  // 2. FETCH ADDRESSES:
  const addresses = await getUserAddresses()

  // 3. FETCH SAVED OUTFITS:
  const savedOutfits = await sql`
    SELECT 
      uo.id as outfit_id, 
      uo.outfit_name, 
      uo.vibe_text, 
      uo.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'imageurl', p.imageurl,
            'rentalpriceperday', p.rentalpriceperday,
            'subcategory', p.subcategory
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) as items
    FROM user_outfits uo
    LEFT JOIN products p ON p.id = ANY(uo.product_ids)
    WHERE uo.user_id = ${user.id}
    GROUP BY uo.id
    ORDER BY uo.created_at DESC;
  `;

  // 4. PASS THEM AS PROPS:
  return <ProfileClient wishlistProducts={wishlistProducts} orderHistory={orderHistory} addresses={addresses} savedOutfits={savedOutfits} />
}