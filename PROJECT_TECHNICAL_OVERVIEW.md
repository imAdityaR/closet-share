# ClosetShare - Complete Technical Architecture & Design Document

## Executive Summary

**ClosetShare** is a premium fashion rental platform built with a modern, AI-powered tech stack. It combines a sophisticated Next.js frontend with a Python-powered AI backend (using Google Gemini), a PostgreSQL database (Neon), and specialized microservices for product scraping, vectorization, and agentic AI styling recommendations. The platform enables users to discover, wishlist, and rent curated fashion items while receiving AI-powered outfit recommendations and custom product sourcing.

---

## 1. COMPLETE TECH STACK

### **Frontend & UI Framework**
- **Next.js 16.1.6** - React-based full-stack framework with App Router, Server Components, and Server Actions
- **React 19.2.4** - UI library with latest hooks and features
- **TypeScript 5.7.3** - Type-safe development
- **Tailwind CSS 4.2.0** - Utility-first CSS framework (PostCSS integration)
- **Radix UI** - Unstyled, accessible component library (40+ components)
  - Dialog, Dropdown, Select, Toast, Accordion, Navigation Menu, etc.
- **Embla Carousel** - Headless carousel component library
- **Recharts 2.15.0** - Composable charting library for admin analytics
- **Lucide React** - Icon library (564+ icons)

### **Form & Data Management**
- **React Hook Form 7.54.1** - Performant form state management
- **Zod 3.24.1** - Runtime schema validation & TypeScript-first validation
- **React Hook Form Resolvers** - Bridge between Zod and React Hook Form

### **Authentication & Authorization**
- **Clerk 7.0.6** - Managed authentication and user management
  - Handles OAuth, email/password, social login
  - Built-in session management and middleware support
  - JWT tokens for API protection

### **Database Layer**
- **Neon Database** - Serverless PostgreSQL database on AWS
- **Drizzle ORM 0.45.1** - TypeScript-first, lightweight ORM
  - SQL-based queries with type safety
  - No runtime bloat, compiles to native SQL
- **Drizzle Kit 0.31.10** - CLI tool for schema migrations and introspection
- **@neondatabase/serverless** - Serverless Postgres client with connection pooling

### **AI & Machine Learning**
- **Google Gemini 2.5-Flash** - Latest LLM for agentic AI styling
  - Powers the "SmartCompleteTheLook" outfit recommendations
  - Agentic prompt engineering for style matching decisions
- **Google Embedding API (gemini-embedding-001)** - 384-dimensional text embeddings
  - Used for vector similarity search across product catalog
  - Enables semantic product recommendations

### **Backend & API**
- **FastAPI 0.135.3** - High-performance Python async web framework
- **Uvicorn 0.44.0** - ASGI server for running FastAPI
- **Pydantic 2.13.0** - Data validation and serialization
- **psycopg2-binary 2.9.11** - PostgreSQL Python adapter
- **python-dotenv 1.2.2** - Environment variable management

### **Web Scraping & ETL**
- **Cheerio 1.2.0** - jQuery-like syntax for parsing HTML (Node.js)
- **ScraperAPI** - Headless browser scraping service (handles JavaScript-heavy sites)
  - Integrated for extracting product metadata from e-commerce sites

### **Image Management**
- **Cloudinary 2.9.0** - Cloud image hosting and transformation service
  - Stores all product images in CLOSETSHARE-IMAGES folder
  - Supports dynamic resizing, optimization, and CDN delivery
- **next-cloudinary 6.17.5** - Optimized Cloudinary integration for Next.js

### **Styling & Theming**
- **next-themes 0.4.6** - Theme provider (light/dark mode support)
- **class-variance-authority 0.7.1** - CSS class composition utility
- **tailwind-merge 3.3.1** - Utility conflict resolution
- **Cormorant Garamond & Inter** - Google Fonts (serif + sans-serif)

### **Utility & Enhancement Libraries**
- **clsx 2.1.1** - Conditional className utility
- **sonner 1.7.1** - Toast notification library
- **vaul 1.1.2** - Drawer component primitive
- **react-resizable-panels 2.1.7** - Resizable panel layouts
- **date-fns 4.1.0** - Modern date utility library
- **cmdk 1.1.1** - Command palette / command menu component
- **input-otp 1.4.2** - OTP input component
- **react-day-picker 9.13.2** - Flexible date picker

### **Analytics & Deployment**
- **Vercel Analytics 1.6.1** - Web vitals monitoring
- **Vercel Edge Network** - Deployment and CDN
- **dotenv-cli 11.0.0** - CLI for loading environment variables

### **Python ML Dependencies**
- **sentence-transformers 5.4.0** - Pre-trained embedding models
- **torch 2.11.0** - Deep learning framework
- **transformers 5.5.4** - Hugging Face transformer models
- **numpy, scipy, scikit-learn** - ML & numerical computing
- **requests 2.33.1** - HTTP client library

---

## 2. PROJECT ARCHITECTURE

