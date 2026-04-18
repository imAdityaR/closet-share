"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1. Wait 2 seconds, then trigger the fade-out animation
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // 2. Wait an additional 800ms for the fade to finish, then remove from DOM completely
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF6F0] transition-opacity duration-1000 ease-in-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-1000 ease-out">
        {/* Glowing, gently bouncing Sparkle */}
        <div className="w-20 h-20 bg-[#D4E7C5]/50 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,231,197,0.8)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[#C5D8B6] animate-ping opacity-20 rounded-full" />
          <Sparkles className="w-10 h-10 text-[#5A7337] animate-pulse" />
        </div>
        
        {/* Premium Typography */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-stone-800 tracking-tight">
            Welcome to <span className="text-[#A67B5B]">Muse Studio</span>
          </h1>
          <p className="text-[#5A7337] text-sm md:text-base font-medium tracking-[0.2em] uppercase animate-pulse">
            Initializing your AI Stylist...
          </p>
        </div>
      </div>
    </div>
  );
}