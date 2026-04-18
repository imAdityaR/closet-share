"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* TOAST CONTAINER (Fixed Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg shadow-black/5 animate-in slide-in-from-right-8 fade-in duration-300 min-w-[300px] max-w-md ${
              toast.type === "success" 
                ? "bg-[#D4E7C5] text-[#384A20] border border-[#C2D7B2]" // Pastel Green Brand Color
                : toast.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-[#FAF6F0] text-[#A67B5B] border border-[#E5D3B3]" // Light Brown Brand Color
            }`}
          >
            {/* Icon based on type */}
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 shrink-0" />}
            
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}