### **High-Level System Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOSETSHARE PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         NEXT.JS FRONTEND (React 19 + TypeScript)         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │   │
│  │  │   Pages      │  │ Components   │  │ Client Hooks   │ │   │
│  │  │ (SSR/Static) │  │ (Server/Clnt)│  │ (Cart, Wishlist)│ │   │
│  │  └──────────────┘  └──────────────┘  └────────────────┘ │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │    Radix UI Components + Tailwind CSS Styling        │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └─────────────┬────────────────────────────────────────────┘   │
│                │                                                  │
│                ├─────────────────────────────────────────┐       │
│                │                                         │       │
│  ┌─────────────▼─────────┐              ┌───────────────▼────┐  │
│  │  CLERK AUTH           │              │  NEXT.JS SERVER    │  │
│  │  ┌─────────────────┐  │              │  ACTIONS (RPC)     │  │
│  │  │ Session Token   │  │              │ ┌────────────────┐ │  │
│  │  │ User Validation │  │              │ │  lib/actions   │ │  │
│  │  │ OAuth Flows     │  │              │ │  lib/admin-act │ │  │
│  │  │ Middleware      │  │              │ │  lib/import-act│ │  │
│  │  └─────────────────┘  │              │ └────────────────┘ │  │
│  └──────────┬────────────┘              └─────────┬──────────┘  │
│             │                                     │              │
│             └─────────────────┬───────────────────┘              │
│                               │                                  │
│                      ┌────────▼────────┐                         │
│                      │  NEON DATABASE  │                         │
│                      │   PostgreSQL    │                         │
│                      │  (Serverless)   │                         │
│                      └────────┬────────┘                         │
│                               │                                  │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │  DRIZZLE ORM (Type-Safe SQL)                              │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ • Users (Clerk ID + Email)                          │ │  │
│  │  │ • Products (Catalog, Metadata, Embeddings)          │ │  │
│  │  │ • Orders & Order Items (Rental Logic)               │ │  │
│  │  │ • Cart & Wishlist (User Preferences)                │ │  │
│  │  │ • Addresses (Shipping Information)                  │ │  │
│  │  │ • Reviews (User Ratings)                            │ │  │
│  │  │ • Helpdesk Tickets (Customer Support)               │ │  │
│  │  │ • Admin Users (Authentication)                      │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      PYTHON BACKEND (FastAPI + Uvicorn)                 │   │
│  │                 muse-ai-backend/                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  /api/recommend                                  │   │   │
│  │  │  • Hybrid Vector Search + Gender Filtering      │   │   │
│  │  │  • Gemini Embedding API (384-dim vectors)       │   │   │
│  │  │  • PostgreSQL pgvector similarity search        │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  /api/style-match (Agentic Stylist)             │   │   │
│  │  │  • Gemini 2.5-Flash LLM with strict enums       │   │   │
│  │  │  • Generates complementary outfit recommendations│   │   │
│  │  │  • Returns subcategory + vector search query     │   │   │
│  │  │  • Then performs embedded vector search          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  /api/vectorize-single                           │   │   │
│  │  │  • On-demand embedding for single product        │   │   │
│  │  │  • Triggered from admin product upload           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  /api/generate-outfit (MuseAI Studio)            │   │   │
│  │  │  • Gemini LLM generates outfit from text prompt  │   │   │
│  │  │  • Semantic search for matching products         │   │   │
│  │  │  • Returns 3-4 item outfit with vibe text        │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                               │                                  │
│                      ┌────────▼────────┐                         │
│                      │ GOOGLE GEMINI   │                         │
│                      │  APIs           │                         │
│                      │ • Embedding API │                         │
│                      │ • Chat Completion│                        │
│                      └────────────────┘                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EXTERNAL SERVICES                                       │   │
│  │  ┌──────────────────────────┐  ┌──────────────────────┐ │   │
│  │  │ CLOUDINARY               │  │ SCRAPER API          │ │   │
│  │  │ • Image Hosting          │  │ • Web Scraping       │ │   │
│  │  │ • CDN Delivery           │  │ • JS Rendering       │ │   │
│  │  │ • Transformation         │  │ • Proxy Service      │ │   │
│  │  └──────────────────────────┘  └──────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### **Data Flow Patterns**

#### **1. User Authentication & Session Flow**
1. User logs in via Clerk (OAuth, email/password)
2. Clerk returns JWT token stored in HTTP-only cookie
3. Middleware validates token on each request
4. Clerk user ID synced to `users` table on first action
5. Subsequent queries use Clerk ID as `user_id`

#### **2. Product Discovery & Search**
1. User searches or browses products
2. Frontend calls Server Action `getSearchResults()` or `fetchProducts()`
3. Server queries Neon DB with ILIKE (case-insensitive) matching
4. Results hydrated with Cloudinary image URLs
5. Frontend renders with Radix UI components + Tailwind styling

#### **3. AI-Powered Outfit Recommendation**
1. User clicks "Generate Outfit by MuseAI" on product detail page
2. Client component calls `generateSmartStyleMatch(product)`
3. Server Action makes HTTP POST to Python backend at `/api/style-match`
4. Python backend:
   - Sends product attributes to Gemini 2.5-Flash LLM
   - LLM returns JSON with `target_subcategory` + `vector_search_query`
   - Embeds query via Gemini Embedding API (384-dim)
   - Performs `<->` vector similarity search in PostgreSQL
   - Returns top 4 matching products
5. Frontend displays results in animated grid with AI thought

#### **4. MuseAI Outfit Generation**
1. User inputs text prompt ("Sunset beach wedding") in MuseAI Studio
2. Selects gender (Men/Women)
3. Frontend calls `createMuseOutfit(prompt, gender)`
4. Server Action POST to `/api/generate-outfit`
5. Python backend:
   - Sends prompt to Gemini LLM with gender + style instructions
   - LLM returns JSON with vibe + outfit (4-6 items)
   - For each item, performs vector search by description
   - Returns full outfit with product details
6. Frontend displays outfit, allows save to profile

#### **5. Product Rental & Checkout Flow**
1. User adds items to cart (stored in React Context + DB)
2. Navigates to checkout
3. Selects shipping address or creates new one
4. Chooses delivery type (Now or Pre-book)
5. Server Action `createOrder()` called with order data
6. Order inserted to `orders` + `order_items` tables
7. Rental dates calculated from rental days
8. Cart cleared, user redirected to profile
9. Admin notified via dashboard

#### **6. Product Import & Scraping Pipeline**
1. Admin/User clicks "Import Product" and provides URL
2. Frontend calls `extractProductData(url)` (Server Action)
3. Cheerio parses HTML via ScraperAPI proxy
4. Extracts: title, image, price, metadata (gender, color, season)
5. Image uploaded to Cloudinary, returns secure_url
6. Draft data sent back to frontend for confirmation
7. Admin fills remaining fields (category, usage, etc.)
8. Calls `saveProductToDatabase(finalData)`
9. Product inserted to DB with `id = COALESCE(MAX(id), 0) + 1`
10. Async background job vectorizes via `/api/vectorize-single`

