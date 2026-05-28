"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Search, User, LogOut, Settings, ChevronDown,
  Sun, Moon, Keyboard, X, Calendar, CreditCard, Users, CheckCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { ShortcutsModal } from "@/components/ui/shortcuts-modal";

const notifications: { id: number; icon: typeof Calendar; color: string; title: string; sub: string; time: string; read: boolean }[] = [];

export function Header() {
  const router = useRouter();
  const { theme, toggle, isDark } = useTheme();
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [showNotif,      setShowNotif]      = useState(false);
  const [showShortcuts,  setShowShortcuts]  = useState(false);
  const [notifs,         setNotifs]         = useState(notifications);

  const unread = notifs.filter((n) => !n.read).length;

  const handleLogout = () => { setShowDropdown(false); router.push("/login"); };

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  /* ── keyboard shortcuts ── */
  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "?") { setShowShortcuts((v) => !v); return; }
    if (e.key === "Escape") { setShowShortcuts(false); setShowNotif(false); setShowDropdown(false); }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
        {/* Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-96 ml-10 lg:ml-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Buscar pacientes, sessões..." className="pl-10 bg-gray-50 border-gray-200" />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dark mode toggle */}
          <Button
            variant="ghost" size="icon"
            onClick={toggle}
            title={isDark ? "Modo claro" : "Modo escuro"}
            className="transition-transform hover:scale-110"
          >
            {isDark
              ? <Sun  className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-gray-500" />}
          </Button>

          {/* Keyboard shortcuts */}
          <Button
            variant="ghost" size="icon"
            onClick={() => setShowShortcuts(true)}
            title="Atalhos (pressione ?)"
            className="hidden sm:flex transition-transform hover:scale-110"
          >
            <Keyboard className="w-4 h-4 text-gray-500" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost" size="icon"
              className="relative transition-transform hover:scale-110"
              onClick={() => { setShowNotif((v) => !v); setShowDropdown(false); }}
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unread > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-ring" />
                </>
              )}
            </Button>

            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-900">Notificações</span>
                      {unread > 0 && (
                        <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-medium">{unread}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline font-medium">
                          Marcar lidas
                        </button>
                      )}
                      <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                    {notifs.map((n) => {
                      const Icon = n.icon;
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? "bg-indigo-50/40" : ""}`}
                          onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-gray-900 ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 truncate">{n.sub}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs text-gray-400">{n.time}</span>
                            {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="relative pl-2 sm:pl-3 border-l border-gray-200">
            <button
              onClick={() => { setShowDropdown(!showDropdown); setShowNotif(false); }}
              className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Dra. Maria Santos</p>
                <p className="text-xs text-gray-500">CRP 06/123456</p>
              </div>
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Dra. Maria Santos</p>
                    <p className="text-xs text-gray-500">maria@clinica.com</p>
                  </div>
                  <button
                    onClick={() => { setShowDropdown(false); router.push("/configuracoes"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Configurações
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); setShowShortcuts(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Keyboard className="w-4 h-4 text-gray-400" />
                    Atalhos de Teclado
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sair do Sistema
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}

