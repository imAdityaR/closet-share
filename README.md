
# ClosetShare 👗✨

**ClosetShare** is a premium fashion rental platform built with a modern, AI-powered tech stack. It combines a sophisticated Next.js frontend with a Python-powered AI backend, a PostgreSQL database, and specialized microservices for product scraping, vectorization, and agentic AI styling recommendations. 

The platform enables users to discover, wishlist, and rent curated fashion items while receiving AI-powered outfit recommendations and custom product sourcing.

---

## 🚀 Key Features

* **Premium Fashion Rental Marketplace:** Browse, wishlist, and rent high-end fashion with dynamic pricing calculations (rental days + security deposits) and complete order lifecycle management.
* **AI Stylist ("SmartCompleteTheLook"):** Agentic AI powered by Google Gemini 2.5-Flash analyzes the current product being viewed and dynamically suggests complementary items utilizing pgvector similarity search.
* **MuseAI Outfit Generator:** A text-to-outfit studio where users provide a text prompt (e.g., *"Sunset beach wedding"*), and the AI designs and queries a complete 3-4 piece outfit from the database.
* **Automated ETL Pipeline:** Admins can import products directly from external URLs. The system utilizes Cheerio and ScraperAPI to bypass bot protections, extract metadata, optimize images via Cloudinary, and vectorize the data.
* **Vector Search Navigation:** Catalog items are embedded using Google's `gemini-embedding-001` (384-dimensions) and stored in Neon PostgreSQL for rapid semantic similarity search.
* **Engagement Tracking & Personalization:** A custom algorithm weights user actions (views, wishlists, orders) to generate personalized "Top Picks" and global "Trending Now" feeds.

---

## 🛠 Complete Tech Stack

### Frontend & UI
* **Framework:** Next.js 16 (App Router, Server Actions) & React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4, Radix UI (Headless components), Embla Carousel
* **State & Forms:** React Hook Form, Zod

### Backend & AI Microservices
* **Framework:** Python FastAPI (Uvicorn ASGI)
* **AI Models:** Google Gemini 2.5-Flash, Gemini Embedding API
* **Machine Learning:** PyTorch, Hugging Face Transformers, Sentence Transformers
* **Web Scraping:** Cheerio (Node.js), ScraperAPI

### Database & Auth
* **Database:** Neon (Serverless PostgreSQL) with `pgvector` extension
* **ORM:** Drizzle ORM
* **Authentication:** Clerk (User Auth/OAuth), Custom HTTP-only Sessions (Admin Auth)
* **Storage:** Cloudinary (CDN Image Delivery & Optimization)

---

## 🏗 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                    CLOSETSHARE PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         NEXT.JS FRONTEND (React 19 + TypeScript)         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │    Pages     │  │ Components   │  │ Client Hooks   │  │   │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │   │
│  └─────────────┬────────────────────────────────────────────┘   │
│                │                                                │
│  ┌─────────────▼─────────┐              ┌───────────────▼────┐  │
│  │  CLERK AUTH           │              │  NEXT.JS SERVER    │  │
│  │  (Session Management) │              │  ACTIONS (RPC)     │  │
│  └──────────┬────────────┘              └─────────┬──────────┘  │
│             │                                     │             │
│             └─────────────────┬───────────────────┘             │
│                               │                                 │
│                      ┌────────▼────────┐                        │
│                      │  NEON DATABASE  │                        │
│                      │   PostgreSQL    │                        │
│                      │  (Serverless)   │                        │
│                      └────────┬────────┘                        │
│                               │                                 │
│  ┌────────────────────────────▼──────────────────────────────┐  │
│  │  DRIZZLE ORM (Type-Safe SQL)                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      PYTHON BACKEND (FastAPI + Uvicorn)                  │   │
│  │      • /api/recommend     (Vector Search)                │   │
│  │      • /api/style-match   (Agentic Stylist)              │   │
│  │      • /api/generate-outfit (MuseAI Studio)              │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                 │
│                      ┌────────▼────────┐                        │
│                      │ GOOGLE GEMINI   │                        │
│                      │      APIs       │                        │
│                      └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Local Development Setup

### Prerequisites
* Node.js 20+
* Python 3.10+
* Accounts: Clerk, Neon Database, Cloudinary, ScraperAPI, Google AI Studio (Gemini)

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/closetshare.git](https://github.com/yourusername/closetshare.git)
cd closetshare
```

### 2. Install Dependencies
```bash
# Install Next.js dependencies
npm install

# Install Python backend dependencies
cd muse-ai-backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
cd ..
```

### 3. Environment Variables
Create a `.env` file in the root directory and a `.env` file in the `muse-ai-backend/` directory.

**Root `.env` (Next.js)**
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
NEXT_PUBLIC_PYTHON_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
SCRAPER_API_KEY=xxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**`muse-ai-backend/.env` (FastAPI)**
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
GEMINI_API_KEY=xxx
```

### 4. Database Setup
```bash
# Push Drizzle schema to Neon DB
npx drizzle-kit push
```

### 5. Run the Application
You will need two terminal windows to run both servers simultaneously.

**Terminal 1 (Next.js Frontend):**
```bash
npm run dev
```

**Terminal 2 (Python Backend):**
```bash
cd muse-ai-backend
uvicorn api:app --reload
```

Your app will be running at `http://localhost:3000`.

---

## 📂 Project Structure

```text
ClosetShare/
├── app/                      # Next.js App Router (Pages & Layouts)
│   ├── admin/                # Admin Dashboard & Orders
│   ├── checkout/             # Multi-step rental flow
│   ├── muse-ai/              # AI Outfit Generator Studio
│   └── product/              # Product Details & Recommendations
├── components/               # React Components (UI, Forms, Modals)
├── lib/                      # Utilities, Actions & Database Schema
│   ├── actions.ts            # Server Actions for Frontend
│   ├── admin-actions.ts      # Server Actions for Admin logic
│   ├── schema.ts             # Drizzle ORM PostgreSQL Models
│   └── import-action.ts      # ScraperAPI & Cloudinary pipeline
├── muse-ai-backend/          # FastAPI Python Microservice
│   ├── api.py                # Endpoints (/api/style-match, etc.)
│   └── vectorize_catalog.py  # Background embedding script
├── public/                   # Static Assets
└── tailwind.config.ts        # Tailwind CSS Configuration
```

---

## 🔐 Security & Performance
* **Authentication:** JWT tokens via Clerk, strictly validated via Next.js Middleware. Custom HTTP-only sessions for Admin access.
* **Database:** Parameterized Drizzle queries protect against SQL injection. Row-level filtering by `user_id`.
* **Rate Limiting & Retries:** Built-in exponential backoff for Gemini API rate limits (handling `429 RESOURCE_EXHAUSTED` errors).
* **Caching & Optimization:** Next.js Server Components, Cloudinary automatic image format transformation (WebP/AVIF), and optimized pgvector `<->` operators for mathematical distance calculations.

---

## 🔮 Future Roadmap
- [ ] Stripe/Razorpay Payment Gateway Integration
- [ ] Real-time WebSockets for Order Status Updates
- [ ] Collaborative Filtering ML for deeper user recommendations
- [ ] Virtual Try-On AR integration

