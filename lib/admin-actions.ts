"use server"
import { revalidatePath } from 'next/cache'
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"

export async function loginAdmin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  try {
    const result = await sql`
      SELECT id FROM admin_users 
      WHERE username = ${username} AND password = ${password}
      LIMIT 1
    `

    if (result.length === 0) {
      return { error: "Invalid username or password" }
    }

    // Set a secure HTTP-only cookie to establish the admin session
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

  } catch (error) {
    console.error("Admin login error:", error)
    return { error: "An error occurred during login" }
  }

  // Redirect must happen outside the try-catch
  redirect("/admin")
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/admin/login")
}

// Utility to verify the cookie in server components
export async function verifyAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")
  return session?.value === "authenticated"
}
// --- ADMIN DASHBOARD METRICS ---

export async function getAdminDashboardMetrics() {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) throw new Error("Unauthorized Access")

    // 1. Notice we changed "status = '...'" to "status ILIKE '...'" to ignore uppercase/lowercase mismatches
    const stats = await sql`
      SELECT 
        (SELECT COALESCE(SUM(total_paid), 0) FROM orders) as total_revenue,
        (SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status ILIKE 'active') as active_rentals,
        (SELECT COUNT(*) FROM orders WHERE status ILIKE 'processing') as pending_orders,
        (SELECT COUNT(*) FROM products) as total_products
    `

    // 2. Notice we used ILIKE and changed ASC to DESC so the newest orders appear at the top!
    const recentOrders = await sql`
      SELECT o.id, o.created_at, o.total_paid, a.full_name as customer_name
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.status ILIKE 'processing'
      ORDER BY o.created_at DESC
      LIMIT 10
    `

    return {
      stats: {
        revenue: Number(stats[0].total_revenue),
        active: Number(stats[0].active_rentals),
        pending: Number(stats[0].pending_orders),
        products: Number(stats[0].total_products)
      },
      actionNeeded: recentOrders.map(o => ({
        id: o.id,
        customerName: o.customer_name || "Unknown",
        total: Number(o.total_paid),
        date: new Date(o.created_at).toLocaleDateString()
      }))
    }
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error)
    return null
  }
}
// --- ADMIN ORDER DETAILS ACTION ---
export async function getAdminOrderDetails(orderId: string) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) throw new Error("Unauthorized Access")

    console.log("--- SEARCHING FOR ORDER ID:", orderId, "---")

    // The rest of this function stays EXACTLY the same as the 2-step 
    // version I gave you previously. 
    const orderRes = await sql`
      SELECT 
        o.id, o.created_at, o.status, o.total_paid, 
        o.delivery_type, o.rental_start, o.rental_end, o.payment_method,
        u.email as user_email, 
        a.full_name, a.phone_number, a.street_address, a.city, a.state, a.postal_code
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.id = ${orderId} 
    `

    // If the order itself doesn't exist, stop here.
    if (orderRes.length === 0) {
      console.log("❌ DB returned 0 rows for Order ID:", orderId)
      return null
    }

    const o = orderRes[0]
    console.log("✅ Order found! Fetching items...")

    // STEP 2: Fetch the items for this specific order
    const itemsRes = await sql`
      SELECT 
        p.id, 
        p.productdisplay as name, 
        p.imageurl,
        oi.rental_days, 
        oi.price_at_rental
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
    `

    console.log(`✅ Found ${itemsRes.length} items for this order.`)

    // STEP 3: Combine them cleanly in JavaScript
    return {
      id: o.id,
      status: o.status,
      totalPaid: Number(o.total_paid),
      deliveryType: o.delivery_type,
      rentalStart: o.rental_start ? new Date(o.rental_start).toLocaleDateString() : "N/A",
      rentalEnd: o.rental_end ? new Date(o.rental_end).toLocaleDateString() : "N/A",
      paymentMethod: o.payment_method || "COD",
      createdAt: new Date(o.created_at).toLocaleString(),
      customer: {
        name: o.full_name || "Unknown",
        email: o.user_email || "No Email",
        phone: o.phone_number || "N/A",
        address: `${o.street_address}, ${o.city}, ${o.state} ${o.postal_code}`
      },
      items: itemsRes.map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageurl,
        rental_days: item.rental_days,
        price_at_rental: item.price_at_rental
      }))
    }
  } catch (error: any) {
    console.error("CRITICAL DETAILS ERROR:", error)
    throw new Error(`Failed to fetch details: ${error.message}`)
  }
}

