"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle2, MapPin, Calendar, CreditCard, Plus, Loader2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { AddressFormModal } from "@/components/address-form-modal"
import { createOrder } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { useToast } from "@/lib/toast-context"
export function CheckoutClient({ addresses }: { addresses: any[] }) {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [isPending, startTransition] = useTransition()
  
  // Checkout State
  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<number | null>(addresses.length > 0 ? addresses[0].id : null)
  const [deliveryType, setDeliveryType] = useState<"Now" | "Pre-book">("Now")
  const [startDate, setStartDate] = useState<string>("")
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  // Calculations
  const rentalTotal = items.reduce((total, item) => total + (item.product.rentalPricePerDay * item.rentalDays), 0)
  const depositTotal = items.reduce((total, item) => total + Number(item.product.securityDeposit), 0)
  const grandTotal = rentalTotal + depositTotal
  
  // Max rental days determines the return date for the whole order
  const maxRentalDays = items.length > 0 ? Math.max(...items.map(i => i.rentalDays)) : 3

  // Format today's date for inputs
  const today = new Date().toISOString().split('T')[0]

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans">
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <button onClick={() => router.push('/profile')} className="px-6 py-2 bg-primary text-primary-foreground rounded-full">View Orders</button>
      </div>
    )
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) return alert("Please select an address")
    if (deliveryType === "Pre-book" && !startDate) return alert("Please select a start date")

    const finalStartDate = deliveryType === "Now" ? new Date() : new Date(startDate)
    const finalEndDate = new Date(finalStartDate)
    const { showToast } = useToast();
    finalEndDate.setDate(finalStartDate.getDate() + maxRentalDays)

    const orderData = {
      cartItems: items.map(i => ({ productId: i.product.id, rentalDays: i.rentalDays, price: i.product.rentalPricePerDay })),
      addressId: selectedAddress,
      deliveryType,
      startDate: finalStartDate.toISOString().split('T')[0],
      endDate: finalEndDate.toISOString().split('T')[0],
      totalAmount: grandTotal
    }

    startTransition(async () => {
      const res = await createOrder(orderData)
      if (res.success) {
        clearCart()
        showToast("Order placed successfully!", "success")
        router.push('/profile') // Send them to dashboard to see their active order!
      } else {
        showToast("Checkout failed: " + res.error, "error")
      }
    })
  }

  return (
    <main className="min-h-screen bg-background pb-20 pt-10 font-sans">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1fr,400px] gap-10">
        
        {/* Left Column: Checkout Steps */}
        <div className="flex flex-col gap-6">
          <h1 className="font-serif text-3xl font-bold mb-4">Secure Checkout</h1>

          {/* STEP 1: ADDRESS */}
          <div className={cn("p-6 rounded-2xl border transition-all", step === 1 ? "border-primary shadow-sm bg-card" : "border-border bg-muted/30 opacity-70")}>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</div>
              <h2 className="text-xl font-semibold flex items-center gap-2"><MapPin className="w-5 h-5"/> Shipping Address</h2>
            </div>
            
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      onClick={() => setSelectedAddress(addr.id)}
                      className={cn("p-4 rounded-xl border cursor-pointer transition-all", selectedAddress === addr.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50")}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{addr.fullName}</span>
                        {selectedAddress === addr.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.streetAddress}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                  ))}
                  
                  <button onClick={() => setIsAddressModalOpen(true)} className="p-4 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors min-h-[120px]">
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Add New Address</span>
                  </button>
                </div>
                
                <button 
                  disabled={!selectedAddress}
                  onClick={() => setStep(2)} 
                  className="px-8 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Continue to Schedule
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: SCHEDULE */}
          <div className={cn("p-6 rounded-2xl border transition-all", step === 2 ? "border-primary shadow-sm bg-card" : "border-border bg-muted/30 opacity-70")}>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
              <h2 className="text-xl font-semibold flex items-center gap-2"><Calendar className="w-5 h-5"/> Delivery Date</h2>
            </div>

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <label className={cn("flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3", deliveryType === "Now" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50")}>
                    <input type="radio" name="delivery" checked={deliveryType === "Now"} onChange={() => setDeliveryType("Now")} className="w-4 h-4 accent-primary" />
                    <div>
                      <span className="block font-semibold">Instant Delivery (Now)</span>
                      <span className="text-xs text-muted-foreground">Arrives within 2-4 hours</span>
                    </div>
                  </label>
                  
                  <label className={cn("flex-1 p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3", deliveryType === "Pre-book" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50")}>
                    <input type="radio" name="delivery" checked={deliveryType === "Pre-book"} onChange={() => setDeliveryType("Pre-book")} className="w-4 h-4 accent-primary" />
                    <div>
                      <span className="block font-semibold">Pre-book (Future Date)</span>
                      <span className="text-xs text-muted-foreground">Reserve for an upcoming event</span>
                    </div>
                  </label>
                </div>

                {deliveryType === "Pre-book" && (
                  <div className="mb-6 p-4 border border-border rounded-xl bg-background">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Select Start Date</label>
                    <input 
                      type="date" 
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-6 py-3 border border-border rounded-full font-medium hover:bg-muted">Back</button>
                  <button 
                    disabled={deliveryType === "Pre-book" && !startDate}
                    onClick={() => setStep(3)} 
                    className="px-8 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: PAYMENT */}
          <div className={cn("p-6 rounded-2xl border transition-all", step === 3 ? "border-primary shadow-sm bg-card" : "border-border bg-muted/30 opacity-70")}>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", step === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>3</div>
              <h2 className="text-xl font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5"/> Payment Method</h2>
            </div>

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 border border-primary bg-primary/5 rounded-xl flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-primary-foreground" /></div>
                    <span className="font-semibold text-foreground">Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Pay at doorstep</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-6 py-3 border border-border rounded-full font-medium hover:bg-muted">Back</button>
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={isPending}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {isPending ? "Processing..." : `Place Order • ₹${grandTotal}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="sticky top-24 h-fit p-6 bg-card border border-border rounded-2xl shadow-sm">
          <h3 className="font-serif text-xl font-semibold mb-4 border-b border-border pb-4">Order Summary</h3>
          
          <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                  <Image src={item.product.imageUrl?.startsWith('http') ? item.product.imageUrl : `https://res.cloudinary.com/dmnzwforu/image/upload/v1/closetshare-images/${item.product.id}.jpg`} alt="Item" fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-sm font-semibold line-clamp-1">{item.product.productDisplay}</p>
                  <p className="text-xs text-muted-foreground mb-1">{item.rentalDays} days rental</p>
                  <p className="text-sm font-bold">₹{item.product.rentalPricePerDay * item.rentalDays}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm border-t border-border pt-4 mb-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Rental Subtotal</span>
              <span className="font-medium text-foreground">₹{rentalTotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Refundable Deposit</span>
              <span className="font-medium text-green-600">₹{depositTotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="font-medium text-foreground">Free</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-4">
            <span className="font-semibold text-lg">Total to Pay</span>
            <span className="font-bold text-2xl text-primary">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      <AddressFormModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
    </main>
  )
}