import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { getRecentlyViewed, getTopPicks ,getTrendingNow} from "@/lib/actions"
import { auth } from "@clerk/nextjs/server" // <-- Import Clerk server auth
import { SignInButton } from "@clerk/nextjs" // <-- Import SignInButton for UX
import { Lock, Sparkles } from "lucide-react" // <-- Added icons for the empty state

// 1. REUSABLE CARD COMPONENT (Clean & consistent sizing!)
function ProductCard({ product }: { product: any }) {
  return (
    <Link 
      href={`/product/${product.id}`} 
      className="w-[160px] md:w-[200px] shrink-0 flex-none snap-start group flex flex-col"
    >
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-3">
        {product.imageUrl ? (
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
        )}
      </div>
      <h3 className="font-medium text-sm truncate">{product.name}</h3>
      <p className="text-muted-foreground text-sm font-semibold">₹{product.price}/day</p>
    </Link>
  )
}

// 2. THE ROW COMPONENTS
async function RecentlyViewedRow() {
  const products = await getRecentlyViewed()
  if (products.length === 0) return <p className="text-muted-foreground text-sm">Start browsing to see your history!</p>

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
async function TrendingRow() {
  const products = await getTrendingNow()
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
async function TopPicksRow() {
  const products = await getTopPicks()
  if (products.length === 0) return <p className="text-muted-foreground text-sm">We're calculating your style profile...</p>

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}

// 3. THE MAIN DASHBOARD
// 🛑 Note: Made the function async to support server-side auth checking
export default async function ForYouPage() {
  const { userId } = await auth() // <-- Check if the user is authenticated

  // --- UNAUTHENTICATED VIEW ---
  if (!userId) {
    return (
      <main className="max-w-screen-xl mx-auto px-5 md:px-8 pt-20 pb-32 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
          Your Personal Style Suite
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
          Sign in or create an account to unlock personalized style recommendations, view your browsing history, and discover looks curated specifically for you.
        </p>
        
        {/* Clerk's native button opens the auth modal without leaving the page */}
        <SignInButton mode="modal">
          <button className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:scale-105 transition-all shadow-md">
            <Sparkles className="w-4 h-4" />
            Sign In to Explore
          </button>
        </SignInButton>
      </main>
    )
  }

  // --- AUTHENTICATED VIEW (Your original code) ---
  return (
    <main className="max-w-screen-xl mx-auto px-5 md:px-8 pt-10 pb-20">
      
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">For You</h1>
        <p className="text-muted-foreground">Curated styles based on your activity.</p>
      </div>

      <div className="flex flex-col gap-12">
        
        {/* NEW ROW 1: Trending Now */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">Trending Now</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 uppercase tracking-wider">Hot</span>
          </div>
          <Suspense fallback={<div className="h-64 w-full bg-muted/50 animate-pulse rounded-xl" />}>
            <TrendingRow />
          </Suspense>
        </section>
       {/* ROW 1: Recently Viewed */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recently Viewed</h2>
          <Suspense fallback={<div className="h-64 w-full bg-muted/50 animate-pulse rounded-xl" />}>
            <RecentlyViewedRow />
          </Suspense>
        </section>

        {/* ROW 2: You Might Also Like */}
        <section>
          <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
          <Suspense fallback={<div className="h-64 w-full bg-muted/50 animate-pulse rounded-xl" />}>
            <TopPicksRow /> 
          </Suspense>
        </section>

      </div>
    </main>
  )
}