// ==========================================
// --- HELPDESK ACTIONS (ADMIN SIDE) ---
// ==========================================

export async function fetchAdminComplaints() {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) throw new Error("Unauthorized")

    const tickets = await sql`
      SELECT t.id, t.subject, t.description, t.status, t.admin_reply, t.created_at, u.email as user_email
      FROM helpdesk_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY 
        CASE WHEN t.status = 'Pending' THEN 1 ELSE 2 END,
        t.created_at DESC
    `
    return tickets.map(t => ({
      id: t.id,
      userEmail: t.user_email || "Unknown User",
      subject: t.subject,
      description: t.description,
      status: t.status,
      adminReply: t.admin_reply,
      createdAt: new Date(t.created_at).toLocaleDateString()
    }))
  } catch (error) {
    return []
  }
}

export async function resolveComplaint(ticketId: number, reply: string) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) throw new Error("Unauthorized")

    await sql`
      UPDATE helpdesk_tickets
      SET status = 'Resolved', admin_reply = ${reply}, resolved_at = now()
      WHERE id = ${ticketId}
    `
    revalidatePath('/admin/helpdesk')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
// ==========================================
// --- INVENTORY ACTIONS (ADMIN SIDE) ---
// ==========================================

export async function addProduct(data: {
  productDisplay: string;
  gender: string;
  mastercategory: string;
  subcategory: string;
  articletype: string;
  basecolour: string;
  season: string;
  usage: string;
  rentalpriceperday: number;
  securitydeposit: number;
  imageurl: string;
}) {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) throw new Error("Unauthorized Access")

    // THE FIX: Added RETURNING id at the end to capture the new product's ID
    const result = await sql`
      INSERT INTO products (
        id,
        productdisplay, 
        gender, 
        mastercategory, 
        subcategory,
        articletype,
        basecolour,
        season,
        usage,
        rentalpriceperday, 
        securitydeposit, 
        imageurl
      ) VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM products), 
        ${data.productDisplay}, 
        ${data.gender}, 
        ${data.mastercategory}, 
        ${data.subcategory},
        ${data.articletype},
        ${data.basecolour},
        ${data.season},
        ${data.usage},
        ${data.rentalpriceperday},  
        ${data.securitydeposit}, 
        ${data.imageurl}
      )
      RETURNING id
    `
    
    const newProductId = result[0].id;
    const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';
    // --- AI INTEGRATION: Trigger background vectorization ---
    await fetch(`${pythonUrl}/api/vectorize-single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newProductId }),
    }).catch(err => console.error("AI Background Vectorization Failed:", err));
    // --------------------------------------------------------

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to add product:", error)
    return { success: false, error: error.message }
  }
}
export async function fetchAdminInventory() {
  try {
    const isAdmin = await verifyAdminSession()
    if (!isAdmin) throw new Error("Unauthorized Access")
  const inventory = await sql`
    SELECT 
      id, 
      productdisplay, 
      mastercategory, 
      season,           -- MUST BE SELECTED
      usage,            -- MUST BE SELECTED
      articletype,      -- MUST BE SELECTED
      rentalpriceperday, 
      imageurl
    FROM products
  `
  return inventory.map(p => ({
    id: p.id,
    name: p.productdisplay,
    category: p.mastercategory,
    season: p.season,           // MAP IT HERE
    usage: p.usage,             // MAP IT HERE
    articleType: p.articletype, // MAP IT HERE
    price: Number(p.rentalpriceperday),
    imageUrl: p.imageurl
  }))} catch (error) {
    console.error("Failed to fetch inventory:", error)
    return []
  }
}

export async function fetchProductById(id: number) {
  try {
    const result = await sql`SELECT * FROM products WHERE id = ${id}`
    if (result.length === 0) return { success: false, error: "Product not found." }
    return { success: true, data: result[0] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProduct(id: number, data: any) {
  try {
    await sql`
      UPDATE products SET
        productDisplay = ${data.productDisplay},
        imageurl = ${data.imageurl},
        rentalpriceperday = ${data.rentalpriceperday},
        securitydeposit = ${data.securitydeposit},
        gender = ${data.gender},
        mastercategory = ${data.mastercategory},
        subcategory = ${data.subcategory},
        articletype = ${data.articletype},
        basecolour = ${data.basecolour},
        season = ${data.season},
        usage = ${data.usage}
      WHERE id = ${id}
    `
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}