#### **7. Vectorization & Background Jobs**
1. New product inserted to DB with `text_embedding = NULL`
2. Async Python script `vectorize_catalog.py` runs (batch processing)
3. Fetches all products with NULL embedding
4. Concatenates product attributes into rich text
5. Sends to Gemini Embedding API in batches of 100
6. Retry logic on 429 rate-limit errors (exponential backoff)
7. Updates `text_embedding` column with pgvector format
8. Products now searchable via vector similarity

---

## 3. CORE FEATURES & DEEP LOGIC

### **Feature 1: Premium Fashion Rental Marketplace**

**Pricing Model:**
- **Rental Price Per Day** - Base daily rate (₹199-₹5000 range)
- **Security Deposit** - Typically 50% of retail price
- **Multi-Day Rentals** - Quantity field allows 1-30 days
- **Order Math:**
  ```
  rentalSubtotal = rentalPricePerDay × rentalDays
  depositTotal = SUM(securityDeposit for all items)
  grandTotal = rentalSubtotal + depositTotal
  ```

**Rental Dates:**
- Delivery Type: "Now" (instant) or "Pre-book" (future date)
- Start Date: Determined by delivery type
- End Date: Start Date + MAX(rentalDays across all items)
- Stored in `orders` table for tracking

**Product Metadata:**
- `gender` - "Men", "Women", "Unisex"
- `masterCategory` - "Apparel", "Accessories", "Footwear"
- `subCategory` - "Topwear", "Bottomwear", "Shoes", "Bags", "Jewellery"
- `articleType` - "T-Shirt", "Dress", "Kurta", "Blazer", etc.
- `baseColour` - "Black", "White", "Navy", "Beige", etc.
- `season` - "Summer", "Winter", "Spring", "Fall"
- `usage` - "Casual", "Formal", "Party", "Ethnic", "Wedding"
- `year` - Year of design/trend
- `text_embedding` - 384-dimensional vector for semantic search

---

### **Feature 2: AI Stylist - "SmartCompleteTheLook"**

**Agentic AI Workflow:**

```
User clicks "Generate Outfit by MuseAI" on Product Detail Page
                          ↓
   Frontend: generateSmartStyleMatch(currentProduct)
                          ↓
   Server Action → POST /api/style-match (Python)
                          ↓
   ┌─────────────────────────────────────────────────────┐
   │  PROMPT ENGINEERING (Gemini 2.5-Flash)              │
   │                                                      │
   │  "You are an expert high-end fashion stylist.       │
   │   Client wearing: {productDisplay}                 │
   │   Category: {subcategory}, Color: {basecolour}     │
   │   Occasion: {usage}                                │
   │   Suggest ONE complementary item (not same category)│
   │                                                     │
   │   Respond with JSON:                               │
   │   {                                                 │
   │     'ai_thought': 'explanation',                   │
   │     'target_subcategory': 'Bottomwear',            │
   │     'vector_search_query': 'Grey trousers'         │
   │   }"                                               │
   └─────────────────────────────────────────────────────┘
                          ↓
   │ Gemini LLM generates structured JSON response
   │ (with strict enum constraints to prevent hallucination)
                          ↓
   │ Python embeds 2-3 word search query via Gemini Embedding API
   │ Creates 384-dimensional vector
                          ↓
   │ PostgreSQL similarity search:
   │ SELECT ... ORDER BY text_embedding <-> query_vector LIMIT 4
   │ (pgvector extension enables vector operations)
                          ↓
   │ Return 4 matching products with images + pricing
                          ↓
   Frontend displays grid of recommendations with AI thought
```

**Key Design Decisions:**
- **Strict Enums:** Force LLM to choose from fixed subcategories to prevent invalid results
- **Short Queries:** "Grey trousers" (2-3 words) embeds better than flowery descriptions
- **Fallback Logic:** If LLM fails JSON parsing, default to "Bottomwear" + generic query
- **Rate Limiting:** Graceful error handling for Gemini API 429 errors

---

### **Feature 3: MuseAI Outfit Generator**

**Prompt Engineering:**

```javascript
// User Input:
prompt = "Sunset beach wedding in Goa. Light colors, breathable."
gender = "Women"

// Server calls: POST /api/generate-outfit
// Python backend sends to Gemini:
`
You are an elite fashion stylist curator. Create a complete outfit for:
Occasion: ${prompt}
Gender: ${gender}
Style Level: Luxury/Premium

Generate a complete 3-4 item outfit matching this vibe.

For EACH outfit piece, provide:
{
  "piece": "Item name",
  "category": "Topwear|Bottomwear|Shoes|Accessories",
  "search_keywords": "2-3 word search description",
  "reasoning": "Why this piece complements the vibe"
}

Return valid JSON array.
`

// Gemini responds with outfit structure
// Python performs vector search for each piece
// Returns full outfit with product images, prices, rental rates
```

**Features:**
- Generate 3-4 piece cohesive outfits from text description
- Save outfits to user profile for future reference
- Regenerate unlimited times
- Gender-aware styling (separate models for Men/Women)

---

### **Feature 4: User Engagement Tracking & Personalization**

**Weighted Engagement Scoring:**

```typescript
// User actions tracked in user_views table:
trackProductEngagement(productId, actionType)

// Weights:
- View = 1 point
- Wishlist = 3 points
- Purchase/Order = 5 points

// Top Picks Algorithm:
1. Aggregate engagement scores by (gender, masterCategory)
2. Find top 2 (gender, category) combinations
3. Query new products NOT in user's view history
4. Order by: interest_score DESC, created_at DESC
5. Return top 10 products

// Recently Viewed:
- Fetch products ordered by most recent view timestamp
- Limit to 10 items
- Shows browsing history

// Trending Now:
- Sum global engagement scores (all users)
- Only last 7 days
- Returns items with highest global interest
```

