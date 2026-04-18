"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { extractProductData, saveProductToDatabase, getPendingRequests } from "@/lib/import-action"
import { Search, Loader2, CheckCircle, Save, AlertCircle, Bell, User } from "lucide-react"

export default function ImportProductPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [draft, setDraft] = useState<any>(null)
  const [activeRequest, setActiveRequest] = useState<any>(null) // Tracks if this draft belongs to a user order
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Load pending requests on mount
  useEffect(() => {
    async function loadRequests() {
      const res = await getPendingRequests()
      if (res.success) setPendingRequests(res.data || [])
    }
    loadRequests()
  }, [successMsg]) // Reload queue when a new item is successfully approved

  // Flow A: Admin manually scrapes a link
  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setLoading(true)
    setError("")
    setSuccessMsg("")
    setDraft(null)
    setActiveRequest(null)

    const response = await extractProductData(url)
    if (response.success) setDraft(response.data)
    else setError(response.error)
    
    setLoading(false)
  }

  // Flow B: Admin clicks "Review" on a user's pending request
  const loadUserRequestIntoDraft = (req: any) => {
    setError("")
    setSuccessMsg("")
    setActiveRequest(req)
    // Convert the DB request row into our standard draft format
    setDraft({
      productDisplay: req.scraped_title,
      imageUrl: req.scraped_image_url,
      rentalPricePerDay: req.estimated_rental_price,
      securityDeposit: req.estimated_rental_price * 3, // Auto-calculate standard deposit
      gender: "", baseColour: "", season: "", masterCategory: "",
      subCategory: "", articleType: "", usage: "",
      year: new Date().getFullYear().toString()
    })
  }

  // Unified Save: Handles both manual imports AND request approvals
  const handleSaveToDb = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    // If activeRequest exists, pass it so the backend fulfills the order
    const requestContext = activeRequest 
      ? { requestId: activeRequest.id, userId: activeRequest.user_id } 
      : undefined

    const response = await saveProductToDatabase(draft, requestContext)

    if (response.success) {
      setSuccessMsg(activeRequest 
        ? "Request Approved! Product added & user order created." 
        : "Product successfully extracted and added to catalog!"
      )
      setDraft(null) 
      setActiveRequest(null)
      setUrl("")
    } else {
      setError(response.error)
    }
    setSaving(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDraft({ ...draft, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-serif font-bold mb-2">Import & Curate Inventory</h1>
      <p className="text-muted-foreground mb-8">Manage user custom requests or extract new data from external links.</p>

      {/* NEW: The User Request Queue */}
      {pendingRequests.length > 0 && !draft && (
        <div className="mb-10 bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" /> Pending User Requests ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-xl border shadow-sm flex gap-4 items-center">
                <div className="w-16 h-20 relative rounded bg-gray-100 shrink-0 overflow-hidden">
                  <Image src={req.scraped_image_url} alt="Req" fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm truncate">{req.scraped_title}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" /> {req.user_email}
                  </p>
                  <p className="text-xs font-mono text-emerald-600 mt-1">
                    {new Date(req.rental_start_date).toLocaleDateString()} - {new Date(req.rental_end_date).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => loadUserRequestIntoDraft(req)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 shrink-0"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: URL Extraction Form (Hidden if reviewing a request) */}
      {!activeRequest && (
        <form onSubmit={handleExtract} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Manual Import: Paste URL (e.g., https://www.myntra.com/...)"
              className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
              required={!draft}
              disabled={loading || saving}
            />
          </div>
          <button
            type="submit"
            disabled={loading || saving}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium min-w-[140px] flex items-center justify-center hover:bg-gray-800 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "1. Extract Data"}
          </button>
        </form>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl mb-6 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {error}</div>}
      {successMsg && <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl mb-6 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {successMsg}</div>}

      {/* STEP 2: The "God Mode" Review Form */}
      {draft && (
        <form onSubmit={handleSaveToDb} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-bold">Step 2: Review & Edit Attributes</h2>
              {activeRequest && (
                <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <User className="w-4 h-4"/> Fulfilling request for: {activeRequest.user_email}
                </p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${activeRequest ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {activeRequest ? 'Approval Mode' : 'Draft Mode'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Image Preview */}
            <div className="flex flex-col gap-4 w-full lg:w-64 shrink-0">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                <Image src={draft.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image URL (Cloudinary)</label>
                <input name="imageUrl" value={draft.imageUrl} onChange={handleChange} className="w-full p-2 text-sm border rounded mt-1 font-mono text-gray-600 bg-gray-50" required />
              </div>
            </div>
            
            {/* Right Column: Every Database Field */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Title (Display Name) *</label>
                <input name="productDisplay" value={draft.productDisplay} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1 focus:border-black outline-none" required />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rental / Day (₹) *</label>
                <input type="number" name="rentalPricePerDay" value={draft.rentalPricePerDay} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Security Deposit (₹) *</label>
                <input type="number" name="securityDeposit" value={draft.securityDeposit} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Launch Year</label>
                <input type="number" name="year" value={draft.year} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Master Category</label>
                <select name="masterCategory" value={draft.masterCategory} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1 bg-white">
                  <option value="">Select...</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Footwear">Footwear</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sub Category</label>
                <input name="subCategory" value={draft.subCategory} onChange={handleChange} placeholder="e.g. Topwear, Bottomwear" className="w-full p-2.5 border border-gray-300 rounded-lg mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Article Type</label>
                <input name="articleType" value={draft.articleType} onChange={handleChange} placeholder="e.g. Suits, Dresses, Lehengas" className="w-full p-2.5 border border-gray-300 rounded-lg mt-1" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                <select name="gender" value={draft.gender} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1 bg-white">
                  <option value="">Select...</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Base Colour</label>
                <input name="baseColour" value={draft.baseColour} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Season</label>
                <select name="season" value={draft.season} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg mt-1 bg-white">
                  <option value="">Select...</option>
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Usage Occasion</label>
                <input name="usage" value={draft.usage} onChange={handleChange} placeholder="e.g. Formal, Casual, Ethnic, Party" className="w-full p-2.5 border border-gray-300 rounded-lg mt-1" />
              </div>
              
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-8 pt-6 border-t flex items-center justify-end gap-4">
            <button 
              type="button" 
              onClick={() => {
                setDraft(null)
                setActiveRequest(null)
              }} 
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-black text-white px-8 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors font-medium shadow-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {activeRequest ? 'Approve & Create Order' : '2. Save to Live Database'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}