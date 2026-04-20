import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics, } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { RootLayoutClient } from '@/components/root-layout-client'
import { Toast } from '@radix-ui/react-toast'
import { ToastProvider } from '@/lib/toast-context'


const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'ClosetShare — Rent Premium Fashion',
  description: 'Discover and rent curated fashion pieces. Premium clothing rental for the modern wardrobe.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/logoSquare.png', media: '(prefers-color-scheme: light)' },
      { url: '/logoSquare.png', media: '(prefers-color-scheme: dark)' },
      { url: '/logoSquare.png', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}>
      <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <RootLayoutClient>
                {children}
              </RootLayoutClient>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}