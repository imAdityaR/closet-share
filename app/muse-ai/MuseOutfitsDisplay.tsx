"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";

export default function MuseOutfitsDisplay({
  initialOutfits,
}: {
  initialOutfits: any[];
}) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleRentOutfit = (items: any[]) => {
    items.forEach((item) => {
      const productForCart = {
        id: item.id,
        productDisplay:
          item.productdisplay || `${item.subcategory || "Outfit"} Item`,
        articleType: item.subcategory || "Apparel",
        rentalPricePerDay: item.rentalpriceperday,
        imageUrl: item.imageurl,
      };
      addToCart(productForCart as any, 3);
    });
    showToast("Full outfit successfully added to your cart!", "success");
  };

  if (initialOutfits.length === 0) {
    return (
      <div className="text-center py-16 bg-[#FAF6F0]/50 rounded-3xl border border-dashed border-[#D4E7C5]">
        <p className="text-[#5A7337] font-medium text-lg">
          Your curated closet is empty.
        </p>
        <p className="text-stone-500 text-sm mt-2">
          Generate and save an outfit above to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {initialOutfits.map((outfit) => {
        const totalPrice = outfit.items.reduce(
          (sum: number, item: any) =>
            sum + (Number(item.rentalpriceperday) || 0),
          0,
        );

        return (
          <div
            key={outfit.outfit_id}
            className="bg-white border border-[#E5D3B3] rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow"
          >
            {/* DYNAMIC GALLERY */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
              {outfit.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="relative w-28 h-36 md:w-32 md:h-44 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#E5D3B3] shrink-0 group"
                >
                  <Image
                    src={
                      item.imageurl.startsWith("http")
                        ? item.imageurl
                        : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.id}`
                    }
                    alt="Outfit piece"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col flex-1 justify-center py-2">
              <h2 className="text-2xl font-bold text-stone-800 mb-1">
                {outfit.outfit_name}
              </h2>
              <p className="text-base text-[#A67B5B] italic font-medium mb-4">
                "{outfit.vibe_text}"
              </p>

              <div className="inline-block px-3 py-1 bg-[#F4F9F0] border border-[#D4E7C5] rounded-full w-max mb-6">
                <p className="text-[10px] text-[#384A20] uppercase tracking-widest font-bold">
                  {outfit.items.length} items curated
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100">
                <p className="font-bold text-xl text-stone-800">
                  ₹{totalPrice}{" "}
                  <span className="text-sm font-normal text-stone-400">
                    /day total
                  </span>
                </p>

                <button
                  onClick={() => handleRentOutfit(outfit.items)}
                  className="px-8 py-3 bg-[#D4E7C5] text-[#384A20] rounded-full text-sm font-bold hover:bg-[#C2D7B2] hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-sm"
                >
                  Rent Full Outfit
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
