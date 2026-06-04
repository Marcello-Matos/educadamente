"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, ChevronLeft, ChevronRight, Video, MapPin,
  X, Clock, User, Calendar, Palette, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPatients, getPsychologists } from "@/lib/supabase/patients";
import { getSessions, createSession } from "@/lib/supabase/sessions";
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

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - day + i);
    return d;
  });
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [anchor, setAnchor]           = useState(() => new Date());
  const [view, setView]               = useState<"day" | "week">("week");
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [psychologists, setPsych]     = useState<Psychologist[]>([]);
  const [filterPsy, setFilterPsy]     = useState<string | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [colorModal, setColorModal]   = useState<string | null>(null); // psychologist id
  const [psyColors, setPsyColors]     = useState<Record<string, string>>({});
  const [saving, setSaving]           = useState(false);

  // Form
  const [fPatient, setFPatient]   = useState("");
  const [fPsy, setFPsy]           = useState("");
  const [fDate, setFDate]         = useState(toDateStr(new Date()));
  const [fTime, setFTime]         = useState("09:00");
  const [fDur, setFDur]           = useState("50");
  const [fType, setFType]         = useState("presencial");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setPsyColors(JSON.parse(stored));
    Promise.all([getSessions(), getPatients(), getPsychologists()])
      .then(([s, p, ps]) => { setSessions(s); setPatients(p); setPsych(ps); })
      .catch(() => {});
  }, []);

  const saveColor = useCallback((psyId: string, colorId: string) => {
    const next = { ...psyColors, [psyId]: colorId };
    setPsyColors(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setColorModal(null);
  }, [psyColors]);

  const getColor = (psyId: string | null | undefined) => {
    if (!psyId) return PALETTE[0];
    const cid = psyColors[psyId] || PALETTE[psychologists.findIndex(p => p.id === psyId) % PALETTE.length]?.id || "indigo";
    return PALETTE.find(c => c.id === cid) || PALETTE[0];
  };

  const takenColors = Object.entries(psyColors)
    .filter(([k]) => k !== colorModal)
    .map(([, v]) => v);

  const weekDates = getWeekDates(anchor);

  const visibleSessions = filterPsy
    ? sessions.filter(s => s.psychologist_id === filterPsy)
    : sessions;

  function sessionsAt(date: string, time: string) {
    return visibleSessions.filter(s => s.session_date === date && s.session_time.slice(0, 5) === time);
  }

  function navigate(dir: number) {
    const d = new Date(anchor);
    d.setDate(d.getDate() + (view === "week" ? dir * 7 : dir));
    setAnchor(d);
  }

  function goToday() { setAnchor(new Date()); }

  async function handleSave() {
    if (!fPatient || !fPsy || !fDate || !fTime) return;
    setSaving(true);
    try {
      const s = await createSession({ patient_id: fPatient, psychologist_id: fPsy, session_date: fDate, session_time: fTime, duration: Number(fDur), type: fType as "presencial" | "teleconsulta" });
      setSessions(prev => [...prev, s]);
      setShowModal(false);
    } catch (_) { /* silent */ }
    finally { setSaving(false); }
  }

  const dayDates = view === "day" ? [anchor] : weekDates;
  const todayStr = toDateStr(new Date());

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0 gap-0">

      {/* ── TOP BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700">
            Hoje
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 ml-1">
            {view === "week"
              ? `${weekDates[1].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${weekDates[5].toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`
              : anchor.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setView("day")} className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === "day" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>Dia</button>
            <button onClick={() => setView("week")} className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === "week" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>Semana</button>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Nova Sessão
          </Button>
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

      {/* ── CALENDAR GRID ── */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="flex min-w-[640px]">
          {/* Time gutter */}
          <div className="w-14 shrink-0 bg-white border-r border-gray-100">
            <div className="h-12 border-b border-gray-100" />
            {TIME_SLOTS.map(t => (
              <div key={t} className="h-16 border-b border-gray-50 flex items-start justify-end pr-2 pt-1">
                <span className="text-[11px] text-gray-400 font-medium">{t}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(${dayDates.length}, minmax(0, 1fr))` }}>
            {dayDates.map((date) => {
              const dStr = toDateStr(date);
              const isToday = dStr === todayStr;
              return (
                <div key={dStr} className="border-r border-gray-100 last:border-r-0">
                  {/* Day header */}
                  <div className={`h-12 border-b border-gray-100 flex flex-col items-center justify-center sticky top-0 z-10 ${isToday ? "bg-indigo-50" : "bg-white"}`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-indigo-500" : "text-gray-400"}`}>
                      {WEEK_DAYS_SHORT[date.getDay()]}
                    </span>
                    <span className={`text-lg font-bold leading-tight ${isToday ? "text-indigo-600" : "text-gray-800"}`}>
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Time rows */}
                  {TIME_SLOTS.map(time => {
                    const slotSessions = sessionsAt(dStr, time);
                    return (
                      <div key={time} className={`h-16 border-b border-gray-100 px-1 py-0.5 relative group ${slotSessions.length === 0 ? "hover:bg-indigo-50/40 cursor-pointer" : ""}`}
                        onClick={() => { if (slotSessions.length === 0) { setFDate(dStr); setFTime(time); setShowModal(true); } }}>
                        {slotSessions.map((s) => {
                          const c = getColor(s.psychologist_id);
                          return (
                            <div
                              key={s.id}
                              className={`h-full rounded-md px-2 py-1 border-l-[3px] ${c.light} ${c.border} cursor-pointer hover:brightness-95 transition-all overflow-hidden`}
                            >
                              <p className={`text-[11px] font-bold truncate ${c.text}`}>{s.patients?.name || "—"}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-gray-500">{s.duration}min</span>
                                {s.type === "teleconsulta" ? <Video className="w-2.5 h-2.5 text-gray-400" /> : <MapPin className="w-2.5 h-2.5 text-gray-400" />}
                              </div>
                            </div>
                          );
                        })}
                        {slotSessions.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
