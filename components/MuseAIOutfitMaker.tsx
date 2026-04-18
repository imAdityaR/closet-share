"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Wand2, Save, RefreshCcw, ArrowRight, Loader2 } from "lucide-react";
import { createMuseOutfit, saveOutfitToProfile } from "@/lib/actions";
import { useToast } from "@/lib/toast-context";
export default function MuseAIOutfitMaker() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [gender, setGender] = useState<"Men" | "Women">("Men"); 
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "saved">("idle");
  const [vibeText, setVibeText] = useState("");
  const [outfitItems, setOutfitItems] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setStatus("loading");
    const { showToast } = useToast();
    
    try {
      const result = await createMuseOutfit(prompt, gender); 
      
      if (result.success && Array.isArray(result.outfit) && result.outfit.length > 0) {
        setVibeText(result.vibe);
        setOutfitItems(result.outfit);
        setStatus("success");
        showToast("Outfit generated! You can save it to your profile.", "success");
      } else {
        setStatus("idle");
        showToast("MuseAI couldn't generate an outfit. Try again", "error");

      }
    } catch (e) {
      console.error("Client side error:", e);
      setStatus("idle");
      showToast("Something went wrong connecting to MuseAI.", "error");
    }
  };

  const handleSave = async () => {
    const ids = outfitItems.map(item => item.id);
    const saveResult = await saveOutfitToProfile(`MuseAI: ${prompt.substring(0, 20)}...`, vibeText, gender, ids);
    const { showToast } = useToast();
    if (saveResult.success) {
      setStatus("saved");
      showToast("Outfit saved to your profile!", "success");
    } else {
      showToast("Failed to save to your closet.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      
      {/* 1. THE PROMPT BOX */}
      <div className="bg-[#FAF6F0]/90 backdrop-blur-sm border border-[#D4E7C5] rounded-3xl p-6 shadow-sm mb-12 relative overflow-hidden">
        {/* Pastel Green decorative blur is now more prominent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4E7C5]/50 blur-[100px] rounded-full pointer-events-none" />
        
        <h2 className="font-serif text-3xl font-bold text-stone-800 flex items-center gap-3 mb-2 relative z-10">
          <Sparkles className="w-8 h-8 text-[#9CB380] animate-pulse" />
          MuseAI Studio
        </h2>
        <p className="text-stone-500 mb-6 relative z-10">
          Describe your vibe, occasion, or aesthetic in plain English. We'll build the perfect outfit.
        </p>

        {/* 4. THE GENDER TOGGLE UI - Now driven by Pastel Green */}
        <div className="flex gap-4 mb-4 relative z-10">
          <button 
            onClick={() => setGender("Men")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              gender === "Men" 
                ? "bg-[#D4E7C5] text-[#384A20] shadow-sm" 
                : "bg-white border border-[#D4E7C5] text-stone-500 hover:bg-[#F4F9F0]"
            }`}
          >
            Menswear
          </button>
          <button 
            onClick={() => setGender("Women")}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              gender === "Women" 
                ? "bg-[#D4E7C5] text-[#384A20] shadow-sm" 
                : "bg-white border border-[#D4E7C5] text-stone-500 hover:bg-[#F4F9F0]"
            }`}
          >
            Womenswear
          </button>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A relaxed but sharp outfit for a sunset beach wedding in Goa. I want light colors and breathable fabrics."
          className="w-full h-32 p-4 bg-white border border-[#D4E7C5] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#D4E7C5] transition-all text-stone-800 placeholder:text-stone-400 relative z-10 shadow-inner"
        />
        
        <div className="flex justify-end mt-4 relative z-10">
          {/* Primary Action Button - Beautiful Pastel Green */}
          <button
            onClick={handleGenerate}
            disabled={status === "loading" || !prompt}
            className="group relative flex items-center gap-2 px-8 py-4 bg-[#D4E7C5] text-[#384A20] font-bold rounded-full hover:bg-[#C2D7B2] hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none overflow-hidden"
          >
            {status === "loading" ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Curating Look...</>
            ) : (
              <>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Wand2 className="w-5 h-5" /> Generate Magic
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. THE GENERATED OUTFIT */}
      {(status === "success" || status === "saved") && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between mb-8 border-b border-[#D4E7C5] pb-4">
            <div>
              <h3 className="text-xl font-bold text-stone-800">Your Curated Fit</h3>
              <p className="text-[#6A8A4A] font-medium italic mt-1">"{vibeText}"</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleGenerate}
                className="p-3 bg-white border border-[#D4E7C5] hover:bg-[#F4F9F0] text-[#384A20] rounded-full transition-colors shadow-sm"
                title="Generate Again"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
              
              {/* Dynamic Save Button - Here we use the Light Brown to make it pop distinctively! */}
              {status === "success" ? (
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-[#A67B5B] text-white hover:bg-[#8E6A4D] font-medium rounded-full transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Outfit
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 px-6 py-2 border-2 border-[#D4E7C5] text-[#5A7337] font-bold bg-[#D4E7C5]/20 rounded-full hover:bg-[#D4E7C5]/40 transition-colors"
                >
                  Go to Profile <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Render the Outfit Pieces */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {outfitItems.map((item, idx) => (
              <div key={item.id} className="group relative flex flex-col">
                <div className="absolute -left-3 top-4 z-10">
                  {/* Outfit Tags updated to Pastel Green with dark text */}
                  <span className="bg-[#8db370] text-[#384A20] text-[10px] font-bold px-3 py-1 rounded-r-full shadow-sm uppercase tracking-wider border border-[#C2D7B2]">
                    {idx === 0 ? "Topwear" : idx === 1 ? "Bottomwear" : idx === 2 ? "Footwear" : item.subcategory}
                  </span>
                </div>
                
                <Link href={`/product/${item.id}`} className="aspect-[3/4] w-full relative overflow-hidden rounded-2xl bg-[#FAF6F0] border border-[#D4E7C5] shadow-sm mb-4">
                  <Image
                    src={item.imageurl?.startsWith('http') ? item.imageurl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.id}.jpg`}
                    alt={item.productDisplay}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                
                <div className="px-1">
                  <h4 className="font-semibold text-stone-800 line-clamp-1">{item.productDisplay}</h4>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">{item.basecolour} • {item.articletype}</p>
                  <p className="font-bold text-sm text-stone-800 mt-2">₹{item.rentalpriceperday} <span className="font-normal text-xs text-stone-400">/day</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}