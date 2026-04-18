import realKaggleData from './products-data.json';
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
const dataArray: Product[] = (realKaggleData as any).products;

// To use real CSV data: run `node scripts/convert-csv.mjs` to generate products-data.json
// For now, using mock premium product data

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

// Whitelist for gender (exclude Boys, Girls)
const ALLOWED_GENDERS = ["Men", "Women", "Unisex"]

// Blacklist for masterCategory
const BLACKLISTED_CATEGORIES = ["Personal Care", "Sporting Goods"]


// Filter function to apply strict premium filters
export function getFilteredProducts(products: Product[]): Product[] {
  return products.filter((product) => {
    // Filter by gender whitelist
    if (!ALLOWED_GENDERS.includes(product.gender)) {
      return false
    }

    // Filter by blacklisted masterCategories
    if (BLACKLISTED_CATEGORIES.includes(product.masterCategory)) {
      return false
    }

    // Filter by premium article types whitelist or blacklist
    if (!PREMIUM_ARTICLE_TYPES.includes(product.articleType)) {
      return false
    }

    if (BLACKLISTED_ARTICLE_TYPES.includes(product.articleType)) {
      return false
    }

    return true
  })
}
export const products: Product[] = getFilteredProducts(dataArray as Product[]);
export const filterOptions = {
  gender: ["Men", "Women", "Unisex"],
  masterCategory: ["Apparel", "Accessories"],
  season: ["Summer", "Fall", "Winter", "Spring"],
  usage: ["Casual", "Formal", "Ethnic", "Party"],
}