**Data Structure:**
```sql
user_views (
  user_id,
  product_id,
  view_count,    -- Incremented by weight
  viewed_at,     -- Last interaction timestamp
)
```

---

### **Feature 5: Admin Dashboard & Order Management**

**Dashboard Metrics:**
```typescript
// Real-time metrics:
getAdminDashboardMetrics() returns:
- Total Revenue: SUM(orders.total_paid)
- Active Rentals: COUNT(order_items WHERE status = 'active')
- Pending Orders: COUNT(orders WHERE status = 'processing')
- Total Products: COUNT(products)
- Recent Orders (DESC by date, LIMIT 10)
```

**Order Management:**
- View full order details with customer info + delivery address
- Track order status: Pending → Processing → Active → Returned → Completed
- Update order status with real-time revalidation
- View all items rented in each order with rental days

**Admin Authentication:**
- Custom cookie-based session (not Clerk)
- Separate login page at `/admin/login`
- Middleware redirects unauthenticated users to login
- Secure HTTP-only cookie with 24-hour expiration

---

### **Feature 6: Product Import & Scraping Pipeline**

**Import Flow:**

```
1. EXTRACT PHASE (Cheerio + ScraperAPI)
   URL → ScraperAPI proxy → HTML → Cheerio parsing
   
   Extracts:
   - og:title (product name)
   - og:image (product image URL)
   - product:price:amount (retail price)
   - og:description (metadata)
   
   Heuristic Analysis:
   - Gender detection: "men/boy" → Men, "women/girl" → Women
   - Color extraction: Regex match against ["black", "white", "navy", ...]
   - Season detection: "summer/linen" → Summer, "winter/wool" → Winter

2. CLOUDINARY UPLOAD
   Raw image URL → cloudinary.uploader.upload()
   Returns: secure_url for CDN-optimized image
   
3. PRICE CALCULATION
   rentalPricePerDay = floor(price / 6)
   securityDeposit = floor(price / 2)
   
4. DRAFT PREVIEW (Frontend Confirmation)
   User reviews extracted data + cloudinary image
   Can edit: gender, color, category, usage, etc.
   
5. DATABASE SAVE
   INSERT products(...)
   New product ID = MAX(id) + 1
   
6. BACKGROUND VECTORIZATION
   Async job: vectorize_catalog.py
   - Fetch products WHERE text_embedding IS NULL
   - Batch process in groups of 100
   - Embed via Gemini API
   - Update database
```

**Retry Logic:**
```python
# Bulletproof retry for rate limiting
while not success:
    try:
        embed_response = client.models.embed_content(...)
        success = True
    except ClientError as e:
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
            time.sleep(40)  # Pause for 40 seconds
        else:
            raise e  # Other errors are fatal
```

---

### **Feature 7: User Wishlists & Cart Management**

**Wishlist Logic:**
```typescript
toggleWishlist(productId):
  - Check if product already in wishlist
  - If yes: DELETE from wishlist
  - If no: INSERT into wishlist
  
// Database:
wishlist table:
  PRIMARY KEY (user_id, product_id)
  Cascade delete on user/product deletion
```

**Cart State Management:**
```typescript
// Frontend Cart Context:
interface CartItem {
  product: Product
  rentalDays: number  // How many days to rent
}

// Database cart table:
cart (
  PRIMARY KEY (user_id, product_id)
  quantity,           // Maps to rentalDays
)

// Sync functions:
syncCartItem(productId, quantity)
removeCartItemDB(productId)
clearUserCartDB()
fetchCart()
```

---

### **Feature 8: Customer Support & Helpdesk**

**Ticket System:**
```typescript
submitComplaint(subject, description)
  → INSERT into helpdesk_tickets table
  
Tables:
- helpdesk_tickets (id, user_id, subject, description, status, admin_reply, created_at, resolved_at)
- Admin can view all tickets, filter by status
- User can track ticket resolution
```

---

### **Feature 9: User Reviews & Ratings**

**Review Eligibility Check:**
```typescript
checkReviewEligibility(productId) → boolean
  // Can only review items they've rented
  SELECT FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  WHERE o.user_id = ${userId} 
    AND oi.product_id = ${productId}
    AND status IN ('Active', 'Returned')

submitReview(productId, rating, comment)
  // Server-side lock: verify eligibility before saving
  // Upsert: allow users to update their own review
```

---

### **Feature 10: Address Management**

**Shipping Addresses:**
```typescript
// CRUD Operations:
getUserAddresses()       // Fetch all user addresses
addAddress(formData)     // Create new address
updateAddress(id, data)  // Edit existing address
deleteAddress(id)        // Remove address

// Database:
addresses (
  id, user_id, full_name, phone_number, street_address,
  city, state, postal_code, created_at
)
```

---

## 4. DATABASE SCHEMA & ARCHITECTURE

### **Neon PostgreSQL Database**

#### **Core Tables**

