"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Sparkles, RefreshCcw, AlertCircle, Loader2 } from 'lucide-react';
import { generateSmartStyleMatch } from '@/lib/actions';
interface SmartCompleteTheLookProps {
  currentProduct: any;
}

export default function SmartCompleteTheLook({ currentProduct }: SmartCompleteTheLookProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [aiThought, setAiThought] = useState("");
  const handleGenerate = async () => {
    setStatus('loading');
    const result = await generateSmartStyleMatch(currentProduct);
    
    if (result.success && result.data.length > 0) {
      setRecommendations(result.data);
      setAiThought(result.aiThought);
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  // 1. IDLE STATE: The Big Shimmering Button
  // 1. IDLE STATE: The Big Shimmering Button
  if (status === 'idle') {
    return (
      <div className="mt-16 border-t border-[#E5D3B3] pt-10 px-1 flex flex-col items-center justify-center py-12 bg-[#C5D8B6]/40 rounded-2xl border-dashed border-[#A9C298]">
        <div className="w-16 h-16 bg-[#D4E7C5] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#D4E7C5]/40 animate-pulse">
          <Sparkles className="w-8 h-8 text-[#5A7337]" />
        </div>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-[#3A4A1B] mb-2">
          Stuck on how to style this?
        </h2>
        <p className="text-[#5A7337] text-sm mb-8 text-center max-w-md">
          Let our AI Stylist analyze color theory and current trends to build the perfect complete outfit for you.
        </p>
        
        {/* Shimmering Button Magic - Using Light Brown */}
        <button 
          onClick={handleGenerate}
          className="relative overflow-hidden rounded-full px-8 py-4 bg-[#A67B5B] text-white font-semibold transition-all hover:scale-105 hover:bg-[#8E6A4D] hover:shadow-lg active:scale-95 group"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] " style={{ animation: 'shimmer 2s infinite' }} />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shimmer { 100% { transform: translateX(100%); } }
          `}} />
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Outfit By MuseAI
          </span>
        </button>
      </div>
    );
  }

  // 2. LOADING STATE: Interactive Dialog
  if (status === 'loading') {
    return (
      <div className="mt-16 border-t border-[#E5D3B3] pt-10 px-1 flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-[#A67B5B] animate-spin mb-4" />
        <h3 className="text-lg font-semibold animate-pulse text-[#A67B5B]">
          AI Stylist is thinking...
        </h3>
        <p className="text-sm text-stone-500 mt-2">Analyzing color theory for {currentProduct.basecolour}...</p>
      </div>
    );
  }

  // 3. ERROR STATE: Image + Error Message
  if (status === 'error') {
    return (
      <div className="mt-16 border-t border-[#E5D3B3] pt-10 px-1 flex flex-col items-center justify-center py-12 bg-red-50/50 rounded-2xl border border-red-100">
        <div className="relative w-32 h-32 mb-4 opacity-80">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-800 mb-2">Outfit Generation Failed</h3>
        <p className="text-sm text-stone-500 mb-6">Our AI stylist is taking a quick coffee break. Please try again.</p>
        <button onClick={handleGenerate} className="flex items-center gap-2 px-6 py-2 border border-[#E5D3B3] bg-white rounded-full hover:bg-[#FAF6F0] text-stone-600 text-sm font-medium transition-colors">
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  // 4. SUCCESS STATE: The AI Styled Grid
  return (
    <div className="mt-16 border-t border-[#E5D3B3] pt-10 px-1">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-800">
              Complete The Look
            </h2>
            {/* Pastel Green Badge */}
            <span className="px-2 py-0.5 bg-[#D4E7C5] text-[#384A20] border border-[#C2D7B2] text-[10px] font-bold uppercase rounded-full shadow-sm">
              By MuseAI
            </span>
          </div>
          {/* Light Brown AI Quote */}
          <p className="text-sm text-[#A67B5B] mt-2 font-medium italic border-l-2 border-[#A67B5B] pl-3">
            "{aiThought}"
          </p>
        </div>
        
        {/* Subtle "Regenerate" Button */}
        <button 
          onClick={handleGenerate} 
          className="group relative flex items-center gap-2 px-4 py-2 border border-[#D4E7C5] bg-[#FAF6F0] hover:bg-[#D4E7C5]/30 rounded-full text-sm font-semibold text-[#5A7337] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <RefreshCcw className="w-3.5 h-3.5 group-active:rotate-180 transition-transform duration-500" /> 
          Generate New Look
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:gap-x-8">
        {recommendations.map((item: any) => (
          <Link key={item.id} href={`/product/${item.id}`} className="group flex flex-col gap-3 relative font-sans">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#FAF6F0] border border-[#E5D3B3]">
              <Image
                src={item.imageurl?.startsWith('http') ? item.imageurl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.id}.jpg`}
                alt={item.productDisplay}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 border border-[#E5D3B3]">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-stone-800">{item.rating || "4.5"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 px-1">
              <h3 className="text-sm font-medium text-stone-800 line-clamp-1">
                {item.productDisplay}
              </h3>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                {item.articletype} • {item.basecolour}
              </p>
              {item.rentalpriceperday && (
                <p className="text-sm font-bold text-stone-800 mt-0.5">
                  ₹{item.rentalpriceperday} <span className="text-[10px] font-normal text-stone-400">/day</span>
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}