"use client"

import { useActionState, useState } from "react"
import { Lock, User, Loader2 } from "lucide-react"
import { loginAdmin } from "@/lib/admin-actions"

export default function AdminLoginPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await loginAdmin(formData)
    
    if (res?.error) {
      setError(res.error)
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Workspace</h1>
          <p className="text-sm text-muted-foreground mt-2">Restricted Access</p>
        </div>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                name="username" 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-3 mt-4 bg-foreground text-background font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}