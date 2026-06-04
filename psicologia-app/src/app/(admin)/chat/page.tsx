"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare, Loader2, Users, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { getTeamMessages, sendTeamMessage } from "@/lib/supabase/chat";
import { getPsychologists, createPsychologist } from "@/lib/supabase/patients";
import { TeamMessage, Psychologist } from "@/lib/supabase/types";
import { toast } from "@/hooks/use-toast";

const IDENTITY_KEY = "psi_chat_identity";

const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#ec4899", "#06b6d4"];
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [psychologists, setPsych] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<{ id: string | null; name: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cadastro rápido de profissional
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regCrp, setRegCrp] = useState("");
  const [regSaving, setRegSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(IDENTITY_KEY);
    if (stored) setIdentity(JSON.parse(stored));

    Promise.all([getTeamMessages(), getPsychologists()])
      .then(([m, ps]) => { setMessages(m); setPsych(ps); })
      .catch(() => {})
      .finally(() => setLoading(false));

    const channel = supabase
      .channel("team-chat-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "team_messages" }, (payload) => {
        setMessages(prev => {
          const msg = payload.new as TeamMessage;
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function pickIdentity(p: Psychologist) {
    const id = { id: p.id, name: p.name };
    setIdentity(id);
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(id));
  }

  async function handleRegister() {
    if (!regName.trim() || !regCrp.trim()) return;
    setRegSaving(true);
    try {
      const novo = await createPsychologist({ name: regName.trim(), crp: regCrp.trim() });
      setPsych(prev => [...prev, novo].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("Profissional cadastrado", novo.name);
      setShowRegister(false);
      setRegName(""); setRegCrp("");
      pickIdentity(novo);
    } catch {
      toast.error("Erro ao cadastrar", "O CRP/registro pode já existir, ou a tabela não está acessível.");
    } finally { setRegSaving(false); }
  }

  async function handleSend() {
    if (!draft.trim() || !identity) return;
    const content = draft.trim();
    setDraft("");
    setSending(true);
    try {
      const msg = await sendTeamMessage({ psychologist_id: identity.id, author_name: identity.name, content });
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
    } catch {
      setDraft(content);
    } finally { setSending(false); }
  }

  // ─── IDENTITY PICKER ───
  if (!loading && !identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Quem é você?</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">Selecione seu perfil para entrar no chat da equipe.</p>
          <div className="space-y-2">
            {psychologists.length === 0 && !showRegister && (
              <p className="text-sm text-gray-400 py-2">Nenhum profissional cadastrado ainda. Cadastre o primeiro abaixo.</p>
            )}
            {psychologists.map(p => (
              <button key={p.id} onClick={() => pickIdentity(p)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-left">
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: colorFor(p.name) }}>
                  {initials(p.name)}
                </span>
                <span className="text-sm font-medium text-gray-800">{p.name}</span>
              </button>
            ))}
          </div>

          {showRegister ? (
            <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-left space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-indigo-600" /> Novo profissional</h3>
                <button onClick={() => setShowRegister(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nome *</label>
                <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ex: Dra. Ana Souza" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Registro / CRP *</label>
                <Input value={regCrp} onChange={e => setRegCrp(e.target.value)} placeholder="Ex: CRP 06/123456" />
              </div>
              <Button onClick={handleRegister} disabled={regSaving || !regName.trim() || !regCrp.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {regSaving ? "Salvando..." : "Cadastrar e entrar"}
              </Button>
            </div>
          ) : (
            <button onClick={() => setShowRegister(true)} className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50/50 transition-colors text-sm font-medium">
              <UserPlus className="w-4 h-4" /> Cadastrar profissional
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] lg:h-[calc(100vh-7rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5" />
          <div>
            <h1 className="text-base font-bold leading-tight">Chat da Equipe</h1>
            <p className="text-[11px] text-white/70">Mensagens em tempo real</p>
          </div>
        </div>
        {identity && (
          <button
            onClick={() => { setIdentity(null); localStorage.removeItem(IDENTITY_KEY); }}
            title="Trocar perfil / cadastrar outro"
            className="flex items-center gap-2 rounded-full hover:bg-white/15 px-2 py-1 transition-colors"
          >
            <span className="text-xs text-white/80 hidden sm:inline">Trocar</span>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white/40" style={{ background: colorFor(identity.name) }}>
              {initials(identity.name)}
            </span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">Nenhuma mensagem ainda. Diga olá! 👋</p>
          </div>
        ) : (
          messages.map(m => {
            const mine = identity && m.author_name === identity.name;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: colorFor(m.author_name) }}>
                  {initials(m.author_name)}
                </span>
                <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  {!mine && <span className="text-[11px] font-semibold text-gray-500 mb-0.5 px-1">{m.author_name}</span>}
                  <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${mine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"}`}>
                    {m.content}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1">{fmtTime(m.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Escreva uma mensagem..."
          className="flex-1 h-11 rounded-full border border-gray-200 px-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <Button onClick={handleSend} disabled={sending || !draft.trim()} className="rounded-full w-11 h-11 p-0 bg-indigo-600 hover:bg-indigo-700 shrink-0">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
