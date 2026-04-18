"use client"

import { useState, useTransition, useMemo } from "react"
import Image from "next/image"
import { addProduct, fetchProductById, updateProduct } from "@/lib/admin-actions" 
import { Plus, X, UploadCloud, Loader2, Package, BarChart3, Pencil, Search } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import ImportPipelineButton from "@/components/ImportPipelineButton"

export function AdminInventoryClient({ initialInventory }: { initialInventory: any[] }) {
  // --- NEW: Modal & Edit State ---
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null)
  const [activeProductId, setActiveProductId] = useState<number | null>(null)
  const [searchId, setSearchId] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  
  // EXPANDED FORM STATE: Covers all Kaggle Dataset Columns
  const [imageUrl, setImageUrl] = useState("")
  const [formData, setFormData] = useState({
    productDisplay: "",
    gender: "Women",
    masterCategory: "Apparel",
    subCategory: "Topwear",
    articleType: "",
    baseColour: "",
    season: "Summer",
    usage: "Casual",
    rentalPrice: "",
    securityDeposit: ""
  })

  // --- DATA AGGREGATION FOR CHARTS (UNTOUCHED) ---
  const stats = useMemo(() => {
    const countBy = (key: string) => {
      const counts: Record<string, number> = {}
      initialInventory.forEach(item => {
        const val = item[key] || "Uncategorized"
        counts[val] = (counts[val] || 0) + 1
      })
      return Object.entries(counts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value) 
    }

    return {
      masterCategory: countBy('category'), 
      season: countBy('season'),
      usage: countBy('usage'),
      articleType: countBy('articleType').slice(0, 6) 
    }
  }, [initialInventory])

  // --- NEW: Fetch Existing Product ---
  const handleFetchProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchId) return
    
    setIsFetching(true)
    const res = await fetchProductById(Number(searchId))
    
    if (res.success && res.data) {
      setActiveProductId(res.data.id)
      setImageUrl(res.data.imageUrl || res.data.imageurl || "")
      
      // Populate form exactly with DB attributes
      setFormData({
        productDisplay: res.data.productDisplay || res.data.productdisplay || "",
        gender: res.data.gender || "",
        masterCategory: res.data.masterCategory || res.data.mastercategory || "",
        subCategory: res.data.subCategory || res.data.subcategory || "",
        articleType: res.data.articleType || res.data.articletype || "",
        baseColour: res.data.baseColour || res.data.basecolour || "",
        season: res.data.season || "",
        usage: res.data.usage || "",
        rentalPrice: res.data.rentalPricePerDay?.toString() || res.data.rentalpriceperday?.toString() || "",
        securityDeposit: res.data.securityDeposit?.toString() || res.data.securitydeposit?.toString() || ""
      })
    } else {
      alert(res.error || "Product not found.")
    }
    setIsFetching(false)
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setActiveProductId(null)
    setSearchId("")
    setImageUrl("")
    setFormData({ productDisplay: "", gender: "Women", masterCategory: "Apparel", subCategory: "Topwear", articleType: "", baseColour: "", season: "Summer", usage: "Casual", rentalPrice: "", securityDeposit: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl) return alert("Please upload an image first!")

    startTransition(async () => {
      const payload = {
        ...formData,
        rentalPrice: Number(formData.rentalPrice),
        securityDeposit: Number(formData.securityDeposit),
        imageUrl
      }
      
      if (modalMode === "add") {
        await addProduct(payload)
      } else if (modalMode === "edit" && activeProductId) {
        await updateProduct(activeProductId, payload)
      }
      
      handleCloseModal()
      window.location.reload()
    })
  }

  const HorizontalBarChart = ({ title, data }: { title: string, data: { label: string, value: number }[] }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1) 
    return (
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col h-full">
        <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          {title}
        </h3>
        <div className="space-y-4 flex-1">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No data available.</p>
          ) : (
            data.map((item, i) => {
              const percentage = Math.round((item.value / maxVal) * 100)
              return (
                <div key={i} className="group">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground font-mono">{item.value}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden flex">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Inventory Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Tracking {initialInventory.length} total items in stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setModalMode("edit")} className="bg-white border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
            <Pencil className="w-4 h-4" /> Edit Product
          </button>
          <button onClick={() => setModalMode("add")} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <ImportPipelineButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <HorizontalBarChart title="By Master Category" data={stats.masterCategory} />
        <HorizontalBarChart title="By Season" data={stats.season} />
        <HorizontalBarChart title="By Usage (Occasion)" data={stats.usage} />
        <HorizontalBarChart title="Top Article Types" data={stats.articleType} />
      </div>

      {modalMode !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className={`bg-card w-full ${modalMode === 'edit' && !activeProductId ? 'max-w-md' : 'max-w-4xl'} rounded-2xl shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col`}>
            
            <div className="flex justify-between items-center p-5 border-b border-border shrink-0">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                {modalMode === "add" ? <><Package className="w-5 h-5"/> New Product</> : <><Pencil className="w-5 h-5"/> Edit Product</>}
              </h2>
              <button onClick={handleCloseModal}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
            </div>
            
            <div className="overflow-y-auto p-5">
              
              {/* EDIT MODE: ID Lookup Step */}
              {modalMode === "edit" && !activeProductId ? (
                <form onSubmit={handleFetchProduct} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Enter Product ID to Edit</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input required type="number" value={searchId} onChange={e => setSearchId(e.target.value)} className="w-full pl-9 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. 1" />
                    </div>
                  </div>
                  <button disabled={isFetching || !searchId} type="submit" className="w-full bg-foreground text-background py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch Product Details"}
                  </button>
                </form>
              ) : (

                /* MAIN FORM: Shared by Add & Edit */
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
                  
                  {/* Left Column: Image Upload */}
                  <div className="w-full md:w-1/3 shrink-0">
                    <label className="block text-sm font-medium mb-2">Product Image</label>
                    {imageUrl ? (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border group shadow-sm">
                        <Image src={imageUrl} alt="Uploaded" fill className="object-cover" />
                        <button type="button" onClick={() => setImageUrl("")} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <CldUploadWidget uploadPreset="ml_default" onSuccess={(result: any) => setImageUrl(result.info.secure_url)}>
                        {({ open }) => (
                          <button type="button" onClick={() => open()} className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors">
                            <UploadCloud className="w-8 h-8" />
                            <span className="text-sm font-medium">Click to Upload</span>
                          </button>
                        )}
                      </CldUploadWidget>
                    )}
                  </div>

                  {/* Right Column: Dense Grid for all Data Fields */}
                  <div className="flex-1 space-y-5">
                    
                    {/* Full Width Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Product Display Name</label>
                      <input required value={formData.productDisplay} onChange={e => setFormData({...formData, productDisplay: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm bg-background" placeholder="e.g. Navy Blue Silk Saree" />
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border pt-4">
                      
                      {/* Classification Row */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Gender</label>
                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none text-sm bg-background">
                          <option value="Women">Women</option>
                          <option value="Men">Men</option>
                          <option value="Boys">Boys</option>
                          <option value="Girls">Girls</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Category</label>
                        <select value={formData.masterCategory} onChange={e => setFormData({...formData, masterCategory: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none text-sm bg-background">
                          <option value="Apparel">Apparel</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Footwear">Footwear</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Sub Category</label>
                        <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none text-sm bg-background">
                          <option value="Topwear">Topwear</option>
                          <option value="Bottomwear">Bottomwear</option>
                          <option value="Dress">Dress</option>
                          <option value="Innerwear">Innerwear</option>
                          <option value="Loungewear">Loungewear</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Jewellery">Jewellery</option>
                        </select>
                      </div>

                      {/* Specifics Row */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Article Type</label>
                        <input required value={formData.articleType} onChange={e => setFormData({...formData, articleType: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm bg-background" placeholder="e.g. Tshirts, Kurta, Lehenga" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Season</label>
                        <select value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none text-sm bg-background">
                          <option value="Summer">Summer</option>
                          <option value="Winter">Winter</option>
                          <option value="Fall">Fall</option>
                          <option value="Spring">Spring</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Usage</label>
                        <select value={formData.usage} onChange={e => setFormData({...formData, usage: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none text-sm bg-background">
                          <option value="Casual">Casual</option>
                          <option value="Ethnic">Ethnic</option>
                          <option value="Formal">Formal</option>
                          <option value="Sports">Sports</option>
                          <option value="Party">Party</option>
                        </select>
                      </div>

                      {/* Pricing & Colors Row */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Base Color</label>
                        <input required value={formData.baseColour} onChange={e => setFormData({...formData, baseColour: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm bg-background" placeholder="e.g. Red, Navy Blue" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Rental Price (₹)</label>
                        <input required type="number" value={formData.rentalPrice} onChange={e => setFormData({...formData, rentalPrice: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm bg-background" placeholder="1500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Deposit (₹)</label>
                        <input required type="number" value={formData.securityDeposit} onChange={e => setFormData({...formData, securityDeposit: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm bg-background" placeholder="5000" />
                      </div>

                    </div>

                    <div className="pt-4 mt-4 border-t border-border">
                      <button disabled={isPending || !imageUrl} type="submit" className="w-full bg-foreground text-background py-3 rounded-xl font-medium hover:opacity-90 flex justify-center items-center gap-2 disabled:opacity-50 transition-opacity">
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isPending ? "Updating Database..." : (modalMode === "add" ? "Save Complete Product to Catalog" : "Update Database Entry")}
                      </button>
                    </div>
                  </div>

                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}