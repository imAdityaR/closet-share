import Link from "next/link"
import {
  Search,
  Wand2,
  Link as LinkIcon,
  ShoppingBag,
  MessageCircle,
  ArrowRight
} from "lucide-react"

export default function HowItWorksPage() {
  const journeySteps = [
    {
      icon: Search,
      number: "01",
      title: "Discover & Personalize",
      description: "Start by browsing our catalog. As you view, wishlist, and interact with items, our algorithm updates your custom 'For You' dashboard with personalized Top Picks and Global Trending items.",
    },
    {
      icon: Wand2,
      number: "02",
      title: "Style with MuseAI",
      description: "Not sure what to wear? Open the MuseAI Studio, type in your event (e.g., 'Sunset Beach Party'), and let our Agentic AI scan our inventory to generate a complete, shoppable outfit tailored to you.",
    },
    {
      icon: LinkIcon,
      number: "03",
      title: "Request Custom Imports",
      description: "Want something we don't have? Go to our Import tool and paste a product link from Amazon or Myntra. Our automated pipeline will scrape the item and review it for integration into our rental platform.",
    },
    {
      icon: ShoppingBag,
      number: "04",
      title: "Flexible Rental Checkout",
      description: "Add your items to the cart and proceed to our multi-step checkout. Choose 'Now' or 'Pre-book' delivery. Our system automatically calculates your daily rental rates and refundable security deposits.",
    },
    {
      icon: MessageCircle,
      number: "05",
      title: "Return, Rate & Support",
      description: "Once your rental period is over, return the item. Drop a verified review to help the community, and if you ever face an issue, our integrated Helpdesk is just a click away to resolve your tickets.",
    },
  ]

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Background Ambience */}
      <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Hero */}
      <section className="px-5 md:px-8 pt-24 pb-16 md:pt-32 md:pb-24 border-b border-border/50 bg-card/10 backdrop-blur-sm">
        <div className="max-w-screen-lg mx-auto text-center space-y-6">
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-primary">
            The User Journey
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight">
            How to Use <span className="italic font-light text-primary">ClosetShare</span>
          </h1>
          <p className="text-lg font-sans text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From algorithmic discovery to AI outfit generation and custom sourcing. Here is exactly how you interact with our platform's powerful features.
          </p>
        </div>
      </section>

      {/* Premium Staggered Steps (Reflecting App Flow) */}
      <section className="px-5 md:px-8 py-20 md:py-32">
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Connecting Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-primary/0 via-border to-primary/0 -translate-x-1/2" />

          <div className="space-y-12 md:space-y-24">
            {journeySteps.map((step, index) => (
              <div key={step.number} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                
                {/* Visual Side */}
                <div className="flex-1 w-full md:w-1/2 flex justify-center">
                  <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-card/30 backdrop-blur-xl border border-border/50 shadow-2xl flex items-center justify-center group">
                    <div className="absolute inset-0 rounded-full border border-primary/20 scale-[1.15]" />
                    <step.icon className="w-12 h-12 md:w-16 md:h-16 text-primary group-hover:scale-110 transition-transform duration-500" />
                    
                    {/* Floating Step Number */}
                    <div className={`absolute -top-2 ${index % 2 === 0 ? '-right-2' : '-left-2'} w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center font-serif font-bold text-primary shadow-sm`}>
                      {step.number}
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className={`flex-1 w-full md:w-1/2 text-center ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-base font-sans text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-8 py-24 border-t border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="max-w-screen-md mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to interact with MuseAI?
          </h2>
          <p className="text-lg font-sans text-muted-foreground mb-10 max-w-lg mx-auto">
            Test the recommendation engine, generate an outfit, or request your first custom item import.
          </p>
          <Link
            href="/muse-ai"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-foreground text-background font-sans font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all shadow-xl hover:shadow-primary/20"
          >
            Launch MuseAI Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}