'use server'

import { revalidatePath } from 'next/cache'
import { sql } from './db'
import { auth } from '@clerk/nextjs/server' 
import { verifyAdminSession } from "@/lib/admin-actions"
import { currentUser } from '@clerk/nextjs/server'
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { extractProductData } from "@/lib/import-action" // Reusing the scraper engine you already built!

// Get REAL user ID from Clerk and sync them to Neon
async function getUserId(): Promise<string> {
  const user = await currentUser()
  
  if (!user) {
    throw new Error('You must be signed in to do this.')
  }
  
  // 1. Grab their primary email from Clerk
  const email = user.emailAddresses[0]?.emailAddress || 'no-email@example.com'
  
  // 2. Quietly introduce this user to the Neon database so strict relationships don't crash!
  // If they already exist, the "ON CONFLICT DO NOTHING" rule just skips this step.
  await sql`
    INSERT INTO users (id, email) 
    VALUES (${user.id}, ${email})
    ON CONFLICT (id) DO NOTHING
  `
  
  return user.id
}

// ... Keep your toggleWishlist, updateCart, and checkout functions exactly the same!
export async function toggleWishlist(productId: number) {
  try {
    const userId = await getUserId()

    // Check if product is already wishlisted
    const existing = await sql`
      SELECT * FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}
    `

    if (existing.length > 0) {
      // Remove from wishlist
      await sql`
        DELETE FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}
      `
    } else {
      // Add to wishlist
      await sql`
        INSERT INTO wishlist (user_id, product_id) VALUES (${userId}, ${productId})
      `
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('[v0] toggleWishlist error:', error)
    throw new Error('Failed to update wishlist')
  }
}

export async function updateCart(items: Array<{ productId: number; quantity: number }>) {
  try {
    const userId = await getUserId()

    // Clear existing cart
    await sql`
      DELETE FROM cart WHERE user_id = ${userId}
    `

    // Insert new items
    for (const item of items) {
      await sql`
        INSERT INTO cart (user_id, product_id, quantity)
        VALUES (${userId}, ${item.productId}, ${item.quantity})
      `
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] updateCart error:', error)
    throw new Error('Failed to update cart')
  }
}

export async function checkout(productIds: number[], totalPaid: number) {
  try {
    const userId = await getUserId()

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (user_id, status, total_paid)
      VALUES (${userId}, 'pending', ${totalPaid})
      RETURNING id
    `

    const orderId = orderResult[0].id

    // Insert order items
    for (const productId of productIds) {
      await sql`
        INSERT INTO order_items (order_id, product_id, rental_days)
        VALUES (${orderId}, ${productId}, 3)
      `
    }

    // Clear cart
    await sql`
      DELETE FROM cart WHERE user_id = ${userId}
    `

    revalidatePath('/profile')
    return { success: true, orderId }
  } catch (error) {
    console.error('[v0] checkout error:', error)
    throw new Error('Failed to complete checkout')
  }
}

export async function fetchUserWishlist() {
  try {
    const userId = await getUserId()

    const wishlistItems = await sql`
      SELECT p.* FROM products p
      INNER JOIN wishlist w ON p.id = w.product_id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `

    return wishlistItems
  } catch (error) {
    console.error('[v0] fetchUserWishlist error:', error)
    return []
  }
}

export async function fetchUserOrders() {
  try {
    const userId = await getUserId()

    const orders = await sql`
      SELECT o.id, o.status, o.total_paid, o.created_at,
             json_agg(json_build_object('product_id', oi.product_id, 'rental_days', oi.rental_days)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${userId}
      GROUP BY o.id, o.status, o.total_paid, o.created_at
      ORDER BY o.created_at DESC
    `

    return orders
  } catch (error) {
    console.error('[v0] fetchUserOrders error:', error)
    return []
  }
}

export async function getWishlistStatus(productId: number) {
  try {
    const userId = await getUserId()

    const result = await sql`
      SELECT * FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}
    `

    return result.length > 0
  } catch (error) {
    console.error('[v0] getWishlistStatus error:', error)
    return false
  }
}
// Add this to the bottom of lib/actions.ts

export async function updateOrderStatus(orderId: number, newStatus: string) {
  try {
    // 1. Ensure the user is logged in (later you can add Clerk Admin role checks here)
    const isAdmin = await verifyAdminSession()
    
    if (!isAdmin) {
      throw new Error("Unauthorized: Only admins can update order statuses.")
    }
    // 2. Update the status in the Neon database
    await sql`
      UPDATE orders 
      SET status = ${newStatus}
      WHERE id = ${orderId}
    `
    
    // 3. Force Next.js to refresh the admin page and the user's profile page
    revalidatePath('/admin/orders')
    revalidatePath('/profile')
    revalidatePath(`/order/${orderId}`)
    
    return { success: true }
  } catch (error) {
    console.error("Failed to update order status:", error)
    throw new Error("Failed to update order status")
  }
}
// Fetch the cart on page load
export async function fetchCart() {
  try {
    const userId = await getUserId() // Guarantees user exists in Neon
    const dbCart = await sql`
      SELECT c.quantity, p.* 
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ${userId}
    `
    // Map database rows back to your frontend Product interface
    return dbCart.map((row) => ({
      product: {
        id: row.id,
        productDisplay: row.productdisplay,
        gender: row.gender,
        masterCategory: row.mastercategory,
        subCategory: row.subcategory,
        articleType: row.articletype,
        baseColour: row.basecolour,
        season: row.season,
        year: row.year,
        usage: row.usage,
        rentalPricePerDay: row.rentalpriceperday,
        securityDeposit: row.securitydeposit,
        imageUrl: row.imageurl,
      },
      rentalDays: row.quantity, // Mapping your DB 'quantity' to frontend 'rentalDays'
    }))
  } catch (error) {
    console.error("Failed to fetch cart:", error)
    return []
  }
}

// Upsert item to cart
export async function syncCartItem(productId: number, quantity: number) {
  try {
    const userId = await getUserId()
    await sql`
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (${userId}, ${productId}, ${quantity})
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET quantity = ${quantity}
    `
  } catch (error) {
    console.error("Failed to sync cart item:", error)
  }
}

// Remove single item
export async function removeCartItemDB(productId: number) {
  try {
    const userId = await getUserId()
    await sql`DELETE FROM cart WHERE user_id = ${userId} AND product_id = ${productId}`
  } catch (error) {
    console.error("Failed to remove item:", error)
  }
}

// Clear entire cart (Call this inside your checkout function!)
export async function clearUserCartDB() {
  try {
    const userId = await getUserId()
    await sql`DELETE FROM cart WHERE user_id = ${userId}`
  } catch (error) {
    console.error("Failed to clear cart:", error)
  }
}
// Fetch the user's wishlist on page load
export async function getUserWishlist() {
  try {
    const userId = await getUserId()
    const dbWishlist = await sql`
      SELECT product_id FROM wishlist WHERE user_id = ${userId}
    `
    // Return an array of just the product IDs
    return dbWishlist.map((row) => row.product_id)
  } catch (error) {
    console.error("Failed to fetch wishlist:", error)
    return [] // Return empty array if not logged in
  }
}
// --- Add to the bottom of lib/actions.ts ---

export async function getSearchResults(query: string) {
  if (!query) return []
  
  const searchTerm = `%${query}%`
  
  try {
    const dbResults = await sql`
      SELECT id, productdisplay, articletype, rentalpriceperday, imageurl
      FROM products
      WHERE productdisplay ILIKE ${searchTerm} 
         OR articletype ILIKE ${searchTerm}
         OR mastercategory ILIKE ${searchTerm}
      LIMIT 5
    `
    
    return dbResults.map(p => ({
      id: p.id,
      productDisplay: p.productdisplay,
      articleType: p.articletype,
      rentalPricePerDay: p.rentalpriceperday,
      imageUrl: p.imageurl
    }))
  } catch (error) {
    console.error("Search failed:", error)
    return []
  }
}
// --- Add to the bottom of lib/actions.ts ---

// Fetch user's recent searches from DB
export async function getUserSearchHistory() {
  try {
    const userId = await getUserId()
    const dbHistory = await sql`
      SELECT search_query 
      FROM search_history 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 5
    `
    return dbHistory.map(row => row.search_query)
  } catch (error) {
    return [] // Returns empty if not logged in
  }
}

// Save or update a search query
export async function saveSearchQuery(query: string) {
  if (!query.trim()) return
  try {
    const userId = await getUserId()
    await sql`
      INSERT INTO search_history (user_id, search_query)
      VALUES (${userId}, ${query.trim()})
      ON CONFLICT (user_id, search_query) 
      DO UPDATE SET created_at = now()
    `
  } catch (error) {
    console.error("Failed to save search history", error)
  }
}

// Delete a single search history item
export async function deleteSearchQuery(query: string) {
  try {
    const userId = await getUserId()
    await sql`
      DELETE FROM search_history 
      WHERE user_id = ${userId} AND search_query = ${query}
    `
  } catch (error) {
    console.error("Failed to delete search query", error)
  }
}

// Clear all search history for user
export async function clearAllSearchHistory() {
  try {
    const userId = await getUserId()
    await sql`DELETE FROM search_history WHERE user_id = ${userId}`
  } catch (error) {
    console.error("Failed to clear search history", error)
  }
}

// (Keep your other imports like 'sql' here)

// 1. Fetch Reviews (Fixed: Removed non-existent 'users' table join)
export async function getProductReviews(productId: number) {
  try {
    const reviews = await sql`
      SELECT * FROM reviews 
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
    `
    return reviews
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return []
  }
}

// 2. Eligibility Check (Fixed: Explicitly using Clerk auth)
export async function checkReviewEligibility(productId: number) {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const result = await sql`
      SELECT 1 FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${userId} 
        AND oi.product_id = ${productId}
        AND (o.status = 'Active' OR o.status = 'Returned')
      LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error("Eligibility check failed:", error)
    return false
  }
}

// 3. Submit Review (Fixed: Added Server-Side Lock)
export async function submitReview(productId: number, rating: number, comment: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("You must be logged in to review.")

    // SERVER-SIDE LOCK: Verify they actually rented it before saving!
    const isEligible = await checkReviewEligibility(productId)
    if (!isEligible) {
      throw new Error("You can only review items you have previously rented.")
    }

    await sql`
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES (${productId}, ${userId}, ${rating}, ${comment})
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = now()
    `
  } catch (error: any) {
    console.error("Review submission failed:", error)
    throw new Error(error.message || "Failed to submit review")
  }
}
// Make sure you already have 'auth' and 'sql' imported at the top from previous steps!