```sql
-- Users (Synced with Clerk)
users (
  id TEXT PRIMARY KEY,           -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
)

-- Products (Fashion Catalog)
products (
  id INTEGER PRIMARY KEY,        -- Auto-incremented
  productDisplay TEXT NOT NULL,  -- Product name
  gender TEXT,                   -- "Men", "Women", "Unisex"
  masterCategory TEXT,           -- "Apparel", "Accessories"
  subCategory TEXT,              -- "Topwear", "Bottomwear", "Shoes"
  articleType TEXT,              -- "Dress", "Blazer", "Kurta", etc.
  baseColour TEXT,               -- "Black", "White", "Navy", etc.
  season TEXT,                   -- "Summer", "Winter", "Spring", "Fall"
  year INTEGER,
  usage TEXT,                    -- "Casual", "Formal", "Party", "Ethnic"
  rentalPricePerDay INTEGER,     -- ₹/day
  securityDeposit INTEGER,       -- Security amount
  imageUrl TEXT,                 -- Cloudinary CDN URL
  text_embedding vector(384),    -- 384-dim Gemini embedding for similarity search
  created_at TIMESTAMP DEFAULT now()
)

-- Wishlist (Many-to-Many)
wishlist (
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
)

-- Shopping Cart
cart (
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,           -- Rental days
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
)

-- Orders (Rental Transactions)
orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_paid INTEGER NOT NULL,          -- Total ₹ amount
  status TEXT DEFAULT 'Processing',     -- Processing, Active, Returned, Completed
  address_id INTEGER REFERENCES addresses(id),
  delivery_type TEXT,                   -- "Now" or "Pre-book"
  rental_start DATE,
  rental_end DATE,
  payment_method TEXT,                  -- "COD", "Card", etc.
  created_at TIMESTAMP DEFAULT now()
)

-- Order Line Items
order_items (
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  rental_days INTEGER DEFAULT 1,
  price_at_rental INTEGER,              -- Locked price at time of rental
  created_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (order_id, product_id)
)

-- Addresses (Shipping)
addresses (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
)

-- Reviews & Ratings
reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER,                       -- 1-5 stars
  comment TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (user_id, product_id)          -- One review per user per product
)

-- Admin Users
admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,               -- HASH this in production!
  created_at TIMESTAMP DEFAULT now()
)

-- Helpdesk Tickets
helpdesk_tickets (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',           -- OPEN, IN_PROGRESS, RESOLVED
  admin_reply TEXT,
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP
)

-- User Engagement Tracking
user_views (
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 1,         -- Weighted: 1 for view, 3 for wishlist, 5 for order
  viewed_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
)

-- Search History
search_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  search_query TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (user_id, search_query)
)

-- User Notifications
user_notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
)

-- Saved Outfits (MuseAI)
user_outfits (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  outfit_name TEXT,
  vibe_text TEXT,                       -- AI-generated vibe description
  gender TEXT,
  product_ids INTEGER[],                -- Array of product IDs in outfit
  created_at TIMESTAMP DEFAULT now()
)

-- Product Requests (Custom Import)
product_requests (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_url TEXT NOT NULL,             -- URL they want to import
  scraped_title TEXT,
  scraped_image_url TEXT,
  estimated_rental_price INTEGER,
  rental_start_date DATE,
  rental_end_date DATE,
  status TEXT DEFAULT 'PENDING',        -- PENDING, APPROVED, REJECTED
  created_at TIMESTAMP DEFAULT now()
)
```

### **Vector Search via pgvector**

**Similarity Search Query Pattern:**
```sql
-- Find products similar to query vector
SELECT id, productDisplay, imageUrl, baseColour, rentalPricePerDay
FROM products
WHERE gender = 'Women'
ORDER BY text_embedding <-> query_vector  -- pgvector operator: cosine distance
LIMIT 4
```

**Embedding Pipeline:**
1. Product attributes concatenated: "Black Kurta Women Ethnic Occasion"
2. Sent to Gemini Embedding API → 384-dimensional vector
3. Stored in PostgreSQL `text_embedding` column
4. Similarity search via `<->` operator (fastest for dense vectors)

---

## 5. FOLDER STRUCTURE & KEY FILES

### **Root Level**
```
ClosetShare/
├── app/                              # Next.js App Router
├── components/                       # Reusable React components
├── lib/                              # Utilities, actions, contexts
├── public/                           # Static assets
├── styles/                           # Global CSS
├── muse-ai-backend/                  # Python FastAPI server
├── package.json                      # NPM dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.mjs                   # Next.js config (images, remotePatterns)
├── tailwind.config.ts                # Tailwind CSS config
├── drizzle.config.js                 # Drizzle ORM config
├── middleware.ts                     # Clerk auth + admin session logic
└── vercel.json                       # Vercel deployment config
```

### **`app/` Directory (Page Routes)**

```
app/
├── layout.tsx                        # Root layout with providers
├── page.tsx                          # Homepage with hero, categories
├── globals.css                       # Global Tailwind styles
├── api/
│   ├── cron/                        # Scheduled background jobs (Vercel Cron)
│   │   └── cleanup/                 # Data cleanup tasks
│   └── init/                        # One-time initialization
├── profile/
│   └── page.tsx                     # User dashboard (orders, wishlist, profile)
├── product/
│   └── [id]/
│       └── page.tsx                 # Product detail page
├── search/
│   └── page.tsx                     # Search results page
├── new-arrivals/
│   └── page.tsx                     # Filtered product listing
├── checkout/
│   └── page.tsx                     # Multi-step checkout flow
├── muse-ai/
│   ├── page.tsx                     # MuseAI Studio landing
│   ├── MuseOutfitsDisplay.tsx       # Display saved outfits
│   └── WelcomeOverlay.tsx           # Onboarding overlay
├── order/
│   └── [id]/
│       └── page.tsx                 # Order detail view
├── helpdesk/
│   ├── page.tsx                     # Help desk listing
│   └── client.tsx                   # Ticket submission
├── admin/
│   ├── layout.tsx                   # Admin layout
│   ├── page.tsx                     # Dashboard
│   ├── login/
│   │   └── page.tsx                 # Admin login form
│   ├── orders/
│   │   └── page.tsx                 # Order management
│   ├── products/
│   │   └── page.tsx                 # Product catalog management
│   └── helpdesk/
│       └── page.tsx                 # Ticket resolution
└── about/
    └── page.tsx                     # About page
```

### **`components/` Directory (Reusable Components)**

