"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, ChevronLeft, ChevronRight, Video, MapPin,
  X, Clock, User, Calendar, Palette, Check, CalendarDays, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { getPatients, getPsychologists } from "@/lib/supabase/patients";
import { getSessions, createSession } from "@/lib/supabase/sessions";
import { createReminder } from "@/lib/supabase/reminders";
import { Patient, Psychologist, Session } from "@/lib/supabase/types";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const TIME_SLOTS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
const WEEK_DAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const PALETTE: { id: string; bg: string; border: string; text: string; light: string; dot: string; hex: string }[] = [
  { id: "indigo",  bg: "bg-indigo-500",  border: "border-indigo-500",  text: "text-indigo-700",  light: "bg-indigo-50",  dot: "#6366f1", hex: "#6366f1" },
  { id: "violet",  bg: "bg-violet-500",  border: "border-violet-500",  text: "text-violet-700",  light: "bg-violet-50",  dot: "#8b5cf6", hex: "#8b5cf6" },
  { id: "sky",     bg: "bg-sky-500",     border: "border-sky-500",     text: "text-sky-700",     light: "bg-sky-50",     dot: "#0ea5e9", hex: "#0ea5e9" },
  { id: "emerald", bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-700", light: "bg-emerald-50", dot: "#10b981", hex: "#10b981" },
  { id: "teal",    bg: "bg-teal-500",    border: "border-teal-500",    text: "text-teal-700",    light: "bg-teal-50",    dot: "#14b8a6", hex: "#14b8a6" },
  { id: "amber",   bg: "bg-amber-500",   border: "border-amber-500",   text: "text-amber-700",   light: "bg-amber-50",   dot: "#f59e0b", hex: "#f59e0b" },
  { id: "orange",  bg: "bg-orange-500",  border: "border-orange-500",  text: "text-orange-700",  light: "bg-orange-50",  dot: "#f97316", hex: "#f97316" },
  { id: "rose",    bg: "bg-rose-500",    border: "border-rose-500",    text: "text-rose-700",    light: "bg-rose-50",    dot: "#f43f5e", hex: "#f43f5e" },
  { id: "pink",    bg: "bg-pink-500",    border: "border-pink-500",    text: "text-pink-700",    light: "bg-pink-50",    dot: "#ec4899", hex: "#ec4899" },
  { id: "fuchsia", bg: "bg-fuchsia-500", border: "border-fuchsia-500", text: "text-fuchsia-700", light: "bg-fuchsia-50", dot: "#d946ef", hex: "#d946ef" },
  { id: "lime",    bg: "bg-lime-500",    border: "border-lime-500",    text: "text-lime-700",    light: "bg-lime-50",    dot: "#84cc16", hex: "#84cc16" },
  { id: "cyan",    bg: "bg-cyan-500",    border: "border-cyan-500",    text: "text-cyan-700",    light: "bg-cyan-50",    dot: "#06b6d4", hex: "#06b6d4" },
];

const STATUS_CFG = {
  agendada:  { label: "Agendada",  variant: "default"      as const },
  realizada: { label: "Realizada", variant: "success"      as const },
  cancelada: { label: "Cancelada", variant: "destructive"  as const },
  falta:     { label: "Falta",     variant: "warning"      as const },
};

const STORAGE_KEY = "psi_pro_colors";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Returns a flat list of dates filling complete weeks (Sun→Sat) that cover the month
function getMonthMatrix(anchor: Date): Date[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [anchor, setAnchor]           = useState(() => new Date());
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [psychologists, setPsych]     = useState<Psychologist[]>([]);
  const [filterPsy, setFilterPsy]     = useState<string | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [colorModal, setColorModal]   = useState<string | null>(null); // psychologist id
  const [dayModal, setDayModal]       = useState<string | null>(null); // selected day yyyy-mm-dd
  const [psyColors, setPsyColors]     = useState<Record<string, string>>({});
  const [saving, setSaving]           = useState(false);

  // Form
  const [fPatient, setFPatient]   = useState("");
  const [fPsy, setFPsy]           = useState("");
  const [fDate, setFDate]         = useState(toDateStr(new Date()));
  const [fTime, setFTime]         = useState("09:00");
  const [fDur, setFDur]           = useState("50");
  const [fType, setFType]         = useState("presencial");
  const [fReminder, setFReminder] = useState(true);
  const [fReminderHours, setFReminderHours] = useState("24");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setPsyColors(JSON.parse(stored));
    Promise.all([getSessions(), getPatients(), getPsychologists()])
      .then(([s, p, ps]) => { setSessions(s); setPatients(p); setPsych(ps); })
      .catch(() => {});

    // Colaboração em tempo real: recarrega sessões quando qualquer um altera
    const channel = supabase
      .channel("sessions-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => {
        getSessions().then(setSessions).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const saveColor = useCallback((psyId: string, colorId: string) => {
    const next = { ...psyColors, [psyId]: colorId };
    setPsyColors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setColorModal(null);
    // Persiste no banco para refletir em qualquer dispositivo e no cadastro
    supabase.from("psychologists").update({ color: colorId }).eq("id", psyId).then(() => {});
  }, [psyColors]);

  const getColor = (psyId: string | null | undefined) => {
    if (!psyId) return PALETTE[0];
    // Prioridade: cor escolhida localmente > cor salva no banco > fallback por índice
    const dbColor = psychologists.find(p => p.id === psyId)?.color || undefined;
    const cid = psyColors[psyId] || dbColor || PALETTE[psychologists.findIndex(p => p.id === psyId) % PALETTE.length]?.id || "indigo";
    return PALETTE.find(c => c.id === cid) || PALETTE[0];
  };

  const takenColors = Object.entries(psyColors)
    .filter(([k]) => k !== colorModal)
    .map(([, v]) => v);

  const monthDates = getMonthMatrix(anchor);
  const currentMonth = anchor.getMonth();

  const visibleSessions = filterPsy
    ? sessions.filter(s => s.psychologist_id === filterPsy)
    : sessions;

  function sessionsOnDay(date: string) {
    return visibleSessions
      .filter(s => s.session_date === date)
      .sort((a, b) => a.session_time.localeCompare(b.session_time));
  }

  function navigate(dir: number) {
    setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + dir, 1));
  }

  function goToday() { setAnchor(new Date()); }

  function openNewSession(date?: string) {
    if (date) setFDate(date);
    setShowModal(true);
  }

  async function handleSave() {
    if (!fPatient || !fPsy || !fDate || !fTime) return;
    setSaving(true);
    try {
      const s = await createSession({ patient_id: fPatient, psychologist_id: fPsy, session_date: fDate, session_time: fTime, duration: Number(fDur), type: fType as "presencial" | "teleconsulta" });
      setSessions(prev => [...prev, s]);

      // Lembrete automático X horas antes da sessão
      if (fReminder) {
        const sessionStart = new Date(`${fDate}T${fTime}:00`);
        const remindAt = new Date(sessionStart.getTime() - Number(fReminderHours) * 60 * 60 * 1000);
        const patientName = patients.find(p => p.id === fPatient)?.name || "paciente";
        try {
          await createReminder({
            title: `Lembrete: sessão com ${patientName}`,
            notes: `Sessão ${fType} às ${fTime} do dia ${new Date(`${fDate}T00:00:00`).toLocaleDateString("pt-BR")}.`,
            remind_at: remindAt.toISOString(),
            channel: "whatsapp",
            session_id: s.id,
            patient_id: fPatient,
            psychologist_id: fPsy,
          });
        } catch { /* lembrete é opcional, ignora se a tabela não existir */ }
      }

      setShowModal(false);
    } catch (_) { /* silent */ }
    finally { setSaving(false); }
  }

  const todayStr = toDateStr(new Date());

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 gap-0">

      {/* ── TOP BAR ── */}
      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-white/90" />
            <h1 className="text-xl sm:text-2xl font-bold text-white capitalize leading-tight">
              {anchor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/15 transition-colors text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-sm font-semibold rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white">
              Hoje
            </button>
            <button onClick={() => navigate(1)} className="p-2 rounded-full hover:bg-white/15 transition-colors text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── PROFESSIONALS FILTER ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white overflow-x-auto">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Profissionais</span>
        <button
          onClick={() => setFilterPsy(null)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border shrink-0 ${!filterPsy ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
        >
          Todos
        </button>
        {psychologists.map((psy) => {
          const c = getColor(psy.id);
          const isActive = filterPsy === psy.id;
          return (
            <div key={psy.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setFilterPsy(isActive ? null : psy.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all border ${isActive ? `${c.bg} text-white border-transparent` : `bg-white ${c.text} border-gray-200 hover:border-current`}`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.hex }} />
                {psy.name.split(" ")[0]}
              </button>
              <button
                onClick={() => setColorModal(psy.id)}
                title="Alterar cor"
                className="p-1 rounded-full text-gray-300 hover:text-gray-500 transition-colors"
              >
                <Palette className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── MONTH GRID (TimeTree style) ── */}
      <div className="flex-1 overflow-auto bg-white flex flex-col">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
          {WEEK_DAYS_SHORT.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-rose-400" : i === 6 ? "text-sky-400" : "text-gray-400"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {monthDates.map((date) => {
            const dStr = toDateStr(date);
            const isToday = dStr === todayStr;
            const inMonth = date.getMonth() === currentMonth;
            const daySessions = sessionsOnDay(dStr);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return (
              <button
                key={dStr}
                onClick={() => setDayModal(dStr)}
                className={`text-left border-b border-r border-gray-100 p-1 min-h-[84px] flex flex-col gap-0.5 transition-colors hover:bg-indigo-50/50 ${!inMonth ? "bg-gray-50/60" : isWeekend ? "bg-gray-50/30" : ""}`}
              >
                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${isToday ? "bg-indigo-600 text-white" : !inMonth ? "text-gray-300" : date.getDay() === 0 ? "text-rose-500" : date.getDay() === 6 ? "text-sky-500" : "text-gray-700"}`}>
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                  {daySessions.slice(0, 3).map((s) => {
                    const c = getColor(s.psychologist_id);
                    return (
                      <div key={s.id} className="flex items-center gap-1 rounded px-1 py-0.5 overflow-hidden" style={{ background: `${c.hex}22` }}>
                        <span className="w-1 h-3 rounded-full shrink-0" style={{ background: c.hex }} />
                        <span className="text-[10px] font-medium text-gray-700 truncate leading-none">
                          {s.session_time.slice(0, 5)} {s.patients?.name?.split(" ")[0] || "—"}
                        </span>
                      </div>
                    );
                  })}
                  {daySessions.length > 3 && (
                    <span className="text-[10px] font-semibold text-gray-400 px-1">+{daySessions.length - 3} mais</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FLOATING ADD BUTTON ── */}
      <button
        onClick={() => openNewSession()}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="Nova sessão"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* ── DAY DETAIL MODAL ── */}
      {dayModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDayModal(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                  {new Date(`${dayModal}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long" })}
                </p>
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {new Date(`${dayModal}T00:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                </h3>
              </div>
              <button onClick={() => setDayModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {sessionsOnDay(dayModal).length === 0 && (
                <div className="text-center py-10">
                  <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Nenhuma sessão neste dia</p>
                </div>
              )}
              {sessionsOnDay(dayModal).map((s) => {
                const c = getColor(s.psychologist_id);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors" style={{ background: `${c.hex}0d` }}>
                    <div className="flex flex-col items-center justify-center w-12 shrink-0">
                      <span className="text-sm font-bold text-gray-800">{s.session_time.slice(0, 5)}</span>
                      <span className="text-[10px] text-gray-400">{s.duration}min</span>
                    </div>
                    <div className="w-1 self-stretch rounded-full" style={{ background: c.hex }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.patients?.name || "Paciente"}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.hex }} />
                        {s.psychologists?.name || "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {s.type === "teleconsulta" ? <Video className="w-4 h-4 text-gray-400" /> : <MapPin className="w-4 h-4 text-gray-400" />}
                      <Badge variant={STATUS_CFG[s.status].variant}>{STATUS_CFG[s.status].label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t border-gray-100">
              <Button onClick={() => { openNewSession(dayModal); setDayModal(null); }} className="w-full gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Agendar neste dia
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── COLOR PICKER MODAL ── */}
      {colorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setColorModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Escolher Cor</h3>
              <button onClick={() => setColorModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {psychologists.find(p => p.id === colorModal)?.name} — cada cor só pode ser usada por um profissional.
            </p>
            <div className="grid grid-cols-6 gap-2">
              {PALETTE.map(c => {
                const taken = takenColors.includes(c.id);
                const isCurrent = psyColors[colorModal] === c.id;
                return (
                  <button
                    key={c.id}
                    disabled={taken}
                    onClick={() => saveColor(colorModal, c.id)}
                    className={`w-9 h-9 rounded-full transition-all relative flex items-center justify-center ${c.bg} ${taken ? "opacity-25 cursor-not-allowed" : "hover:scale-110 cursor-pointer"} ${isCurrent ? "ring-2 ring-offset-2 ring-gray-800" : ""}`}
                    title={taken ? "Cor já em uso" : c.id}
                  >
                    {isCurrent && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── NEW SESSION MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Nova Sessão</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Paciente *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select value={fPatient} onChange={e => setFPatient(e.target.value)} className="w-full pl-10 h-10 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                      <option value="">Selecione o paciente</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Profissional *</label>
                  <select value={fPsy} onChange={e => setFPsy(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">Selecione o profissional</option>
                    {psychologists.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {fPsy && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ background: getColor(fPsy).hex }} />
                      <span className="text-xs text-gray-500">{psychologists.find(p => p.id === fPsy)?.crp}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data *</label>
                  <Input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="h-10" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Horário *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select value={fTime} onChange={e => setFTime(e.target.value)} className="w-full pl-10 h-10 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Duração</label>
                  <select value={fDur} onChange={e => setFDur(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="50">50 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="80">80 minutos</option>
                    <option value="100">100 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Modalidade</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden h-10">
                    <button type="button" onClick={() => setFType("presencial")} className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${fType === "presencial" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                      <MapPin className="w-3.5 h-3.5" /> Presencial
                    </button>
                    <button type="button" onClick={() => setFType("teleconsulta")} className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${fType === "teleconsulta" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                      <Video className="w-3.5 h-3.5" /> Online
                    </button>
                  </div>
                </div>

                {/* Lembrete automático */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        type="button"
                        onClick={() => setFReminder(v => !v)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${fReminder ? "bg-indigo-600" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${fReminder ? "translate-x-4" : ""}`} />
                      </button>
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5 text-indigo-500" /> Criar lembrete
                      </span>
                    </label>
                    {fReminder && (
                      <select value={fReminderHours} onChange={e => setFReminderHours(e.target.value)} className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                        <option value="1">1h antes</option>
                        <option value="2">2h antes</option>
                        <option value="3">3h antes</option>
                        <option value="24">1 dia antes</option>
                        <option value="48">2 dias antes</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !fPatient || !fPsy} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
                {saving ? "Salvando..." : "Agendar Sessão"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