// --- ADDRESS ACTIONS ---

export async function getUserAddresses() {
  try {
    const { userId } = await auth()
    if (!userId) return []

    const dbAddresses = await sql`
      SELECT * FROM addresses 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `
    
    return dbAddresses.map(a => ({
      id: a.id,
      fullName: a.full_name,
      phoneNumber: a.phone_number,
      streetAddress: a.street_address,
      city: a.city,
      state: a.state,
      postalCode: a.postal_code
    }))
  } catch (error) {
    console.error("Failed to fetch addresses:", error)
    return []
  }
}

export async function addAddress(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const fullName = formData.get("fullName") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const streetAddress = formData.get("streetAddress") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string

    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !postalCode) {
      throw new Error("All fields are required")
    }

    await sql`
      INSERT INTO addresses (user_id, full_name, phone_number, street_address, city, state, postal_code)
      VALUES (${userId}, ${fullName}, ${phoneNumber}, ${streetAddress}, ${city}, ${state}, ${postalCode})
    `

    // Instantly refresh any page that displays addresses
    revalidatePath('/profile')
    revalidatePath('/checkout')
    
    return { success: true }
  } catch (error: any) {
    console.error("Failed to add address:", error)
    return { success: false, error: error.message }
  }
}
// --- ORDER CHECKOUT ACTION ---

