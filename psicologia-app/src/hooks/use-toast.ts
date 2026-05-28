"use client";

import { useState, useEffect, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const listeners = new Set<(t: ToastItem) => void>();

function emit(options: Omit<ToastItem, "id">) {
  const item: ToastItem = { ...options, id: Math.random().toString(36).slice(2) };
  listeners.forEach((fn) => fn(item));
}

export const toast = {
  success: (title: string, message?: string) => emit({ type: "success", title, message }),
  error:   (title: string, message?: string) => emit({ type: "error",   title, message }),
  warning: (title: string, message?: string) => emit({ type: "warning", title, message }),
  info:    (title: string, message?: string) => emit({ type: "info",    title, message }),
};

export function useToastListener() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setToasts((prev) => [...prev, item]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id));
      }, 4200);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
