import { fetchUserComplaints } from "@/lib/actions"
import { CustomerHelpdeskClient } from "./client"

export default async function HelpdeskPage() {
  const complaints = await fetchUserComplaints()
  
  return (
    <div className="max-w-4xl mx-auto px-5 py-12 font-sans min-h-screen">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Customer Support</h1>
        <p className="text-muted-foreground">View your previous requests or raise a new issue.</p>
      </div>

      <CustomerHelpdeskClient initialComplaints={complaints} />
    </div>
  )
}