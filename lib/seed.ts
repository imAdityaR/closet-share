import { sql } from './db'
import realKaggleData from './products-data.json'

export interface Product {
  id: number
  gender: string
  masterCategory: string
  subCategory: string
  articleType: string
  baseColour: string
  season: string
  year: number
  usage: string
  productDisplay: string
  rentalPricePerDay: number
  securityDeposit: number
}

// Whitelist of premium rental-worthy article types
const PREMIUM_ARTICLE_TYPES = [
  "Dresses",
  "Blazers",
  "Suits",
  "Jackets",
  "Lehengas",
  "Sarees",
  "Sherwanis",
  "Gowns",
  "Tuxedos",
  "Handbags",
  "Watches",
  "Jewellery Set",
]

// Blacklist of non-rental items
const BLACKLISTED_ARTICLE_TYPES = [
  "Innerwear",
  "Socks",
  "Briefs",
  "Tshirts",
  "Flip Flops",
  "Nightwear",
  "Loungewear",
  "Deodorant",
]

// Whitelist for gender
const ALLOWED_GENDERS = ["Men", "Women", "Unisex"]

// Blacklist for masterCategory
const BLACKLISTED_CATEGORIES = ["Personal Care", "Sporting Goods"]

function calculateRentalPrice(articleType: string): number {
  const basePrice: Record<string, number> = {
    "Dresses": 349,
    "Gowns": 799,
    "Lehengas": 1299,
    "Sarees": 599,
    "Blazers": 499,
    "Jackets": 399,
    "Suits": 899,
    "Sherwanis": 899,
    "Tuxedos": 1099,
    "Handbags": 299,
    "Watches": 249,
    "Jewellery Set": 199,
  }
  return basePrice[articleType] || 299
}

function calculateSecurityDeposit(rentalPrice: number): number {
  return Math.round(rentalPrice * 6)
}

function filterPremiumProducts(products: Product[]): Product[] {
  return products.filter((product) => {
    if (!ALLOWED_GENDERS.includes(product.gender)) return false
    if (BLACKLISTED_CATEGORIES.includes(product.masterCategory)) return false
    if (!PREMIUM_ARTICLE_TYPES.includes(product.articleType)) return false
    if (BLACKLISTED_ARTICLE_TYPES.includes(product.articleType)) return false
    return true
  })
}

export async function seedDatabase() {
  try {
    const dataArray: Product[] = (realKaggleData as any).products
    const filteredProducts = filterPremiumProducts(dataArray)

    console.log(`[v0] Seeding ${filteredProducts.length} premium products...`)

    for (const product of filteredProducts) {
      const rentalPrice = calculateRentalPrice(product.articleType)
      const deposit = calculateSecurityDeposit(rentalPrice)

      try {
        await sql`
          INSERT INTO products (
            id, productDisplay, gender, masterCategory, subCategory,
            articleType, baseColour, season, year, usage,
            rentalPricePerDay, securityDeposit, imageUrl
          ) VALUES (
            ${product.id}, ${product.productDisplay}, ${product.gender},
            ${product.masterCategory}, ${product.subCategory},
            ${product.articleType}, ${product.baseColour}, ${product.season},
            ${product.year}, ${product.usage}, ${rentalPrice}, ${deposit},
            ${''}
          )
          ON CONFLICT (id) DO NOTHING
        `
      } catch (error) {
        console.error(`[v0] Error seeding product ${product.id}:`, error)
      }
    }

    console.log('[v0] Database seeding completed')
  } catch (error) {
    console.error('[v0] Seeding error:', error)
    throw error
  }
}
