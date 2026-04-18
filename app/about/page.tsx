"use client"

import Link from "next/link"
import { Sparkles, Link2, MessageSquare, Star, Cpu, ArrowRight, Layers } from "lucide-react"

export default function AboutPage() {
  const platformFeatures = [
    {
      icon: Cpu,
      title: "MuseAI Virtual Stylist",
      description: "Experience our advanced Agentic AI workflow. Input a highly specific scenario—like 'Moody winter wedding in the hills'—and MuseAI will instantly parse your intent, query our Neon PostgreSQL database via vector search, and generate a completely curated, shoppable outfit from our live inventory.",
    },
    {
      icon: Layers,
      title: "Algorithmic 'For You' Feed",
      description: "Our custom recommendation engine tracks weighted user engagement metrics across views, wishlists, and past rentals. It learns your unique category and gender affinities to deliver a highly personalized feed, alongside real-time aggregated global trending picks.",
    },
    {
      icon: Link2,
      title: "On-Demand Product Sourcing",
      description: "Breaking the boundaries of traditional catalogs. If you can't find what you're looking for, simply paste a URL from Amazon, Myntra, or Zara. Our automated Cheerio/ScraperAPI ETL pipeline bypasses bot protections, extracts the product data, and drafts it for instant rental approval.",
    },
    {
      icon: Sparkles,
      title: "Smart 'Complete the Look'",
      description: "While browsing any individual product, our semantic vector-search AI dynamically analyzes the garment's embeddings and usage context. It immediately suggests perfect complementary pieces (e.g., matching a structured blazer with a flowing palazzo) to finish your outfit.",
    },
    {
      icon: MessageSquare,
      title: "Integrated Support Ecosystem",
      description: "A seamless, built-in helpdesk ticketing system ensures that any rental inquiries, delivery tracking requests, or platform issues are resolved directly within your user dashboard, bridging the gap between platform and customer success.",
    },
    {
      icon: Star,
      title: "Verified Rental Reviews",
      description: "Every item features verified community ratings powered by strict server-side logic. Only users who have actively rented, received, and returned a specific item are permitted to leave reviews, ensuring absolute authenticity for our community.",
    },
  ]

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-[#D4E7C5]/50">
      {/* Custom Keyframes for Shimmer Effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}} />

      {/* Earthy Background Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#D4E7C5]/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#AEC3AE]/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-5 md:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-screen-lg mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F0E6]/50 border border-[#AEC3AE]/50 backdrop-blur-md mb-4">
            <Sparkles className="w-4 h-4 text-[#4A5D4E]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-[#4A5D4E]">
              Next-Gen E-Commerce
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight">
            More Than a Closet.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A5D4E] via-[#A67B5B] to-[#4A5D4E] animate-shimmer">
              An AI-Powered Ecosystem.
            </span>
          </h1>
          <p className="text-lg md:text-xl font-sans text-muted-foreground max-w-2xl leading-relaxed">
            ClosetShare bridges the gap between premium sustainable fashion and cutting-edge machine learning. 
            Discover how our intelligent microservices redefine how you discover, rent, and wear clothing.
          </p>
        </div>
      </section>

      {/* Horizontal Long Description Features */}
      <section className="px-5 md:px-8 py-16 relative">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-16 border-b border-border/50 pb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Platform Capabilities
            </h2>
          </div>

          <div className="flex flex-col">
            {platformFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative flex flex-col md:flex-row gap-6 md:gap-12 items-start py-12 border-b border-border/50 transition-all duration-500 ease-out hover:bg-[#F4F7F4]/50 hover:px-8 -mx-8 px-8 rounded-3xl ${index === 0 ? 'border-t-0' : ''}`}
              >
                {/* Icon Container with Coffee & Green Accents */}
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-background border border-[#AEC3AE]/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#4A5D4E] group-hover:border-[#4A5D4E] group-hover:shadow-lg group-hover:shadow-[#4A5D4E]/20 transition-all duration-500 z-10">
                  <feature.icon className="w-8 h-8 text-[#4A5D4E] group-hover:text-[#FDFBF7] transition-colors duration-500" />
                </div>

                {/* Content Container */}
                <div className="flex-1 space-y-4">
                  {/* Heading: Solid foreground by default, Shimmers Earthy tones on hover */}
                  <h3 className="font-serif text-2xl md:text-3xl font-bold transition-all duration-300">
                    <span className="text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#4A5D4E] group-hover:via-[#A67B5B] group-hover:to-[#4A5D4E] group-hover:bg-[length:200%_auto] group-hover:animate-shimmer transition-all duration-300">
                      {feature.title}
                    </span>
                  </h3>
                  
                  {/* Horizontal Long Description */}
                  <p className="text-base md:text-lg font-sans text-muted-foreground leading-relaxed max-w-4xl group-hover:text-foreground/90 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative Arrow that slides in on hover */}
                <div className="hidden md:flex shrink-0 items-center justify-center h-16 opacity-0 -translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  <ArrowRight className="w-8 h-8 text-[#AEC3AE]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earthy CTA */}
      <section className="px-5 md:px-8 py-24 mb-12">
        <div className="max-w-screen-md mx-auto text-center bg-[#F4F7F4]/80 backdrop-blur-xl border border-[#AEC3AE]/40 rounded-[3rem] p-12 md:p-16 relative overflow-hidden shadow-xl shadow-[#D4E7C5]/10">
          {/* Subtle inner blobs for the CTA box */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4E7C5]/40 rounded-full blur-[80px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#A67B5B]/10 rounded-full blur-[80px] -z-10" />
          
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#3A2E2A] mb-4">
            Experience the Platform
          </h2>
          <p className="text-base font-sans text-[#685A53] mb-8 max-w-lg mx-auto">
            Ready to test out the MuseAI stylist or request a custom import? Dive into the ecosystem today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/new-arrivals"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#4A5D4E] text-white font-sans font-medium text-sm hover:bg-[#3A4A3E] hover:scale-105 transition-all shadow-lg shadow-[#4A5D4E]/20 flex items-center justify-center gap-2"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#8B9D8B] bg-white/50 backdrop-blur-sm text-[#3A2E2A] font-sans font-medium text-sm hover:bg-white hover:scale-105 transition-all text-center"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}