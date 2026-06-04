"use client";

import { useEffect, useState } from "react";
import {
  Plus, X, Trash2, CheckCircle2, Circle,
  Flag, User, CalendarDays, ListTodo, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "@/lib/supabase/tasks";
import { getPatients, getPsychologists } from "@/lib/supabase/patients";
import { Task, TaskStatus, TaskPriority, Patient, Psychologist } from "@/lib/supabase/types";
import { toast } from "@/hooks/use-toast";

const COLUMNS: { id: TaskStatus; label: string; accent: string; ring: string }[] = [
  { id: "pendente",     label: "A Fazer",      accent: "bg-gray-400",    ring: "border-gray-200" },
  { id: "em_andamento", label: "Em Andamento", accent: "bg-amber-400",   ring: "border-amber-200" },
  { id: "concluida",    label: "Concluídas",   accent: "bg-emerald-400", ring: "border-emerald-200" },
];

const PRIORITY: Record<TaskPriority, { label: string; cls: string }> = {
  alta:  { label: "Alta",  cls: "bg-rose-100 text-rose-700" },
  media: { label: "Média", cls: "bg-amber-100 text-amber-700" },
  baixa: { label: "Baixa", cls: "bg-sky-100 text-sky-700" },
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pendente: "em_andamento",
  em_andamento: "concluida",
  concluida: "pendente",
};

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [psychologists, setPsych] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [dueDate, setDueDate] = useState("");
  const [psyId, setPsyId] = useState("");
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    Promise.all([getTasks(), getPatients(), getPsychologists()])
      .then(([t, p, ps]) => { setTasks(t); setPatients(p); setPsych(ps); })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Realtime
    const channel = supabase
      .channel("tasks-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        getTasks().then(setTasks).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function reset() {
    setTitle(""); setDesc(""); setPriority("media"); setDueDate(""); setPsyId(""); setPatientId("");
  }

  async function handleCreateTask() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const t = await createTask({
        title: title.trim(),
        description: desc || null,
        priority,
        due_date: dueDate || null,
        psychologist_id: psyId || null,
        patient_id: patientId || null,
      });
      setTasks(prev => [t, ...prev]);
      toast.success("Tarefa criada");
      setShowModal(false);
      reset();
    } catch {
      toast.error("Erro ao criar tarefa", "Verifique se a tabela 'tasks' existe no Supabase.");
    } finally { setSaving(false); }
  }

  async function advance(task: Task) {
    const next = NEXT_STATUS[task.status];
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t));
    try { await updateTaskStatus(task.id, next); }
    catch { toast.error("Erro ao atualizar"); }
  }

  async function remove(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
    try { await deleteTask(id); } catch { toast.error("Erro ao excluir"); }
  }

  const counts = {
    pendente: tasks.filter(t => t.status === "pendente").length,
    em_andamento: tasks.filter(t => t.status === "em_andamento").length,
    concluida: tasks.filter(t => t.status === "concluida").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-indigo-600" /> Tarefas
          </h1>
          <p className="text-sm text-gray-500 mt-1">Organize as atividades da equipe. Atualiza em tempo real.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div key={col.id} className={`rounded-2xl border ${col.ring} bg-gray-50/60 flex flex-col`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.accent}`} />
                  <h3 className="text-sm font-bold text-gray-700">{col.label}</h3>
                </div>
                <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {counts[col.id]}
                </span>
              </div>
              <div className="p-3 space-y-2 min-h-[120px]">
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">Nenhuma tarefa</p>
                )}
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => advance(task)} className="mt-0.5 shrink-0" title="Avançar status">
                        {task.status === "concluida"
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-snug ${task.status === "concluida" ? "line-through text-gray-400" : "text-gray-900"}`}>
                          {task.title}
                        </p>
                        {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${PRIORITY[task.priority].cls}`}>
                            <Flag className="w-2.5 h-2.5" /> {PRIORITY[task.priority].label}
                          </span>
                          {task.due_date && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              <CalendarDays className="w-2.5 h-2.5" />
                              {new Date(`${task.due_date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                            </span>
                          )}
                          {task.psychologists?.name && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              <User className="w-2.5 h-2.5" /> {task.psychologists.name.split(" ")[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => remove(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600" /> Nova Tarefa
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Ligar para confirmar consulta" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" placeholder="Detalhes (opcional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prioridade</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prazo</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Responsável</label>
                  <select value={psyId} onChange={e => setPsyId(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">—</option>
                    {psychologists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Paciente</label>
                  <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="">—</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateTask} disabled={saving || !title.trim()} className="bg-indigo-600 hover:bg-indigo-700 min-w-[110px]">
                {saving ? "Salvando..." : "Criar Tarefa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
