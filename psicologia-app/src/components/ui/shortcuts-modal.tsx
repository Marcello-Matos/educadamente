"use client";

import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ["G", "D"], label: "Ir para Dashboard" },
  { keys: ["G", "P"], label: "Ir para Pacientes" },
  { keys: ["G", "A"], label: "Ir para Agenda" },
  { keys: ["G", "F"], label: "Ir para Financeiro" },
  { keys: ["G", "R"], label: "Ir para Prontuários" },
  { keys: ["G", "T"], label: "Ir para Teleconsulta" },
  { keys: ["?"], label: "Mostrar atalhos" },
  { keys: ["Esc"], label: "Fechar modal" },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-md bg-gray-100 border border-gray-300 text-xs font-mono font-semibold text-gray-700 shadow-sm">
      {children}
    </kbd>
  );
}

export function ShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900">Atalhos de Teclado</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{s.label}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j} className="flex items-center gap-1">
                    <Kbd>{k}</Kbd>
                    {j < s.keys.length - 1 && <span className="text-xs text-gray-400">então</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-4 text-center">
          <p className="text-xs text-gray-400">Pressione <Kbd>?</Kbd> a qualquer momento para abrir</p>
        </div>
      </div>
    </div>
  );
}
