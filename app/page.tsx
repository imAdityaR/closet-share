"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Star, ShieldCheck, RefreshCw, Cpu, Wand2, Layers, Search } from "lucide-react"
import CustomOrderModal from "@/components/CustomOrderModal"

// --- DATA ---
const shopByGender = [
  { title: "Women", image: "https://images.unsplash.com/photo-1767785829269-e0fd240df34c?q=80&w=2070&auto=format&fit=crop", link: "/new-arrivals?gender=Women", delay: "delay-100" },
  { title: "Men", image: "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?q=80&w=1974&auto=format&fit=crop", link: "/new-arrivals?gender=Men", delay: "delay-300" }
]
const shopBySeason = [
  { title: "Summer", image: "https://images.unsplash.com/photo-1591601426706-7db9db81ead6?q=80&w=1974&auto=format&fit=crop", link: "/new-arrivals?season=Summer", delay: "delay-100" },
  { title: "Winter", image: "https://images.unsplash.com/photo-1642011402503-4d39c6489898?q=80&w=1920&auto=format&fit=crop", link: "/new-arrivals?season=Winter", delay: "delay-200" },
  { title: "Spring", image: "https://plus.unsplash.com/premium_photo-1661607477077-f5d6ef20c46e?q=80&w=2070&auto=format&fit=crop", link: "/new-arrivals?season=Spring", delay: "delay-300" },
  { title: "Fall", image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1974&auto=format&fit=crop", link: "/new-arrivals?season=Fall", delay: "delay-500" }
]
const shopByUsage = [
  { title: "Casual", image: "https://images.unsplash.com/photo-1741698464215-0dc2c5a5aac6?q=80&w=1974&auto=format&fit=crop", link: "/new-arrivals?usage=Casual", delay: "delay-100" },
  { title: "Ethnic", image: "https://images.unsplash.com/photo-1570212773364-e30cd076539e?q=80&w=687&auto=format&fit=crop", link: "/new-arrivals?usage=Ethnic", delay: "delay-200" },
  { title: "Formal", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop", link: "/new-arrivals?usage=Formal", delay: "delay-300" },
  { title: "Party", image: "https://images.unsplash.com/photo-1718862458358-2b1b421aa830?q=80&w=1974&auto=format&fit=crop", link: "/new-arrivals?usage=Party", delay: "delay-500" }
]
const shopByCategory = [
  { title: "Apparel", image: "https://images.unsplash.com/photo-1649361811423-a55616f7ab11?q=80&w=2070&auto=format&fit=crop", link: "/new-arrivals?masterCategory=Apparel", delay: "delay-100" },
  { title: "Accessories", image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?q=80&w=2015&auto=format&fit=crop", link: "/new-arrivals?masterCategory=Accessories", delay: "delay-300" }
]
const museAIFeatures = [
  { icon: Wand2, title: "Prompt-to-Outfit", description: "Type 'Sunset beach wedding in Goa' and watch MuseAI instantly generate a fully styled, shoppable 4-piece outfit from our live inventory." },
  { icon: Sparkles, title: "Smart 'Complete the Look'", description: "Browsing a blazer? Our semantic vector search instantly suggests the perfect matching trousers and accessories to complete your vibe." },
  { icon: Layers, title: "Algorithmic 'For You'", description: "Our recommendation engine learns your unique style preferences, tracking engagements to build a dashboard tailored exactly to your taste." },
  { icon: Search, title: "Vibe & Concept Search", description: "Ditch standard filters. Search by aesthetic, mood, or complex style descriptions, and let our embedded vector database find the perfect match." }
]
const stats = [
  { value: "4K+", label: "Styles Available" },
  { value: "50K+", label: "Happy Renters" },
  { value: "4.9★", label: "Average Rating" }
]

// --- 3D TILT CARD ---
type CategoryItem = { title: string; image: string; link: string; delay: string }

const CategoryCard = ({ item, className = "" }: { item: CategoryItem; className?: string }) => {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = ((y - rect.height / 2) / rect.height) * -14
    const ry = ((x - rect.width / 2) / rect.width) * 14
    card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`
    const shine = card.querySelector(".card-shine") as HTMLElement
    if (shine) shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,230,200,0.22) 0%, transparent 65%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
    const shine = card.querySelector(".card-shine") as HTMLElement
    if (shine) shine.style.background = "transparent"
  }, [])

  return (
    <Link
      href={item.link}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-[2rem] group scroll-reveal opacity-0 translate-y-12 scale-95 shadow-xl ${item.delay} ${className}`}
      style={{ transition: "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1), opacity 1s, scale 1s", transformStyle: "preserve-3d" }}
    >
      <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110" />
      {/* Layered gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a0e07]/90 via-[#3d1f0d]/20 to-transparent z-10" />
      
      {/* Shine layer */}
      <div className="card-shine absolute inset-0 z-20 transition-all duration-100 rounded-[2rem] pointer-events-none" />
      
      {/* Glass tag top-right */}
      <div className="absolute top-5 right-5 z-30 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
        <span className="text-white/90 text-[10px] tracking-[0.2em] uppercase font-semibold">{item.title}</span>
      </div>
      <div className="absolute bottom-0 left-0 p-8 z-30 w-full flex items-end justify-between">
        <div>
          <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-1.5 font-medium opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-500 delay-75">Shop Now</p>
          <h3 className="text-2xl font-serif font-bold text-white tracking-wide drop-shadow-lg">{item.title}</h3>
        </div>
        <div className="w-11 h-11 rounded-full backdrop-blur-xl bg-white/15 border border-white/25 flex items-center justify-center text-white translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-[#C06B41] group-hover:border-[#C06B41] transition-all duration-500 shadow-lg">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

// --- SECTION HEADER ---
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-5 mb-8 scroll-reveal opacity-0 translate-y-12 transition-all duration-700 ease-out">
    <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground whitespace-nowrap">{children}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
  </div>
)

// --- MAIN PAGE ---
export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [typedSlogan, setTypedSlogan] = useState("")
  const fullSlogan = "Wear the luxury. Own the moment."

  // --- TYPING EFFECT ---
  useEffect(() => {
    let idx = 0
    let deleting = false
    let timer: NodeJS.Timeout
    const type = () => {
      if (!deleting) {
        setTypedSlogan(fullSlogan.slice(0, idx + 1))
        idx++
        if (idx === fullSlogan.length) { deleting = true; timer = setTimeout(type, 2500); return }
        timer = setTimeout(type, 68)
      } else {
        setTypedSlogan(fullSlogan.slice(0, idx - 1))
        idx--
        if (idx === 0) { deleting = false; timer = setTimeout(type, 900); return }
        timer = setTimeout(type, 28)
      }
    }
    timer = setTimeout(type, 800)
    return () => clearTimeout(timer)
  }, [])

  // --- SCROLL REVEAL ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-12", "scale-95")
            entry.target.classList.add("opacity-100", "translate-y-0", "scale-100")
          } else {
            entry.target.classList.remove("opacity-100", "translate-y-0", "scale-100")
            entry.target.classList.add("opacity-0", "translate-y-12", "scale-95")
          }
        })
      },
      { threshold: 0.07 }
    )
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden pb-20">

      {/* ── INLINE STYLES ─────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Earthy CSS vars ── */
        :root {
          --terracotta: #C06B41;
          --sage:        #7A9E7E;
          --clay:        #8B5E3C;
          --sand:        #D4B896;
          --espresso:    #2C1810;
          --cream:       #F8F2EA;
        }

        /* ── Grain overlay ── */
        .grain-overlay {
          position: fixed;
          inset: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.038;
          pointer-events: none;
          z-index: 9999;
          animation: grain-shift 8s steps(10) infinite;
        }
        @keyframes grain-shift {
          0%,100%{ transform: translate(0,0); }
          10%{ transform: translate(-3%,-4%); }
          20%{ transform: translate(-7%,3%); }
          30%{ transform: translate(4%,-2%); }
          40%{ transform: translate(-3%,6%); }
          50%{ transform: translate(-5%,-5%); }
          60%{ transform: translate(3%,4%); }
          70%{ transform: translate(-6%,2%); }
          80%{ transform: translate(5%,-3%); }
          90%{ transform: translate(-4%,5%); }
        }

        /* ── Morphing blobs ── */
        @keyframes blob-morph {
          0%,100%{ border-radius:60% 40% 30% 70%/60% 30% 70% 40%; transform:rotate(0deg) scale(1); }
          25%{ border-radius:30% 60% 70% 40%/50% 60% 30% 60%; transform:rotate(90deg) scale(1.05); }
          50%{ border-radius:50% 60% 30% 70%/30% 70% 60% 40%; transform:rotate(180deg) scale(0.95); }
          75%{ border-radius:70% 30% 60% 40%/40% 50% 60% 50%; transform:rotate(270deg) scale(1.08); }
        }
        .blob-1{ animation: blob-morph 18s ease-in-out infinite; }
        .blob-2{ animation: blob-morph 22s ease-in-out infinite reverse; }

        /* ── Hero fade-up ── */
        @keyframes fade-up {
          from{ opacity:0; transform:translateY(28px); }
          to{ opacity:1; transform:translateY(0); }
        }
        .anim-fade-up {
          opacity: 0;
          animation: fade-up 0.8s cubic-bezier(0.23,1,0.32,1) forwards;
        }

        /* ── Glass pill ── */
        .glass-pill {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        /* ── Button shimmer sweep ── */
        @keyframes shimmer-sweep {
          0%{ transform: translateX(-130%) skewX(-20deg); }
          100%{ transform: translateX(250%) skewX(-20deg); }
        }
        .btn-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: shimmer-sweep 2.8s ease-in-out infinite;
          pointer-events: none;
        }

        /* ── Earthy gradient text ── */
        .earthy-gradient-text {
          background: linear-gradient(135deg, #C06B41, #D4B896, #7A9E7E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Hero title accent ── */
        @keyframes shimmer-anim {
          0%{ background-position: 200% center; }
          100%{ background-position: -200% center; }
        }
        .hero-title-accent {
          background: linear-gradient(90deg, #C06B41, #f5c99e, #D4B896, #C06B41);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-anim 4s linear infinite;
        }

        /* ── Muse AI shimmer ── */
        .muse-shimmer-text {
          background: linear-gradient(90deg, #C06B41, #D4B896, #7A9E7E, #C06B41);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-anim 3.5s linear infinite;
        }

        /* ── MuseAI card border sweep ── */
        @keyframes border-sweep {
          0%,100%{ opacity:0; }
          50%{ opacity:1; }
        }
        .muse-card-border {
          position: absolute; inset: 0; border-radius: 1.5rem;
          background: conic-gradient(from 0deg at 50% 50%, transparent 0%, #C06B41 25%, transparent 50%);
          opacity: 0;
          transition: opacity 0.4s;
          z-index: 0;
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .group:hover .muse-card-border { opacity: 1; animation: rotate-border 3s linear infinite; }
        @keyframes rotate-border {
          to{ transform: rotate(360deg); }
        }

        /* ── Horizontal scrollbar hide ── */
        .hide-scrollbar::-webkit-scrollbar{ display:none; }
        .hide-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }

        /* ── Scroll transition passthrough ── */
        .scroll-reveal {
          transition: opacity 0.9s cubic-bezier(0.23,1,0.32,1),
                      transform 0.9s cubic-bezier(0.23,1,0.32,1);
        }

        /* ── Stats count-up pulse ── */
        @keyframes stat-pulse {
          0%,100%{ text-shadow: 0 0 0px rgba(192,107,65,0); }
          50%{ text-shadow: 0 0 20px rgba(192,107,65,0.4); }
        }
        .stat-value { animation: stat-pulse 3s ease-in-out infinite; }

        /* ── Floating orb ── */
        @keyframes float-orb {
          0%,100%{ transform: translateY(0) translateX(0); }
          33%{ transform: translateY(-20px) translateX(10px); }
          66%{ transform: translateY(10px) translateX(-8px); }
        }
        .float-orb { animation: float-orb 8s ease-in-out infinite; }
        .float-orb-delay { animation: float-orb 11s ease-in-out infinite 2s; }
      `}} />

      {/* ── OVERLAYS ─────────────────────────────────────────────────── */}
      <div className="grain-overlay" aria-hidden="true" />

      <CustomOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative w-full pt-32 pb-44 flex flex-col items-center text-center border-b border-border overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Premium Fashion Banner"
            fill
            className="object-cover scale-[1.04]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0e07]/70 via-[#1a0e07]/35 to-background" />
        </div>

        {/* Morphing blob accents */}
        <div className="blob-1 float-orb absolute top-16 left-[8%] w-72 h-72 rounded-full bg-[#C06B41]/15 blur-[80px] z-[3] pointer-events-none" aria-hidden="true" />
        <div className="blob-2 float-orb-delay absolute bottom-16 right-[8%] w-80 h-80 rounded-full bg-[#7A9E7E]/12 blur-[90px] z-[3] pointer-events-none" aria-hidden="true" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-[#D4B896]/10 blur-[60px] z-[3] pointer-events-none" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 flex flex-col items-center">

          <div className="anim-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill border border-white/20 text-sm font-medium mb-8 text-white shadow-xl" style={{ animationDelay: "0.05s" }}>
            <Sparkles className="w-4 h-4 text-[#D4B896]" />
            <span className="tracking-wide">Premium Fashion Rental</span>
          </div>

          <h1 className="anim-fade-up text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 tracking-tight text-white" style={{ animationDelay: "0.18s", textShadow: "0 4px 40px rgba(0,0,0,0.5)" }}>
            Rent the{" "}
            <span className="hero-title-accent italic">Runway.</span>
          </h1>

          <p className="anim-fade-up text-xl md:text-2xl text-white/85 mb-10 h-9 font-medium" style={{ animationDelay: "0.30s", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            {typedSlogan}
            <span className="inline-block w-0.5 h-6 ml-1 bg-[#D4B896] animate-pulse translate-y-1" />
          </p>

          <div className="anim-fade-up flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4" style={{ animationDelay: "0.42s" }}>
            <Link
              href="/new-arrivals"
              className="group relative px-8 py-4 bg-[#C06B41] hover:bg-[#A35632] transition-colors text-white rounded-full  flex items-center justify-center gap-2 overflow-hidden shadow-[0_8px_40px_rgba(192,107,65,0.45)]"
            >
              <span className="relative z-10 flex items-center gap-2 tracking-wide">
                Explore Catalog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="btn-shimmer" />
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-4 glass-pill text-white border border-white/20 rounded-full  flex items-center justify-center gap-2 overflow-hidden hover:border-[#D4B896]/50 transition-colors hover:bg-white/10 "
            >
              <span className="relative z-10 flex items-center gap-2 tracking-wide">
                Request Custom Product
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="btn-shimmer" />
            </button>
          </div>

          
        </div>
      </section>

      {/* ════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-3 gap-4 py-10 border-b border-border">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center scroll-reveal opacity-0 translate-y-12"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <p className="stat-value text-3xl md:text-4xl font-serif font-bold earthy-gradient-text">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5 tracking-widest uppercase font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SHOP BY GENDER
      ════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-5 py-14">
        <SectionHeader>Shop by Gender</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
          {shopByGender.map((item, i) => <CategoryCard key={i} item={item} />)}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SHOP BY SEASON
      ════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-5 py-14">
        <SectionHeader>Shop by Season</SectionHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 h-[300px] md:h-[400px]">
          {shopBySeason.map((item, i) => <CategoryCard key={i} item={item} />)}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SHOP BY OCCASION
      ════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-5 py-14">
        <SectionHeader>Shop by Occasion</SectionHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 h-[300px] md:h-[400px]">
          {shopByUsage.map((item, i) => <CategoryCard key={i} item={item} />)}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SHOP BY CATEGORY
      ════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-5 py-14">
        <SectionHeader>Shop by Category</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
          {shopByCategory.map((item, i) => <CategoryCard key={i} item={item} />)}
        </div>
      </section>

      {/* ════════════════════════════════════════
          MUSE AI
      ════════════════════════════════════════ */}
      <section className="relative w-full py-24 mt-8 overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C06B41]/5 via-transparent to-[#7A9E7E]/5" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C06B41]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7A9E7E]/30 to-transparent" />
        <div className="float-orb absolute top-10 right-1/4 w-[500px] h-[500px] bg-[#C06B41]/8 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="float-orb-delay absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[#7A9E7E]/8 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

        {/* Header */}
        <div className="max-w-7xl mx-auto px-5 mb-12 scroll-reveal opacity-0 translate-y-12 transition-all duration-700">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C06B41]/10 border border-[#C06B41]/25 mb-5">
            <Cpu className="w-3.5 h-3.5 text-[#C06B41]" />
            <span className="text-[12px]  uppercase tracking-[0.2em] text-[#C06B41]">Powered by Gemini</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Meet{" "}
            <span className="muse-shimmer-text">MuseAI</span>.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Experience our exclusive Agentic styling engine. Generate complete looks, find perfect matches, and discover your true aesthetic.
          </p>
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-5 px-5 md:px-12 pb-6 max-w-[100vw]">
          {museAIFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="min-w-[300px] md:min-w-[380px] snap-center shrink-0 group relative p-8 rounded-3xl border border-border/60 scroll-reveal opacity-0 translate-y-12 scale-95 overflow-hidden"
              style={{
                transitionDelay: `${idx * 100}ms`,
                background: "rgba(var(--card-rgb, 255,250,245), 0.5)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)"
              }}
            >
              {/* Animated conic border on hover */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(192,107,65,0.15) 0%, transparent 60%)",
                  border: "1px solid rgba(192,107,65,0.3)"
                }}
              />
              {/* Top shine */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C06B41]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg, rgba(192,107,65,0.12), rgba(212,184,150,0.12))",
                    border: "1px solid rgba(192,107,65,0.2)"
                  }}
                >
                  <feature.icon className="w-6 h-6 text-[#C06B41] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:earthy-gradient-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-5 py-24">
        {/* Section heading */}
        <div className="text-center mb-16 scroll-reveal opacity-0 translate-y-12 scale-95 transition-all duration-700">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#C06B41]" />
            <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#C06B41]">Simple Process</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#C06B41]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">How it Works</h2>
          <p className="text-muted-foreground text-lg">Three effortless steps to your dream look.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[38%] left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px bg-gradient-to-r from-[#C06B41]/30 via-[#D4B896]/50 to-[#7A9E7E]/30 z-0" />
          {/* Connector dots */}
          <div className="hidden md:block absolute top-[38%] left-1/3 w-2 h-2 -translate-x-1 -translate-y-1 rounded-full bg-[#D4B896] z-10" />
          <div className="hidden md:block absolute top-[38%] right-1/3 w-2 h-2 translate-x-1 -translate-y-1 rounded-full bg-[#D4B896] z-10" />

          {[
            {
              icon: Star, step: "01", title: "Choose",
              desc: "Browse our curated collection and select the perfect outfit for your occasion and dates."
            },
            {
              icon: ShieldCheck, step: "02", title: "Receive",
              desc: "We dry-clean and deliver it to your door in our signature packaging, ready to wear."
            },
            {
              icon: RefreshCw, step: "03", title: "Return",
              desc: "Pack it back in our reusable bag. We handle the pickup and cleaning — zero hassle."
            }
          ].map((step, i) => (
            <div
              key={i}
              className={`relative z-10 group flex flex-col items-center text-center p-9 rounded-[2rem] border border-border scroll-reveal opacity-0 translate-y-12 scale-95 overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 delay-${(i + 1) * 100}`}
              style={{
                background: "rgba(var(--card-rgb, 255,250,245), 0.6)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(225deg, rgba(192,107,65,0.12) 0%, transparent 70%)" }} />
              {/* Step number ghost */}
              <div className="absolute top-4 left-6 text-7xl font-serif font-bold text-[#C06B41]/5 select-none leading-none">{step.step}</div>

              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-all duration-500"
                style={{
                  background: "linear-gradient(135deg, rgba(192,107,65,0.1), rgba(212,184,150,0.15))",
                  border: "1px solid rgba(192,107,65,0.18)"
                }}
              >
                <step.icon className="w-7 h-7 text-[#C06B41]" />
              </div>
              <div className="text-xs tracking-[0.2em] uppercase font-semibold text-[#C06B41] mb-2">{step.step}</div>
              <h3 className="text-xl font-serif font-bold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          EARTHY CTA BANNER
      ════════════════════════════════════════ */}
      <section className="w-full max-w-7xl mx-auto px-5 pb-12">
        <div
          className="scroll-reveal opacity-0 translate-y-12 relative overflow-hidden rounded-[2.5rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: "linear-gradient(135deg, #2C1810 0%, #8B5E3C 50%, #C06B41 100%)",
          }}
        >
          {/* Grain on banner */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
          />
          {/* Float orbs inside banner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] float-orb pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#D4B896]/10 rounded-full blur-[50px] float-orb-delay pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[#D4B896] text-xs tracking-[0.3em] uppercase font-semibold mb-3">Limited Time</p>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">First Rental, 20% Off.</h3>
            <p className="text-white/65 text-sm max-w-sm">Premium styles for every occasion — try them before you buy, and fall in love with renting.</p>
          </div>
          <Link
            href="/new-arrivals"
            className="relative z-10 shrink-0 px-8 py-4 rounded-full font-semibold flex items-center gap-2 overflow-hidden text-[#2C1810] hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(90deg, #D4B896, #f5e0c8)" }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Exploring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="btn-shimmer" />
          </Link>
        </div>
      </section>

    </div>
  )
}