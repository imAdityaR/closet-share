"use client"

import { useState, useTransition, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { addAddress, updateAddress } from "@/lib/actions"
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
  "Lakshadweep", "Puducherry"
]

export interface AddressData {
  id?: number
  fullName: string
  phoneNumber: string
  streetAddress: string
  city: string
  state: string
  postalCode: string
}

interface AddressFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: AddressData | null
}

export function AddressFormModal({ isOpen, onClose, initialData }: AddressFormModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  if (!isOpen) return null

  const isEditMode = !!initialData

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      let result;
      if (isEditMode && initialData.id) {
        result = await updateAddress(initialData.id, formData)
      } else {
        result = await addAddress(formData)
      }
      
      if (result && result.error) {
        setError(result.error)
      } else {
        onClose() 
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-xl font-semibold mb-1">
          {isEditMode ? "Edit Address" : "Add New Address"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">Where should we deliver your rentals?</p>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <input name="fullName" type="text" defaultValue={initialData?.fullName} required className="w-full p-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
            <div className="flex border border-border rounded-xl bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
              <span className="p-2.5 text-sm font-medium bg-muted text-muted-foreground border-r border-border shrink-0">
                +91
              </span>
              <input 
                name="phoneNumber" 
                type="text" 
                maxLength={10} 
                pattern="\d{10}"
                title="Please enter exactly 10 digits"
                defaultValue={initialData?.phoneNumber} 
                required 
                placeholder="9876543210"
                className="w-full p-2.5 text-sm bg-transparent border-none focus:outline-none focus:ring-0" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Street Address</label>
            <input name="streetAddress" type="text" defaultValue={initialData?.streetAddress} required className="w-full p-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <input name="city" type="text" defaultValue={initialData?.city} required className="w-full p-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">PIN Code</label>
              <input name="postalCode" type="text" maxLength={6} pattern="\d{6}" title="Please enter a valid 6-digit PIN" defaultValue={initialData?.postalCode} required className="w-full p-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">State</label>
            <select name="state" defaultValue={initialData?.state || ""} required className="w-full p-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
              <option value="" disabled>Select a state...</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full mt-2 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Saving..." : (isEditMode ? "Update Address" : "Save Address")}
          </button>
        </form>
      </div>
    </div>
  )
}