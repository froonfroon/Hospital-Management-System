"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastMessage = { id, title, description, variant, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Floating Toast Container */}
      <aside
        aria-live="polite"
        aria-label="Clinical notifications"
        className="fixed bottom-4 end-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const Icon = {
            success: CheckCircle2,
            warning: AlertTriangle,
            error: AlertCircle,
            info: Info,
          }[t.variant || "info"];

          const variantStyles = {
            success: "border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-700",
            warning: "border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-700",
            error: "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-700",
            info: "border-slate-200 bg-white text-slate-900 [&>svg]:text-cyan-700",
          }[t.variant || "info"];

          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-md border p-3 shadow-md transition-all animate-in slide-in-from-bottom-2 duration-200 text-xs",
                variantStyles
              )}
            >
              <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <div className="font-semibold leading-tight">{t.title}</div>
                {t.description && (
                  <div className="text-[11px] opacity-90 mt-0.5 leading-normal">
                    {t.description}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded p-0.5 opacity-60 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-cyan-600 shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: () => {},
      dismiss: () => {},
    };
  }
  return context;
}