```
components/
├── navbar.tsx                       # Top navigation bar
├── product-card.tsx                 # Product card component
├── product-grid.tsx                 # Grid of products with filtering
├── product-detail-client.tsx        # Product detail page (client component)
├── product-detail-actions.tsx       # Add to cart/wishlist buttons
├── cart-drawer.tsx                  # Sliding cart drawer
├── checkout-client.tsx              # Multi-step checkout
├── address-form-modal.tsx           # Address CRUD modal
├── SmartCompleteTheLook.tsx         # AI outfit recommendation widget
├── MuseAIOutfitMaker.tsx           # Outfit generator with prompt input
├── YouMayAlsoLike.tsx              # "You may also like" section
├── profile-client.tsx               # User profile + order history
├── auth-modal.tsx                   # Login/register modal
├── notification-bell.tsx            # Notification dropdown
├── search-bar.tsx                   # Search input with autocomplete
├── filter-sidebar.tsx               # Product filters (gender, category, season)
├── ImportPipelineButton.tsx         # Admin product import UI
├── admin-orders-client.tsx          # Admin order management
├── order-details-client.tsx         # Full order details view
├── CustomOrderModal.tsx             # Custom product request form
├── root-layout-client.tsx           # Client wrapper for layout providers
├── theme-provider.tsx               # Dark/light mode provider
└── ui/                              # Radix UI + Tailwind components
    ├── button.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── card.tsx
    ├── toast.tsx
    ├── carousel.tsx
    └── ... (40+ component exports)
```

### **`lib/` Directory (Server Actions & Utilities)**

```
lib/
├── actions.ts                       # 930 lines of server actions
│   ├── getUserId()                  # Clerk → Neon sync
│   ├── toggleWishlist()
│   ├── updateCart()
│   ├── checkout()
│   ├── fetchUserWishlist()
│   ├── fetchUserOrders()
│   ├── submitReview()
│   ├── checkReviewEligibility()
│   ├── getUserAddresses()
│   ├── addAddress()
│   ├── createOrder()
│   ├── updateAddress()
│   ├── deleteAddress()
│   ├── getSearchResults()
│   ├── getUserSearchHistory()
│   ├── getProductReviews()
│   ├── getAdminDashboardMetrics()
│   ├── getAdminOrderDetails()
│   ├── updateOrderStatus()
│   ├── fetchCart()
│   ├── syncCartItem()
│   ├── removeCartItemDB()
│   ├── clearUserCartDB()
│   ├── submitComplaint()
│   ├── fetchUserComplaints()
│   ├── trackProductEngagement()
│   ├── getRecentlyViewed()
│   ├── getTopPicks()
│   ├── getTrendingNow()
│   ├── generateSmartStyleMatch()   # AI outfit recommendation
│   ├── createMuseOutfit()           # MuseAI outfit generation
│   ├── saveOutfitToProfile()
│   └── ... (60+ total functions)
│
├── admin-actions.ts                 # Admin-specific server actions
│   ├── loginAdmin()
│   ├── logoutAdmin()
│   ├── verifyAdminSession()
│   └── ... (admin CRUD)
│
├── import-action.ts                 # Product import pipeline
│   ├── extractProductData()         # Cheerio + ScraperAPI scraping
│   ├── saveProductToDatabase()      # Insert to Neon
│   ├── getPendingRequests()
│   └── ... (import workflow)
│
├── db.ts                            # Database initialization
│   ├── initializeDatabase()
│   └── export { sql }
│
├── schema.ts                        # Drizzle ORM schema definitions
│   ├── users table
│   ├── products table
│   ├── wishlist table
│   ├── cart table
│   ├── orders table
│   └── orderItems table
│
├── cart-context.tsx                 # React Context for shopping cart
│   ├── useCart() hook
│   └── CartProvider component
│
├── wishlist-context.tsx             # React Context for wishlist
│   ├── useWishlist() hook
│   └── WishlistProvider component
│
├── toast-context.tsx                # React Context for toast notifications
│   ├── useToast() hook
│   └── ToastProvider component
│
├── utils.ts                         # Utility functions (cn, formatting, etc.)
├── data.ts                          # Hardcoded data (unused in favor of DB)
├── products-data.json               # Sample product data (reference only)
└── seed.ts                          # Database seeding script
```

### **`muse-ai-backend/` Directory (Python FastAPI)**

```
muse-ai-backend/
├── api.py                           # Main FastAPI application
│   ├── @app.post("/api/recommend")
│   │   ├── Input: QueryRequest (text, limit, gender)
│   │   ├── Process: Hybrid search (vector + gender filter)
│   │   └── Output: List of products
│   │
│   ├── @app.post("/api/vectorize-single")
│   │   ├── Input: SingleProductRequest (id)
│   │   ├── Process: Embed single product via Gemini
│   │   └── Output: Success message
│   │
│   ├── @app.post("/api/style-match")
│   │   ├── Input: StyleMatchRequest (product attributes)
│   │   ├── Process: Agentic LLM styling
│   │   │ 1. Prompt Gemini 2.5-Flash for complementary item
│   │   │ 2. Parse JSON response (target_subcategory, search_query)
│   │   │ 3. Embed search query (384-dim)
│   │   │ 4. Vector similarity search in PostgreSQL
│   │   ├── Fallback: If JSON fails, default to safe values
│   │   └── Output: 4 matching products + ai_thought
│   │
│   ├── @app.post("/api/generate-outfit")
│   │   ├── Input: prompt, gender
│   │   ├── Process: Full outfit generation
│   │   │ 1. Prompt Gemini to design complete 3-4 piece outfit
│   │   │ 2. For each piece, vector search product catalog
│   │   │ 3. Aggregate results
│   │   ├── Output: outfit array + vibe text
│   │   └── Error handling: Return empty if LLM fails
│   │
│   └── Helper: get_db_connection() - psycopg2 PostgreSQL connection
│
├── vectorize_catalog.py             # Background vectorization job
│   ├── Connect to Neon DB
│   ├── Fetch products WHERE text_embedding IS NULL
│   ├── Batch process in groups of 100
│   ├── Embed each batch via Gemini API
│   ├── Retry logic for 429 rate limits (exponential backoff)
│   ├── Update database with embedding vectors
│   └── Progress logging
│
├── requirements.txt                 # Python dependencies (75+ packages)
│   ├── fastapi, uvicorn, starlette
│   ├── google-genai (Gemini API client)
│   ├── psycopg2-binary (PostgreSQL adapter)
│   ├── pydantic (data validation)
│   ├── python-dotenv
│   ├── torch, transformers (ML libraries)
│   ├── sentence-transformers
│   ├── requests
│   └── ... (ML stack)
│
└── .env                             # Environment variables
    ├── DATABASE_URL (Neon PostgreSQL connection string)
    └── GEMINI_API_KEY (Google API key)
```

