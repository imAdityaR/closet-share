"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Package,
  Heart,
  Clock,
  ChevronRight,
  Mail,
  Calendar,
  MapPin,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import {
  AddressFormModal,
  type AddressData,
} from "@/components/address-form-modal";
import { deleteAddress } from "@/lib/actions";
import type { Product } from "@/lib/cart-context";
import { useCart } from "@/lib/cart-context"; // 1. IMPORT CART HOOK
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
interface Order {
  id: string;
  rawId: number;
  items: { id: number; name: string }[];
  totalPaid: number;
  status: string;
  rentalDates: { start: string; end: string };
}

interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
}

interface ProfileClientProps {
  wishlistProducts: Product[];
  orderHistory: Order[];
  addresses: Address[];
  savedOutfits: any[];
}

export function ProfileClient({
  wishlistProducts,
  orderHistory,
  addresses,
  savedOutfits,
}: ProfileClientProps) {
  const { user, isLoaded } = useUser();
  const { addToCart } = useCart(); // 2. INITIALIZE CART HOOK
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "rentals" | "wishlist" | "addresses" | "outfits"
  >("rentals");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // States for Edit and Delete
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fullName =
    isLoaded && user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Valued Member";
  const primaryEmail =
    isLoaded && user ? user.primaryEmailAddress?.emailAddress : "";
  const joinDate =
    isLoaded && user && user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Recently";
  const imageUrl = isLoaded && user ? user.imageUrl : "/placeholder-user.png";

  // Handlers for Address Management
  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      setDeletingId(id);
      await deleteAddress(id);
      setDeletingId(null);
    }
  };

  // 3. HANDLER FOR RENTING FULL OUTFIT
  const handleRentOutfit = (items: any[]) => {
    items.forEach((item) => {
      // Map the DB item to match the Cart Product structure
      const productForCart = {
        id: item.id,
        // Fallback name if your SQL didn't fetch productdisplay
        productDisplay:
          item.productdisplay || `${item.subcategory || "Outfit"} Item`,
        articleType: item.subcategory || "Apparel",
        rentalPricePerDay: item.rentalpriceperday,
        imageUrl: item.imageurl,
      };

      // Default to 3 rental days, just like your ProductCard!
      addToCart(productForCart as any, 3);
    });

    showToast("Full outfit successfully added to your cart!", "success");
  };

  return (
    <main className="min-h-screen bg-background pb-20 pt-10 font-sans">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-border shrink-0">
            <Image
              src={imageUrl}
              alt={fullName}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2">
            <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight mb-3">
              {fullName}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              {primaryEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {primaryEmail}
                </div>
              )}
              <div className="hidden sm:block text-border">•</div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Member since {joinDate}
              </div>
            </div>
            <button className="mt-6 px-6 py-2 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-border mb-8 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => setActiveTab("rentals")}
            className={cn(
              "pb-4 text-sm font-medium transition-colors relative flex items-center gap-2",
              activeTab === "rentals"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Package className="w-4 h-4" /> My Rentals
            <span className="ml-1.5 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
              {orderHistory.length}
            </span>
            {activeTab === "rentals" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={cn(
              "pb-4 text-sm font-medium transition-colors relative flex items-center gap-2",
              activeTab === "wishlist"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart className="w-4 h-4" /> Wishlist
            <span className="ml-1.5 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
              {wishlistProducts.length}
            </span>
            {activeTab === "wishlist" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={cn(
              "pb-4 text-sm font-medium transition-colors relative flex items-center gap-2",
              activeTab === "addresses"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MapPin className="w-4 h-4" /> Addresses
            {activeTab === "addresses" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("outfits")}
            className={cn(
              "pb-4 text-sm font-medium transition-colors relative flex items-center gap-2",
              activeTab === "outfits"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sparkles className="w-4 h-4" /> My Outfits
            <span className="ml-1.5 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
              {savedOutfits.length}
            </span>
            {activeTab === "outfits" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-foreground rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* RENTALS TAB */}
          {activeTab === "rentals" && (
            <div className="flex flex-col gap-4">
              {orderHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-card/30 border border-border border-dashed rounded-2xl">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    No active rentals yet
                  </h3>
                  <Link
                    href="/"
                    className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:opacity-90 transition-opacity mt-4"
                  >
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orderHistory.map((order) => (
                    <Link
                      key={order.id}
                      href={`/order/${order.rawId}`}
                      className="group p-5 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {order.id}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wider",
                              order.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-foreground font-medium mb-1 truncate">
                          {order.items.map((i) => i.name).join(", ")}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <Clock className="w-3.5 h-3.5" />
                          {order.rentalDates.start} to {order.rentalDates.end}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="font-semibold text-foreground">
                          ₹{order.totalPaid}
                        </span>
                        <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <>
              {wishlistProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Your wishlist is empty
                  </h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlistProducts.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add New Address Card */}
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-2xl bg-card/50 hover:bg-muted/50 hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Add New Address
                </span>
              </button>

              {/* Render Saved Addresses */}
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-6 bg-card border border-border rounded-2xl flex flex-col min-h-[200px] relative shadow-sm"
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {address.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    +91 {address.phoneNumber}
                  </p>

                  <div className="text-sm text-foreground flex-1">
                    <p>{address.streetAddress}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex justify-end gap-3">
                    <button
                      onClick={() => handleEditClick(address)}
                      className="text-xs font-medium text-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(address.id)}
                      disabled={deletingId === address.id}
                      className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {deletingId === address.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* OUTFITS TAB */}
          {activeTab === "outfits" && (
            <div className="flex flex-col gap-8">
              {savedOutfits.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Your AI closet is currently empty
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first outfit with Muse AI
                  </p>
                  <Link
                    href="/muse-studio"
                    className="px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Create an Outfit
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {savedOutfits.map((outfit) => {
                    // Calculate total price dynamically
                    const totalPrice = outfit.items.reduce(
                      (sum: number, item: any) =>
                        sum + (Number(item.rentalpriceperday) || 0),
                      0,
                    );

                    return (
                      <div
                        key={outfit.outfit_id}
                        className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6"
                      >
                        {/* DYNAMIC GALLERY */}
                        <div className="flex gap-2 flex-wrap max-w-[200px] md:max-w-none">
                          {outfit.items.map((item: any, i: number) => (
                            <div
                              key={i}
                              className="relative w-24 h-32 md:w-32 md:h-40 rounded-lg overflow-hidden bg-muted border border-border"
                            >
                              <Image
                                src={
                                  item.imageurl.startsWith("http")
                                    ? item.imageurl
                                    : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.id}`
                                }
                                alt="Outfit piece"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col flex-1 justify-center">
                          <h2 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
                            {outfit.outfit_name}
                          </h2>
                          <p className="text-sm text-emerald-600 italic font-medium mb-4">
                            "{outfit.vibe_text}"
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            {outfit.items.length} items curated
                          </p>

                          <div className="mt-auto flex items-center justify-between">
                            <p className="font-bold text-lg">
                              ₹{totalPrice}{" "}
                              <span className="text-xs font-normal text-muted-foreground">
                                /day total
                              </span>
                            </p>

                            {/* 4. THE MAGIC BUTTON - Now adds all items to Cart! */}
                            <button
                              onClick={() => handleRentOutfit(outfit.items)}
                              className="px-5 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:scale-105 transition-transform active:scale-95"
                            >
                              Rent Full Outfit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reusable Modal Component */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialData={editingAddress}
      />
    </main>
  );
}