export async function createOrder(orderData: {
  cartItems: { productId: number; rentalDays: number; price: number }[];
  addressId: number;
  deliveryType: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
}) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // 1. Insert the main order
    const orderResult = await sql`
      INSERT INTO orders (
        user_id, 
        total_paid, 
        status, 
        address_id, 
        delivery_type, 
        rental_start, 
        rental_end, 
        payment_method
      )
      VALUES (
        ${userId}, 
        ${orderData.totalAmount}, 
        'Processing', 
        ${orderData.addressId}, 
        ${orderData.deliveryType}, 
        ${orderData.startDate}, 
        ${orderData.endDate}, 
        'COD'
      )
      RETURNING id
    `
    const newOrderId = orderResult[0].id

    // 2. Insert all the individual items into order_items
    for (const item of orderData.cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, rental_days, price_at_rental)
        VALUES (${newOrderId}, ${item.productId}, ${item.rentalDays}, ${item.price})
      `
    }
    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    revalidatePath('/profile')
    return { success: true, orderId: newOrderId }
  } catch (error: any) {
    console.error("Checkout failed:", error)
    return { success: false, error: error.message }
  }
}
// --- ADDRESS UPDATE & DELETE ACTIONS ---

export async function updateAddress(id: number, formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const fullName = formData.get("fullName") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const streetAddress = formData.get("streetAddress") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string

    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !postalCode) {
      throw new Error("All fields are required")
    }

    await sql`
      UPDATE addresses 
      SET full_name = ${fullName}, phone_number = ${phoneNumber}, street_address = ${streetAddress}, 
          city = ${city}, state = ${state}, postal_code = ${postalCode}
      WHERE id = ${id} AND user_id = ${userId}
    `

    revalidatePath('/profile')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update address:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteAddress(id: number) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    await sql`DELETE FROM addresses WHERE id = ${id} AND user_id = ${userId}`

    revalidatePath('/profile')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete address:", error)
    return { success: false, error: error.message }
  }
}
// ==========================================
// --- HELPDESK ACTIONS (CUSTOMER SIDE) ---
// ==========================================

export async function submitComplaint(formData: FormData) {
  try {
    const userId = await getUserId() // Uses your existing Clerk getUserId() function
    
    const subject = formData.get("subject") as string
    const description = formData.get("description") as string

    if (!subject || !description) throw new Error("Missing fields")

    await sql`
      INSERT INTO helpdesk_tickets (user_id, subject, description)
      VALUES (${userId}, ${subject}, ${description})
    `
    revalidatePath('/helpdesk')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to submit complaint:", error)
    return { success: false, error: error.message }
  }
}

export async function fetchUserComplaints() {
  try {
    const userId = await getUserId()
    const tickets = await sql`
      SELECT id, subject, description, status, admin_reply, created_at, resolved_at
      FROM helpdesk_tickets
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return tickets.map(t => ({
      id: t.id,
      subject: t.subject,
      description: t.description,
      status: t.status,
      adminReply: t.admin_reply,
      createdAt: new Date(t.created_at).toLocaleDateString(),
      resolvedAt: t.resolved_at ? new Date(t.resolved_at).toLocaleDateString() : null
    }))
  } catch (error) {
    return []
  }
}
// Replace trackProductView with this upgraded version:
export async function trackProductEngagement(
  productId: number, 
  actionType: "view" | "wishlist" | "order" = "view"
) {
  try {
    const { userId } = await auth()
    if (!userId) return

    // Assign mathematical weights to user actions
    let weight = 1
    if (actionType === "wishlist") weight = 3
    if (actionType === "order") weight = 5

    // Upsert the data, adding the specific weight to their score
    await sql`
      INSERT INTO user_views (user_id, product_id, view_count)
      VALUES (${userId}, ${productId}, ${weight})
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET 
        viewed_at = CURRENT_TIMESTAMP,
        view_count = user_views.view_count + ${weight}
    `
  } catch (error) {
    console.error("Engagement tracking failed:", error)
  }
}
// Helper to keep our data formatting consistent
const formatProduct = (p: any) => ({
  id: p.id,
  name: p.productdisplay || "Untitled Product",
  price: Number(p.rentalpriceperday || 0),
  imageUrl: p.imageurl || `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${p.id}.jpg`,
  gender: p.gender || "",
  category: p.mastercategory || "",
})
export async function getRecentlyViewed() {
  const { userId } = await auth()
  
  // If no user, return an empty array
  if (!userId) return []

  try {
    const rawProducts = await sql`
      SELECT p.* FROM products p
      JOIN user_views uv ON p.id = uv.product_id
      WHERE uv.user_id = ${userId}
      ORDER BY uv.viewed_at DESC
      LIMIT 10
    `

    // Map the raw SQL data into clean Frontend props
    return rawProducts.map(formatProduct)
  } catch (error) {
    console.error("Failed to fetch recently viewed:", error)
    return []
  }
}
export async function getTopPicks() {
  const { userId } = await auth()
  if (!userId) return []

  try {
    const rawProducts = await sql`
      WITH UserPreferences AS (
        -- 1. Calculate favorite Category AND Gender combinations
        SELECT p.mastercategory, p.gender, SUM(uv.view_count) as interest_score
        FROM user_views uv
        JOIN products p ON uv.product_id = p.id
        WHERE uv.user_id = ${userId}
        GROUP BY p.mastercategory, p.gender
        ORDER BY interest_score DESC
        LIMIT 2
      )
      -- 2. Fetch new products matching BOTH the category and the gender
      SELECT p.*, up.interest_score 
      FROM products p
      JOIN UserPreferences up 
        ON p.mastercategory = up.mastercategory 
        AND p.gender = up.gender
      WHERE p.id NOT IN (
        SELECT product_id FROM user_views WHERE user_id = ${userId}
      )
      ORDER BY up.interest_score DESC, p.created_at DESC
      LIMIT 10;
    `

    // Fallback: If they haven't viewed anything yet, show latest items
    if (rawProducts.length === 0) {
      const fallbackProducts = await sql`
        SELECT * FROM products ORDER BY id DESC LIMIT 10
      `
      return fallbackProducts.map(formatProduct)
    }

    return rawProducts.map(formatProduct)
  } catch (error) {
    console.error("Failed to fetch recommendations:", error)
    return []
  }
}
export async function getTrendingNow() {
  try {
    // Sum up the engagement scores from ALL users over the last 7 days
    const rawProducts = await sql`
      SELECT p.*, SUM(uv.view_count) as total_global_score
      FROM products p
      JOIN user_views uv ON p.id = uv.product_id
      WHERE uv.viewed_at >= NOW() - INTERVAL '7 days'
      GROUP BY p.id
      ORDER BY total_global_score DESC
      LIMIT 10
    `
    
    // Fallback if the site is brand new and has no recent traffic
    if (rawProducts.length === 0) {
      const fallbackProducts = await sql`SELECT * FROM products ORDER BY id DESC LIMIT 10`
      return fallbackProducts.map(formatProduct)
    }

    return rawProducts.map(formatProduct)
  } catch (error) {
    console.error("Failed to fetch trending:", error)
    return []
  }
}



