"use client"

import { useState, useTransition } from "react"
import { submitComplaint } from "@/lib/actions"
import { MessageSquare, Clock, CheckCircle2, Plus, X, Loader2 } from "lucide-react"

export function CustomerHelpdeskClient({ initialComplaints }: { initialComplaints: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      await submitComplaint(formData)
      setIsModalOpen(false)
    })
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">Your Tickets</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Raise Complaint
        </button>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {initialComplaints.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-border border-dashed rounded-xl">
            You have no prior complaints.
          </div>
        ) : (
          initialComplaints.map(ticket => (
            <div key={ticket.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                  ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {ticket.status === 'Resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {ticket.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{ticket.description}</p>
              
              <div className="text-xs text-muted-foreground flex items-center gap-4 border-t border-border pt-4">
                <span>Submitted: {ticket.createdAt}</span>
                {ticket.resolvedAt && <span>Resolved: {ticket.resolvedAt}</span>}
              </div>

              {/* Admin Reply Section */}
              {ticket.adminReply && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border border-l-4 border-l-primary">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Admin Reply</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{ticket.adminReply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h2 className="font-semibold text-lg">Raise a Complaint</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input name="subject" required className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" placeholder="E.g., Damaged Item Received" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea name="description" required rows={4} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Please describe the issue in detail..." />
              </div>
              <button disabled={isPending} type="submit" className="w-full bg-foreground text-background py-2.5 rounded-lg font-medium hover:opacity-90 flex justify-center items-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}