import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import MuseAIOutfitMaker from "@/components/MuseAIOutfitMaker";
import { auth,currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import MuseOutfitsDisplay from "./MuseOutfitsDisplay";
import WelcomeOverlay from "./WelcomeOverlay"; // <-- 1. Import the new animation overlay!

export const metadata = {
  title: "MuseAI Studio | AI Fashion Stylist",
  description:
    "Describe your vibe and let our AI curate the perfect outfit for you.",
};

export default async function MuseStudioPage() {
  const user = await currentUser();

  if (!user) {
    const { redirectToSignIn } = await auth(); 
    return redirectToSignIn(); 
  }

  // Fetch the saved outfits
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
            'subcategory', p.subcategory,
            'productdisplay', p.productdisplay
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

  return (
    <main className="min-h-screen bg-background pb-20 pt-8 font-sans relative">
      {/* 2. Place the overlay at the top! It covers the screen on load and then destroys itself */}
      <WelcomeOverlay />

      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Navigation / Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* The Main AI Generator */}
        <MuseAIOutfitMaker />

        {/* The Saved Outfits Section */}

        <div className="mt-8 p-6 md:p-8 border rounded-3xl bg-gradient-to-b from-[#342311]/70 to-background shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D4E7C5]/50 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-[#5A7337]" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-stone-800 tracking-tight flex items-center gap-3">
              Your AI Closet
              <span className="px-2 py-1.5 bg-[#D4E7C5] text-[#384A20] border border-[#C2D7B2] text-[10px] font-bold rounded-full shadow-sm mb-1">
                By MuseAI
              </span>
            </h2>
          </div>

          <MuseOutfitsDisplay initialOutfits={savedOutfits} />
          {/* <MuseOutfitsDisplay initialOutfits={savedOutfits} /> goes here */}
        </div>
      </div>
    </main>
  );
}
