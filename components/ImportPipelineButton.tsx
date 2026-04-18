// components/ImportPipelineButton.tsx
import Link from "next/link"
import { DatabaseZap } from "lucide-react"

export default function ImportPipelineButton() {
  return (
    // 1. The Invisible Wrapper (Allows the tooltip to escape)
    <Link 
      href="/admin/products/import"
      className="group relative inline-block focus:outline-none"
    >
      {/* 2. Custom Tailwind Tooltip (Floats freely above) */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 z-50">
        <div className="bg-black text-white text-xs py-1.5 px-3 rounded-md shadow-xl whitespace-nowrap border border-gray-800">
          Import Products Using URLs from Sites Like Myntra, Ajio, etc.
        </div>
        <div className="w-2 h-2 bg-black rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-b border-r border-gray-800"></div>
      </div>

      {/* 3. The Physical Button Container (Strictly clips the shimmer!) */}
      <div className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-950 px-6 py-3 font-medium text-white transition-all group-hover:scale-[1.02] group-hover:bg-emerald-900 group-active:scale-95 shadow-lg shadow-emerald-900/20">
        
        {/* The Text and Icon */}
        <span className="relative z-10 flex items-center gap-2 text-sm tracking-wide">
          <DatabaseZap className="w-4 h-4 text-emerald-400/80" />
          Import From Partner Brands
        </span>

        {/* The Shiny Sweep Effect (Now perfectly trapped) */}
        <div className="absolute inset-0 z-0 flex -translate-x-full justify-center animate-shimmer">
          <div className="h-full w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Subtle green border glow */}
        <div className="absolute inset-0 z-0 rounded-xl border border-emerald-500/0 transition-colors group-hover:border-emerald-500/40 pointer-events-none" />
      </div>
    </Link>
  )
}