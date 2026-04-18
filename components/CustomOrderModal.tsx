"use client"

import { useState } from "react"
import Image from "next/image"
import { getPreviewForUser, submitCustomOrderRequest } from "@/lib/actions"
import { Loader2, ArrowRight, CheckCircle, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface CustomOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CustomOrderModal({ isOpen, onClose }: CustomOrderModalProps) {
  const { isSignedIn } = useUser()
  
  const [url, setUrl] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    
    const res = await getPreviewForUser(url)
    if (res.success) setPreview(res.data)
    else alert(res.error) 
    
    setLoading(false)
  }

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) return alert("Please select rental dates")
    setSubmitting(true)

    const res = await submitCustomOrderRequest({
      url: url,
      title: preview.productDisplay,
      imageUrl: preview.imageUrl,
      estimatedPrice: preview.rentalPricePerDay,
      startDate,
      endDate
    })

    if (res.success) {
      setSuccess(true)
    }
    setSubmitting(false)
  }

  // Reset modal state when closing
  const handleClose = () => {
    setUrl("")
    setStartDate("")
    setEndDate("")
    setPreview(null)
    setSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-8 md:p-12">
          {!isSignedIn ? (
            <div className="max-w-2xl mx-auto p-12 text-center bg-emerald-50 rounded-2xl border border-emerald-100 mt-4">
              <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
              <p className="text-gray-600 mb-6">
                You need to be signed in to create a custom order.
              </p>
            </div>
          ) : success ? (
            <div className="max-w-2xl mx-auto p-12 text-center bg-emerald-50 rounded-2xl border border-emerald-100 mt-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Our team is verifying the item and availability. You will be notified within 24 hours once approved and product is available.
              </p>
              <button onClick={handleClose} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Done
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-serif font-bold mb-2 pr-8">Can't find it? Rent it anyway.</h2>
              <p className="text-muted-foreground mb-8">
                Paste a link from Zara, Myntra, or Amazon. We'll buy it, host it, and rent it to you.
              </p>

              {/* URL Input Form */}
              <form onSubmit={handlePreview} className="flex flex-col sm:flex-row gap-3 mb-8">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste external product link here..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  required
                  disabled={loading || preview}
                />
                <button
                  type="submit"
                  disabled={loading || preview}
                  className="bg-black text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Preview Item"}
                </button>
              </form>

              {/* The Estimated Preview & Date Selection */}
              {preview && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="relative w-32 md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shrink-0 mx-auto md:mx-0">
                      <Image src={preview.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mb-3">Estimated Details</span>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{preview.productDisplay}</h3>
                      <p className="text-2xl font-light mb-6">₹{preview.rentalPricePerDay} <span className="text-sm text-gray-500">/ day</span></p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full mt-1 p-2 border rounded" required />
                        </div>
                      </div>

                      <button 
                        onClick={handleSubmitRequest}
                        disabled={submitting}
                        className="w-full bg-emerald-950 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>Submit Order Request <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}