// Step 1: User asks for a preview
export async function getPreviewForUser(url: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Please log in to request a custom item.")

  // We literally just reuse the Admin scraping logic here to get the draft
  const response = await extractProductData(url)
  return response
}

// Step 2: User confirms and submits the request
export async function submitCustomOrderRequest(data: {
  url: string;
  title: string;
  imageUrl: string;
  estimatedPrice: number;
  startDate: string;
  endDate: string;
}) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // Insert into the "Limbo" table
    await sql`
      INSERT INTO product_requests (
        user_id, target_url, scraped_title, scraped_image_url, 
        estimated_rental_price, rental_start_date, rental_end_date
      ) VALUES (
        ${userId}, ${data.url}, ${data.title}, ${data.imageUrl}, 
        ${data.estimatedPrice}, ${data.startDate}, ${data.endDate}
      )
    `
    return { success: true }
  } catch (error: any) {
    console.error("Custom Request Error:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserNotifications() {
  const { userId } = await auth()
  if (!userId) return { success: false, data: [] }

  // JOIN with products to get the image, title, AND financial data for the Cart Context
  // Note: Ensure your table is named `notifications` or `user_notifications` based on what you ran in Neon
  const notifications = await sql`
    SELECT 
      n.*, 
      p.imageUrl, 
      p.productDisplay, 
      p.rentalPricePerDay, 
      p.securityDeposit 
    FROM user_notifications n
    JOIN products p ON n.product_id = p.id
    WHERE n.user_id = ${userId}
    ORDER BY n.created_at DESC
  `
  return { success: true, data: notifications }
}

export async function markNotificationAsRead(notificationId: number) {
  const { userId } = await auth()
  if (!userId) return { success: false }

  await sql`
    UPDATE user_notifications 
    SET is_read = TRUE 
    WHERE id = ${notificationId} AND user_id = ${userId}
  `
  return { success: true }
}
// lib/actions.ts ke bottom me add karo:

export async function generateSmartStyleMatch(product: any) {
  try {
       const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';

    const response = await fetch(`${pythonUrl}/api/style-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: product.id,
        productDisplay: product.productDisplay ,
        gender: product.gender ,
        subcategory: product.subcategory , // lowercase matching your db
        basecolour: product.basecolour,   // lowercase matching your db
        usage: product.usage ,
        limit: 4
      }),
      // 'no-store' ensures it fetches fresh every time they click "Generate Again"
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error("Python API returned an error");
    }
    
    const data = await response.json();
    return { success: true, data: data.data, aiThought: data.ai_thought };
    
  } catch (error) {
    console.error("AI Generation Failed:", error);
    return { success: false, error: "Something went wrong" };
  }
}
// --- Add to your lib/actions.ts ---
export async function createMuseOutfit(prompt: string, gender: string = "Men") {
  try {
    const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${pythonUrl}/api/generate-outfit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, gender }),
      cache: 'no-store'
    });

    if (!response.ok) {
       console.error("Python API Error:", await response.text());
       throw new Error("MuseAI Backend Failed");
    }
    
    const data = await response.json();
    
    // NEW SAFETY CHECK: Ensure data.outfit actually exists and is an array
    if (data.error || !data.outfit || !Array.isArray(data.outfit)) {
        console.error("Python returned invalid data:", data);
        return { success: false, error: data.error || "Invalid response format" };
    }

    return { success: true, vibe: data.vibe, outfit: data.outfit };
  } catch (error) {
    console.error("Outfit Gen Error:", error);
    return { success: false, error: "Failed to create outfit" };
  }
}
export async function saveOutfitToProfile(name: string, vibe: string, gender: string, productIds: number[]) {
  try {
    // 1. Clerk se current user nikalo
    const user = await currentUser();
    
    // Agar user logged in nahi hai, toh hum null save karenge (ya tu chahe toh error throw kar sakta hai)
    const userId = user ? user.id : null;

    // 2. user_id ko database me insert karo
    await sql`
      INSERT INTO user_outfits (user_id, outfit_name, vibe_text, gender, product_ids)
      VALUES (${userId}, ${name}, ${vibe}, ${gender}, ${productIds as any})
    `;
    revalidatePath('/muse-ai');
    return { success: true };
  } catch (error) {
    console.error("Failed to save outfit:", error);
    return { success: false };
  }
}