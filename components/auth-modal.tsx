"use client"

import { X } from "lucide-react"
import { SignIn } from "@clerk/nextjs"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md flex justify-center">
        {/* Custom Close Button layered over Clerk */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clerk's Drop-In Component */}
        <SignIn 
          routing="hash" 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-xl border border-border rounded-2xl bg-card m-0",
              headerTitle: "font-serif text-xl font-bold text-foreground",
              headerSubtitle: "font-sans text-muted-foreground",
              formButtonPrimary: "bg-[#A87568] hover:bg-[#8e6256] text-white font-sans rounded-xl py-3 transition-colors",
              formFieldInput: "rounded-xl border-border focus:ring-[#A87568] focus:border-[#A87568]",
              footerActionLink: "text-[#A87568] hover:text-[#8e6256] font-sans",
              identityPreviewEditButton: "text-[#A87568] hover:text-[#8e6256]",
              formFieldLabel: "font-sans font-medium text-foreground",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground font-sans",
            }
          }}
        />
      </div>
    </div>
  )
}