"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Minus, Plus } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { toggleWishlist as toggleWishlistAction } from "@/lib/actions";
import { useCart } from "@/lib/cart-context";
import { useTransition, useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
export function ProductCard({ product }: { product: any }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { items, addToCart, updateRentalDays, removeFromCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [imgError, setImgError] = useState(false);

  // Wishlist State
  const currentlyWishlisted = isWishlisted(product.id);

  // Cart State
  const cartItem = items.find((i) => i.product.id === product.id);
  const isInCart = !!cartItem;
  const { showToast } = useToast();
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Stops Link navigation
    e.stopPropagation();
    toggleWishlist(product.id);
    startTransition(async () => {
      try {
        await toggleWishlistAction(product.id);
      } catch (error) {
        toggleWishlist(product.id);
      }
    });
  };

  const handleCartClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault(); // Stops Link navigation
    e.stopPropagation();
    action();
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col gap-3 relative font-sans"
    >
      {/* 1. Image Container (Wishlist + Rating inside) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted border border-border">
        {!imgError && (
          <Image
            src={
              product.imageUrl?.startsWith("http")
                ? product.imageUrl
                : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${product.id}.jpg`
            }
            alt={product.productDisplay}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}

        {/* Wishlist Button (Top Right, shows on hover) */}
        <button
          onClick={handleWishlistClick}
          disabled={isPending}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-all active:scale-95"
          aria-label={
            currentlyWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
          }
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              currentlyWishlisted
                ? "fill-[#69a33d] text-[#69a33d]"
                : "text-foreground",
            )}
          />
        </button>

        {/* Rating Badge (Bottom Right, shows on hover only) */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span className="text-foreground">{product.rating || "4.0"}</span>
        </div>
      </div>

      {/* 2. Details Container */}
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className="text-sm font-sans font-medium text-foreground line-clamp-1 truncate">
          {product.productDisplay}
        </h3>

        <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
          {product.articleType}
        </p>

        <p className="text-sm font-sans font-bold text-foreground mt-1">
          ₹{product.rentalPricePerDay}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            /day
          </span>
        </p>

        {/* 3. Smart Cart Controls - RESTORED THE Days Bar */}
        <div className="pt-2">
          {isInCart && cartItem ? (
            <div className="flex items-center justify-between border border-border bg-card rounded-lg p-1 w-fit shadow-inner">
              <button
                onClick={(e) =>
                  handleCartClick(e, () =>
                    cartItem.rentalDays > 1
                      ? updateRentalDays(product.id, cartItem.rentalDays - 1)
                      : removeFromCart(product.id),
                  )
                }
                className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Decrease rental days"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="font-sans font-semibold text-sm text-foreground px-4">
                {cartItem.rentalDays}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  days
                </span>
              </span>

              <button
                onClick={(e) =>
                  handleCartClick(e, () =>
                    updateRentalDays(product.id, cartItem.rentalDays + 1),
                  )
                }
                className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Increase rental days"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) =>
                handleCartClick(e, () => {
                  addToCart(product, 3);
                  showToast(
                    "Item successfully added to your cart!",
                    "success",
                  );
                })
              }
              className="px-6 py-2.5 rounded-full border border-border bg-background text-foreground text-sm font-medium hover:bg-muted hover:border-primary/50 transition-all shadow-sm active:scale-95"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