### **Configuration Files**

```
├── next.config.mjs
│   ├── images.unoptimized = true
│   ├── remotePatterns (Cloudinary, Unsplash)
│   └── typescript.ignoreBuildErrors = true
│
├── drizzle.config.js
│   ├── schema: './lib/schema.ts'
│   ├── dialect: 'postgresql'
│   └── dbCredentials.url: process.env.DATABASE_URL
│
├── tsconfig.json
│   ├── target: ES6
│   ├── strict mode enabled
│   ├── paths: @/* for imports
│   └── incremental compilation
│
├── tailwind.config.ts
│   ├── Radix UI color palette integration
│   ├── Custom font variables (serif, sans)
│   └── Animation extensions
│
├── middleware.ts
│   ├── Clerk authentication middleware
│   ├── Admin portal session logic
│   └── Route protection
│
├── postcss.config.mjs
│   └── Tailwind CSS v4 with PostCSS
│
└── vercel.json
    └── Deployment configuration
```

---

## 6. API ROUTES & ENDPOINTS

### **Next.js Server Actions (RPC)**

All server-side logic is in `lib/actions.ts`, `lib/admin-actions.ts`, and `lib/import-action.ts`. These are called directly from client components using the `"use server"` directive. Examples:

```typescript
// In client component:
const result = await toggleWishlist(productId)
const result = await generateSmartStyleMatch(product)
const result = await createMuseOutfit(prompt, gender)
const result = await submitReview(productId, rating, comment)
```

**Key Characteristics:**
- No explicit HTTP routes needed
- Type-safe (TypeScript → TypeScript)
- Automatic serialization/deserialization
- Server-side database access
- Can call other server actions

### **Python FastAPI Endpoints**

**Base URL:** `process.env.NEXT_PUBLIC_PYTHON_API_URL` (default: `http://127.0.0.1:8000`)

#### **1. POST `/api/recommend`**
```json
Request: {
  "text": "Summer beach dresses",
  "limit": 5,
  "gender": "Women"
}

Response: {
  "data": [
    {
      "id": 101,
      "productDisplay": "Floral Linen Dress",
      "gender": "Women",
      "mastercategory": "Apparel",
      "subcategory": "Dresses",
      "basecolour": "White",
      "rentalpriceperday": 299,
      "imageurl": "https://res.cloudinary.com/..."
    },
    ...
  ]
}
```

#### **2. POST `/api/style-match` (Agentic AI)**
```json
Request: {
  "id": 42,
  "productDisplay": "Black Kurta",
  "gender": "Women",
  "subcategory": "Topwear",
  "basecolour": "Black",
  "usage": "Formal",
  "limit": 4
}

Response: {
  "ai_thought": "A flowing grey palazzo would balance the structured kurta...",
  "data": [
    {
      "id": 101,
      "productDisplay": "Grey Palazzo Pants",
      "rentalpriceperday": 249,
      ...
    },
    ...
  ]
}
```

#### **3. POST `/api/generate-outfit` (MuseAI)**
```json
Request: {
  "prompt": "Sunset beach wedding in Goa. Romantic, light colors, breathable.",
  "gender": "Women"
}

Response: {
  "vibe": "Romantic coastal elegance with a bohemian twist",
  "outfit": [
    {
      "id": 102,
      "productDisplay": "Ivory Linen Dress",
      "rentalpriceperday": 499,
      "gender": "Women",
      ...
    },
    {
      "id": 203,
      "productDisplay": "Woven Leather Sandals",
      "rentalpriceperday": 199,
      ...
    },
    ...
  ]
}
```

#### **4. POST `/api/vectorize-single` (Background)**
```json
Request: {
  "id": 42
}

Response: {
  "status": "success",
  "message": "Product 42 vectorized via Gemini."
}
```

---

## 7. KEY INTEGRATIONS & EXTERNAL SERVICES

### **Google Gemini API**

**Models Used:**
1. **gemini-2.5-flash** - For agentic AI styling decisions
   - Low latency, high reasoning ability
   - Constrained JSON output for predictions
   
2. **gemini-embedding-001** - For semantic vector embeddings
   - 384-dimensional vectors
   - Input: Concatenated product attributes (100-500 chars)
   - Used for similarity search

**Rate Limits Handled:**
- Free tier: Limited requests/minute
- Retry logic with exponential backoff
- 40-second pause on 429 errors

### **Cloudinary**

**Folder:** `CLOSETSHARE-IMAGES`

**Operations:**
```javascript
cloudinary.uploader.upload(rawImageUrl, {
  folder: "CLOSETSHARE-IMAGES",
  resource_type: "image"
})
// Returns: {secure_url, public_id, width, height, ...}
```

**URL Pattern:**
```
https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/{productId}.jpg
```

**Usage:**
- Product images stored during import
- Automatic optimization (format, compression)
- CDN delivery (global edge locations)

### **ScraperAPI**

**Integration Point:** `lib/import-action.ts` → `extractProductData()`

```typescript
const scraperUrl = `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(targetUrl)}`
const html = await fetch(scraperUrl).then(r => r.text())
const $ = cheerio.load(html)  // Parse with Cheerio
```

**Purpose:**
- Handle JavaScript-rendered websites
- Proxy requests (bypass bot detection)
- Returns rendered HTML

