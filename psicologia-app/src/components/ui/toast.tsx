"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastListener, ToastItem } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const config = {
  success: { icon: CheckCircle, bg: "bg-emerald-500", bar: "bg-emerald-300" },
  error:   { icon: XCircle,     bg: "bg-red-500",     bar: "bg-red-300"     },
  warning: { icon: AlertTriangle,bg: "bg-amber-500",  bar: "bg-amber-300"   },
  info:    { icon: Info,         bg: "bg-indigo-500",  bar: "bg-indigo-300"  },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, bg, bar } = config[toast.type];

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 250);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), 3700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 w-80 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 p-4 cursor-pointer",
        leaving ? "animate-toast-out" : "animate-toast-in"
      )}
      onClick={handleDismiss}
    >
      {/* Progress bar */}
      <div
        className={cn("absolute bottom-0 left-0 h-0.5 rounded-full", bar)}
        style={{ animation: "skeleton-shimmer 4.2s linear forwards", width: "100%" }}
      />
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", bg)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.message && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastListener();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
