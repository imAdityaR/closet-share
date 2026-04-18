"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  ChevronLeft,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { useCart, type Product } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import {
  toggleWishlist as toggleWishlistAction,
  submitReview,
} from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
export function ProductDetailClient({
  product,
  canReview,
  initialReviews,
  children, // <-- ADD THIS PROP
}: {
  product: any;
  canReview: boolean;
  initialReviews: any[];
  children?: React.ReactNode; // <-- ADD THIS TYPE
}) {
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { items, addToCart, updateRentalDays, removeFromCart } = useCart();
  const { isWishlisted, toggleWishlist: toggleContextWishlist } = useWishlist();

  const cartItem = items.find((i) => i.product.id === product.id);
  const isInCart = !!cartItem;
  const currentlyWishlisted = isWishlisted(product.id);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const { showToast } = useToast();

  const handleWishlistClick = () => {
    toggleContextWishlist(product.id);
    startTransition(async () => {
      try {
        await toggleWishlistAction(product.id);
      } catch (error) {
        toggleContextWishlist(product.id);
      }
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    try {
      await submitReview(product.id, rating, comment);
      setShowReviewModal(false);
      window.location.reload();
    } catch (error: any) {
      alert(
        error.message ||
          "Failed to submit review. Make sure you have rented this item first.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20 pt-8 font-sans">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start mb-20">
          {/* IMAGE SECTION */}
          <div className="relative aspect-[3/4] md:aspect-[4/5] w-full bg-card rounded-xl overflow-hidden border border-border">
            <button
              onClick={handleWishlistClick}
              disabled={isPending}
              className="absolute top-4 right-4 z-20 p-2.5 bg-background/80 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 hover:scale-105"
            >
              <Heart
                className={cn(
                  "w-5 h-5",
                  currentlyWishlisted
                    ? "fill-[#69a33d] text-[#69a33d]" // <-- Added brackets here
                    : "text-muted-foreground",
                )}
              />
            </button>
            {!imgError && (
              <Image
                src={
                  product.imageUrl?.startsWith("http")
                    ? product.imageUrl
                    : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${product.id}.jpg`
                }
                alt={product.productDisplay}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* PRODUCT DETAILS SECTION */}
          <div className="flex flex-col gap-6 md:sticky md:top-24">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {product.gender}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                  {product.articletype}
                </span>
              </div>
              <h1 className="font-serif text-3xl font-semibold text-foreground leading-tight tracking-tight mb-3">
                {product.productDisplay}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(Number(product.rating))
                          ? "fill-yellow-500 text-yellow-500"
                          : "fill-muted text-muted",
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">{product.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount}{" "}
                  {product.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-sans text-2xl font-bold text-foreground">
                  ₹{product.rentalpriceperday}
                </span>
                <span className="font-sans text-muted-foreground text-sm">
                  / day
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border mt-4 w-fit">
                <ShieldCheck className="w-4.5 h-4.5 text-green-600 shrink-0" />
                <span>
                  Security Deposit:{" "}
                  <strong className="text-foreground">
                    ₹{product.securityDeposit}
                  </strong>
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-border my-2" />

            <div className="pt-2">
              {isInCart && cartItem ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Rental Duration
                  </p>
                  <div className="flex items-center justify-between border border-border bg-card rounded-lg p-1 w-36 shadow-sm">
                    <button
                      onClick={() =>
                        cartItem.rentalDays > 1
                          ? updateRentalDays(
                              product.id,
                              cartItem.rentalDays - 1,
                            )
                          : removeFromCart(product.id)
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/50 hover:bg-muted text-foreground"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-sans font-semibold text-sm text-foreground">
                      {cartItem.rentalDays}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        days
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        updateRentalDays(product.id, cartItem.rentalDays + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/50 hover:bg-muted text-foreground"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    addToCart(product, 3);
                    showToast("Item added to cart", "success");
                  }}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 shadow-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-8 border-t border-border font-sans text-sm">
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Color</p>
                <p className="font-medium text-foreground">
                  {product.basecolour}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Usage</p>
                <p className="font-medium text-foreground">{product.usage}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Season</p>
                <p className="font-medium text-foreground">{product.season}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Year</p>
                <p className="font-medium text-foreground">{product.year}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- COMPLETE THE LOOK RENDERS HERE! --- */}
        {children}

        {/* REVIEWS SECTION */}
        <div className="border-t border-border pt-12 mt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-semibold">
              Customer Reviews
            </h2>
            {canReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-5 py-2 bg-foreground text-background text-sm font-medium rounded-full"
              >
                Write a Review
              </button>
            )}
          </div>

          {initialReviews.length === 0 ? (
            <p className="text-muted-foreground">
              No customer reviews yet. Rent this item to be the first!
            </p>
          ) : (
            <div className="grid gap-6">
              {initialReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 border border-border rounded-xl bg-card"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= rev.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-muted text-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Verified Renter
                  </p>
                  <p className="text-sm text-muted-foreground">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REVIEW MODAL */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            {/* Modal Code Unchanged */}
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl relative">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-xl font-semibold mb-6">
                Review {product.productDisplay}
              </h3>

              <form onSubmit={handleReviewSubmit}>
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8",
                          (hoverRating || rating) >= star
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-muted text-muted",
                        )}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the fit? Did you get compliments?"
                  className="w-full p-3 border border-border rounded-xl bg-background text-sm mb-6 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