### **Clerk Authentication**

**Session Flow:**
1. User logs in at `/sign-in`
2. Clerk handles OAuth/password auth
3. JWT token stored in HTTP-only cookie
4. Middleware validates on every request
5. `await auth()` returns `{ userId }`
6. `await currentUser()` returns full user object

**Admin Bypass:**
- Admin routes use custom cookie instead of Clerk
- Separate login at `/admin/login`
- Admin users stored in `admin_users` table (not Clerk)

### **Neon PostgreSQL**

**Connection:**
```typescript
const sql = neon(process.env.DATABASE_URL!)
// Returns async query function: sql`...`
```

**Features Used:**
- Serverless connection pooling
- pgvector extension for embeddings
- Row-level security (potential future)

---

## 8. DEPLOYMENT & ENVIRONMENT CONFIGURATION

### **Environment Variables**

```bash
# Frontend (Next.js)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
NEXT_PUBLIC_PYTHON_API_URL=http://127.0.0.1:8000  # Local dev, HTTP on prod
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx

# External Services
SCRAPER_API_KEY=xxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dmnzwforu
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Backend (Python)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
GEMINI_API_KEY=xxx
```

### **Deployment Targets**

**Frontend:** Vercel
- Next.js 16 optimized
- Auto-scaling Edge Functions
- Vercel Analytics for Web Vitals
- Serverless functions for API routes (if needed)

**Backend:** Python FastAPI
- Deploy to: Render, Railway, or Docker on VPS
- Uvicorn with `--reload` in dev
- Gunicorn/Uvicorn in production
- Environment variables via `.env`

**Database:** Neon
- Serverless PostgreSQL
- Automatic backups
- Connection pooling included

---

## 9. CRITICAL BUSINESS LOGIC

### **Rental Pricing Formula**
```
rentalPricePerDay = floor(retailPrice / 6)
securityDeposit = floor(retailPrice / 2)
orderTotal = SUM(rentalPricePerDay × rentalDays) + SUM(securityDeposit)
```

### **Order Status Lifecycle**
```
Processing → Active → Returned → Completed
                   ↓
              (or Cancelled)
```

### **Vector Search Similarity**
```sql
<-> operator (pgvector)
- Cosine distance for dense embeddings
- L2 Euclidean also supported
- Faster than semantic search on text
```

### **User Segmentation (Top Picks Algorithm)**
```
1. Analyze user's category × gender preferences (by weight)
2. Find top 2 (category, gender) combinations
3. Query new products NOT yet viewed
4. Rank by: (interest_score DESC, created_at DESC)
5. Return top 10
```

---

## 10. SECURITY CONSIDERATIONS

### **Authentication & Authorization**

- **Clerk:** Handles JWT tokens, OAuth, MFA
- **Admin Portal:** Custom cookie with HTTP-only flag, 24hr expiration
- **Server Actions:** `await auth()` validates user on each action
- **Middleware:** Clerk middleware protects routes

### **Database Security**

- **Parameterized Queries:** Drizzle ORM + Neon prevent SQL injection
- **Foreign Keys:** Cascade deletes prevent orphaned data
- **User Isolation:** All queries filtered by `user_id`

### **Image Security**

- **Cloudinary:** Uses secure CDN, no direct file uploads
- **ScraperAPI:** Proxies requests, handles bot detection

### **API Security**

- **Rate Limiting:** Gemini API handles rate limits internally
- **No Credentials in Frontend:** `GEMINI_API_KEY` server-side only
- **CORS:** Configured for Vercel domains

---

## 11. PERFORMANCE OPTIMIZATIONS

### **Frontend**

- **Server Components:** Pages rendered server-side where possible
- **Code Splitting:** Next.js automatic route-based splitting
- **Image Optimization:** Cloudinary handles resizing + format conversion
- **Caching:** Next.js revalidatePath() for ISR (Incremental Static Regeneration)

### **Backend**

- **Vector Caching:** Embeddings computed once, stored in DB
- **Batch Processing:** Vectorization in batches of 100
- **Connection Pooling:** Neon handles pg connection pooling
- **Lazy Loading:** Products loaded on-demand, not pre-fetched

### **Database**

- **Indexes:** Primary keys on id, foreign key indexes
- **Pagination:** LIMIT clauses on SELECT queries
- **Aggregation:** SQL-level aggregation (SUM, COUNT) instead of app-level

---

## 12. FUTURE ENHANCEMENTS

1. **Real-time Notifications:** WebSockets for order status updates
2. **Machine Learning Personalization:** Collaborative filtering for recommendations
3. **Dynamic Pricing:** Price adjustment based on demand/seasonality
4. **Subscription Plans:** Membership tiers with rental discounts
5. **Virtual Try-On:** AR integration for size/fit preview
6. **Payment Gateway:** Stripe/Razorpay integration (currently COD)
7. **Admin Analytics Dashboard:** Advanced metrics and reporting
8. **Mobile App:** React Native version of platform
9. **Inventory Management:** Stock levels, reorder alerts
10. **Multi-Language Support:** i18n for international markets

---

## SUMMARY

**ClosetShare** is a sophisticated full-stack fashion rental marketplace that leverages:

- **Modern Frontend:** Next.js 16 with React 19, Server Components, and Radix UI for responsive, accessible interfaces
- **Agentic AI Backend:** Google Gemini LLM for intelligent outfit recommendations with strict prompt engineering
- **Vector Embeddings:** 384-dimensional semantic search for discovering similar products
- **Serverless Architecture:** Neon PostgreSQL, Vercel deployment, FastAPI microservices
- **Complex Business Logic:** Multi-step checkout, rental pricing, order lifecycle, personalized recommendations

The architecture is designed for scale, with clear separation of concerns (frontend/backend/database) and leverages best-in-class AI tools (Gemini, vector databases) to provide unique competitive features (AI styling, outfit generation) that differentiate the platform from traditional e-commerce sites.

