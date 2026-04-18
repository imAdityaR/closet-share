"use server"

import * as cheerio from "cheerio"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"

function extractBestEffortDetails(title: string, description: string) {
  const text = (title + " " + description).toLowerCase()
  
  let gender = ""
  if (text.includes("men") || text.includes("boy")) gender = "Men"
  else if (text.includes("women") || text.includes("girl")) gender = "Women"
  else if (text.includes("unisex")) gender = "Unisex"

  let baseColour = ""
  const colors = ["black", "white", "red", "blue", "green", "yellow", "navy", "grey", "brown", "beige"]
  for (const color of colors) {
    if (text.includes(color)) {
      baseColour = color.charAt(0).toUpperCase() + color.slice(1)
      break
    }
  }

  let season = ""
  if (text.includes("summer") || text.includes("linen")) season = "Summer"
  else if (text.includes("winter") || text.includes("wool") || text.includes("jacket")) season = "Winter"

  return { gender, baseColour, season }
}

// STEP 1: SCRAPE & UPLOAD TO CLOUDINARY (No Database Touch)
export async function extractProductData(targetUrl: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const scraperApiKey = process.env.SCRAPER_API_KEY
    if (!scraperApiKey) throw new Error("Scraper API key missing")
    
    const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(targetUrl)}`
    const response = await fetch(scraperUrl)
    if (!response.ok) throw new Error("Failed to scrape target website.")
    const html = await response.text()

    const $ = cheerio.load(html)
    const title = $('meta[property="og:title"]').attr('content') || $('title').text()
    const description = $('meta[property="og:description"]').attr('content') || ""
    const rawImageUrl = $('meta[property="og:image"]').attr('content')

    if (!title || !rawImageUrl) throw new Error("Could not find product title or image.")

    const rawPrice = $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content') || "0"
    const numericPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0
    const rentalPricePerDay = Math.round(numericPrice / 6)
    const securityDeposit = Math.round(numericPrice / 2)

    const { gender, baseColour, season } = extractBestEffortDetails(title, description)

    const uploadResult = await cloudinary.uploader.upload(rawImageUrl, {
      folder: "CLOSETSHARE-IMAGES",
      resource_type: "image",
    })

    // Return the DRAFT data to the frontend
    return { 
      success: true, 
      data: {
        productDisplay: title,
        imageUrl: uploadResult.secure_url,
        rentalPricePerDay: rentalPricePerDay || 199, // Fallback if 0
        securityDeposit: securityDeposit || 1000,   // Fallback if 0
        gender,
        baseColour,
        season,
        masterCategory: "",
        subCategory: "",
        articleType: "",
        year: new Date().getFullYear().toString(),
        usage: ""
      } 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// STEP 2: SAVE FINAL DATA TO NEON

// Add this to your existing lib/import-action.ts

// 1. Fetch pending requests for the admin dashboard
export async function getPendingRequests() {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    // Fetch pending requests and join with users to get the email
    const requests = await sql`
      SELECT pr.*, u.email as user_email 
      FROM product_requests pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.status = 'PENDING'
      ORDER BY pr.created_at DESC
    `
    return { success: true, data: requests }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 2. Update your existing saveProductToDatabase function to handle Orders
// Inside lib/import-action.ts

export async function saveProductToDatabase(finalData: any, requestContext?: { requestId: number, userId: string }) {
  try {
    const { userId: adminId } = await auth()
    if (!adminId) throw new Error("Unauthorized")

    // 1. Insert the Product
    const productResult = await sql`
      INSERT INTO products (
        id, productDisplay, imageUrl, rentalPricePerDay, securityDeposit,
        gender, baseColour, season, masterCategory, subCategory, articleType, year, usage
      ) 
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM products),
        ${finalData.productDisplay}, ${finalData.imageUrl}, ${finalData.rentalPricePerDay}, ${finalData.securityDeposit},
        ${finalData.gender || null}, ${finalData.baseColour || null}, ${finalData.season || null}, 
        ${finalData.masterCategory || null}, ${finalData.subCategory || null}, ${finalData.articleType || null}, 
        ${finalData.year ? parseInt(finalData.year) : null}, ${finalData.usage || null}
      )
      RETURNING id
    `
    const newProductId = productResult[0].id

    // 2. If it came from a user request, notify them!
    if (requestContext) {
      const polishedMessage = `Great news! The "${finalData.productDisplay}" you requested has been sourced, verified, and added to the catalog.`
      
      await sql`
        INSERT INTO user_notifications (user_id, product_id, message)
        VALUES (${requestContext.userId}, ${newProductId}, ${polishedMessage})
      `

      await sql`
        UPDATE product_requests 
        SET status = 'APPROVED' 
        WHERE id = ${requestContext.requestId}
      `
    }

    // --- AI INTEGRATION: Trigger background vectorization ---
   const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';
    await fetch(`${pythonUrl}/api/vectorize-single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newProductId }),
    }).catch(err => console.error("AI Background Vectorization Failed:", err));
    // --------------------------------------------------------

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}