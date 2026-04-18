"use client"

import { useState, useTransition } from "react"
import { resolveComplaint } from "@/lib/admin-actions"
import { CheckCircle2, Clock, Send, User } from "lucide-react"

export function AdminHelpdeskClient({ initialComplaints }: { initialComplaints: any[] }) {
  const [complaints, setComplaints] = useState(initialComplaints)
  const [isPending, startTransition] = useTransition()
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({})

  const handleResolve = (ticketId: number) => {
    const reply = replyText[ticketId]
    if (!reply) return alert("Please enter a reply before resolving.")

    startTransition(async () => {
      await resolveComplaint(ticketId, reply)
      // Optimistically update UI
      setComplaints(prev => prev.map(c => c.id === ticketId ? { ...c, status: 'Resolved', adminReply: reply } : c))
    })
  }

  return (
    <div className="space-y-6">
      {complaints.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border border-border rounded-xl bg-card">
          No complaints in the system. Everything is running smoothly!
        </div>
      ) : (
        complaints.map(ticket => (
          <div key={ticket.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`p-4 border-b border-border flex justify-between items-center ${ticket.status === 'Resolved' ? 'bg-muted/30' : 'bg-amber-50/50'}`}>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1.5 ${
                  ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-200 text-amber-800'
                }`}>
                  {ticket.status === 'Resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {ticket.status}
                </span>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="w-4 h-4" /> {ticket.userEmail}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{ticket.createdAt}</span>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-2">{ticket.subject}</h3>
              <p className="text-sm text-foreground mb-6 leading-relaxed">{ticket.description}</p>

              {ticket.status === 'Pending' ? (
                <div className="space-y-3 border-t border-border pt-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Reply</label>
                  <textarea 
                    rows={3} 
                    value={replyText[ticket.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none" 
                    placeholder="Type your reply to the customer here..." 
                  />
                  <div className="flex justify-end">
                    <button 
                      disabled={isPending}
                      onClick={() => handleResolve(ticket.id)}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Resolve & Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Your Reply</span>
                  <p className="text-sm text-foreground">{ticket.adminReply}</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}