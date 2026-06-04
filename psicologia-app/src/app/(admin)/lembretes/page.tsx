"use client";

import { useEffect, useState } from "react";
import {
  Plus, X, Trash2, Bell, BellRing, Check, Clock,
  MessageCircle, Mail, Monitor, Loader2, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { getReminders, createReminder, toggleReminderDone, deleteReminder } from "@/lib/supabase/reminders";
import { getPatients, getPsychologists } from "@/lib/supabase/patients";
import { Reminder, ReminderChannel, Patient, Psychologist } from "@/lib/supabase/types";
import { toast } from "@/hooks/use-toast";

const CHANNEL: Record<ReminderChannel, { label: string; icon: typeof Bell; cls: string }> = {
  sistema:  { label: "Sistema",  icon: Monitor,       cls: "bg-indigo-100 text-indigo-700" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, cls: "bg-emerald-100 text-emerald-700" },
  email:    { label: "E-mail",   icon: Mail,          cls: "bg-sky-100 text-sky-700" },
};

function fmtWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function LembretesPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [psychologists, setPsych] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [when, setWhen] = useState("");
  const [channel, setChannel] = useState<ReminderChannel>("sistema");
  const [patientId, setPatientId] = useState("");
  const [psyId, setPsyId] = useState("");

  useEffect(() => {
    Promise.all([getReminders(), getPatients(), getPsychologists()])
      .then(([r, p, ps]) => { setReminders(r); setPatients(p); setPsych(ps); })
      .catch(() => {})
      .finally(() => setLoading(false));

    const channelRt = supabase
      .channel("reminders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "reminders" }, () => {
        getReminders().then(setReminders).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channelRt); };
  }, []);

  function reset() {
    setTitle(""); setNotes(""); setWhen(""); setChannel("sistema"); setPatientId(""); setPsyId("");
  }

  async function handleCreate() {
    if (!title.trim() || !when) return;
    setSaving(true);
    try {
      const r = await createReminder({
        title: title.trim(),
        notes: notes || null,
        remind_at: new Date(when).toISOString(),
        channel,
        patient_id: patientId || null,
        psychologist_id: psyId || null,
      });
      setReminders(prev => [...prev, r].sort((a, b) => a.remind_at.localeCompare(b.remind_at)));
      toast.success("Lembrete criado");
      setShowModal(false);
      reset();
    } catch {
      toast.error("Erro ao criar lembrete", "Verifique se a tabela 'reminders' existe no Supabase.");
    } finally { setSaving(false); }
  }

  async function toggle(r: Reminder) {
    setReminders(prev => prev.map(x => x.id === r.id ? { ...x, done: !x.done } : x));
    try { await toggleReminderDone(r.id, !r.done); } catch { toast.error("Erro ao atualizar"); }
  }

  async function remove(id: string) {
    setReminders(prev => prev.filter(r => r.id !== id));
    try { await deleteReminder(id); } catch { toast.error("Erro ao excluir"); }
  }

  const now = Date.now();
  const pending = reminders.filter(r => !r.done);
  const upcoming = pending.filter(r => new Date(r.remind_at).getTime() >= now);
  const overdue = pending.filter(r => new Date(r.remind_at).getTime() < now);
  const done = reminders.filter(r => r.done);

  const Item = ({ r, late }: { r: Reminder; late?: boolean }) => {
    const ch = CHANNEL[r.channel];
    return (
      <div className={`flex items-start gap-3 p-3 rounded-xl border bg-white shadow-sm group ${late ? "border-rose-200" : "border-gray-100"}`}>
        <button onClick={() => toggle(r)} className="mt-0.5 shrink-0" title="Marcar como feito">
          <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${r.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-indigo-500"}`}>
            {r.done && <Check className="w-3 h-3 text-white" />}
          </span>
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${r.done ? "line-through text-gray-400" : "text-gray-900"}`}>{r.title}</p>
          {r.notes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.notes}</p>}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${late ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}>
              <Clock className="w-2.5 h-2.5" /> {fmtWhen(r.remind_at)}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${ch.cls}`}>
              <ch.icon className="w-2.5 h-2.5" /> {ch.label}
            </span>
            {r.patients?.name && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                <User className="w-2.5 h-2.5" /> {r.patients.name.split(" ")[0]}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => remove(r.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-indigo-600" /> Lembretes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Avisos e follow-ups da clínica. Atualiza em tempo real.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Novo Lembrete
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-rose-600 flex items-center gap-1.5 px-1">
              <BellRing className="w-4 h-4" /> Atrasados ({overdue.length})
            </h3>
            {overdue.length === 0 && <p className="text-xs text-gray-400 px-1 py-4">Nada atrasado 🎉</p>}
            {overdue.map(r => <Item key={r.id} r={r} late />)}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-indigo-600 flex items-center gap-1.5 px-1">
              <Clock className="w-4 h-4" /> Próximos ({upcoming.length})
            </h3>
            {upcoming.length === 0 && <p className="text-xs text-gray-400 px-1 py-4">Nenhum lembrete agendado</p>}
            {upcoming.map(r => <Item key={r.id} r={r} />)}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 px-1">
              <Check className="w-4 h-4" /> Concluídos ({done.length})
            </h3>
            {done.length === 0 && <p className="text-xs text-gray-400 px-1 py-4">Nenhum concluído ainda</p>}
            {done.map(r => <Item key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><Bell className="w-5 h-5 text-indigo-600" /> Novo Lembrete</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Confirmar consulta da Ana" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Observação</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Detalhes (opcional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quando *</label>
                  <Input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Canal</label>
                  <select value={channel} onChange={e => setChannel(e.target.value as ReminderChannel)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="sistema">Sistema</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Paciente</label>
                  <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">—</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Responsável</label>
                  <select value={psyId} onChange={e => setPsyId(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">—</option>
                    {psychologists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={saving || !title.trim() || !when} className="bg-indigo-600 hover:bg-indigo-700 min-w-[110px]">
                {saving ? "Salvando..." : "Criar Lembrete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
