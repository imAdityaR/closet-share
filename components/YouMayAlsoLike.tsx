import Image from 'next/image';
import Link from 'next/link';
import { Sparkle, Star } from 'lucide-react';

// Define what information we need about the current product
interface YouMayAlsoLikeProps {
  currentProduct: {
    id: number;
    productDisplay: string;
    mastercategory: string;
    gender: string;
  };
}

export default async function YouMayAlsoLike({ currentProduct }: YouMayAlsoLikeProps) {
  try {
    // 1. Craft the AI Styling Prompt
    const stylingPrompt = `Complementary styling pieces, accessories, and bottoms to pair with a ${currentProduct.gender} ${currentProduct.mastercategory} styled as ${currentProduct.productDisplay}`;

    // 2. Ping your local Python AI Server
    const response = await fetch('http://127.0.0.1:8000/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: stylingPrompt,
        limit: 4, 
        gender: currentProduct.gender, 
      }),
      next: { revalidate: 3600 } 
    });

    if (!response.ok) throw new Error("Failed to fetch AI recommendations");
    
    const data = await response.json();
    const recommendations = data.data;

    // Filter out the exact item the user is currently looking at
    const filteredRecs = recommendations.filter((item: any) => item.id !== currentProduct.id);

    if (filteredRecs.length === 0) return null;

    // 3. Render the UI Carousel using your sleek ProductCard design
    return (
      <div className="mt-16 border-t border-border pt-10">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground mb-6">
          You May Also Like (By MuseAI)
        </h2>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:gap-x-8">
          {filteredRecs.map((item: any) => (
            <Link key={item.id} href={`/product/${item.id}`} className="group flex flex-col gap-3 relative font-sans">
              
              {/* 1. Image Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted border border-border">
                <Image
                  src={item.imageurl?.startsWith('http') ? item.imageurl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.id}.jpg`}
                  alt={item.productDisplay}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Rating Badge (Bottom Right, shows on hover only) */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-foreground">{item.rating || "4.5"}</span>
                </div>
              </div>

              {/* 2. Details Container (No Add to Cart buttons) */}
              <div className="flex flex-col gap-1.5 px-1">
                <h3 className="text-sm font-sans font-medium text-foreground line-clamp-1 truncate">
                  {item.productDisplay}
                </h3>
                
                <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
                  {item.articletype || item.mastercategory}
                </p>
                
                {/* Note: If your Python API doesn't return rentalpriceperday right now, 
                  this safely hides the price. If it does, it renders perfectly!
                */}
                {item.rentalpriceperday && (
                  <p className="text-sm font-sans font-bold text-foreground mt-1">
                    ₹{item.rentalpriceperday} <span className="text-xs font-normal text-muted-foreground">/day</span>
                  </p>
                )}
              </div>

            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("AI Recommendation Engine Error:", error);
    return null; 
  }
}