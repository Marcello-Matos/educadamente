"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getPatients, getPsychologists } from "@/lib/supabase/patients";
import { getSessions } from "@/lib/supabase/sessions";
import { Patient, Psychologist, Session } from "@/lib/supabase/types";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const statusConfig = {
  agendada: { label: "Agendada", variant: "default" as const, color: "bg-indigo-500" },
  realizada: { label: "Realizada", variant: "success" as const, color: "bg-emerald-500" },
  cancelada: { label: "Cancelada", variant: "destructive" as const, color: "bg-red-500" },
  falta: { label: "Falta", variant: "warning" as const, color: "bg-amber-500" },
};

export default function AgendaPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [view, setView] = useState<"day" | "week">("day");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);

  useEffect(() => {
    Promise.all([getSessions(), getPatients(), getPsychologists()])
      .then(([sessionsData, patientsData, psychologistsData]) => {
        setSessions(sessionsData);
        setPatients(patientsData);
        setPsychologists(psychologistsData);
      })
      .catch(() => {
        setSessions([]);
        setPatients([]);
        setPsychologists([]);
      });
  }, []);

  const todaySessions = sessions.filter((s) => s.session_date === selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Gerencie as sessões e agendamentos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Nova Sessão
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">{new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long" })}</p>
              </div>
              <Button variant="outline" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
              >
                Dia
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
              >
                Semana
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <Button variant="secondary" size="sm" className="flex-shrink-0">Todos</Button>
            {psychologists.map((psy) => (
              <Button key={psy.id} variant="outline" size="sm" className="flex-shrink-0">
                {psy.name.split(" ")[0]}. {psy.name.split(" ").pop()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader>
            <CardTitle>Agendar Nova Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente *
                </label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option>Selecione o paciente</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Psicólogo(a) *
                </label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option>Selecione</option>
                  {psychologists.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <Input type="date" defaultValue={selectedDate} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário *
                </label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (min)
                </label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="50">50 minutos</option>
                  <option value="80">80 minutos</option>
                  <option value="100">100 minutos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="presencial">Presencial</option>
                  <option value="teleconsulta">Teleconsulta</option>
                </select>
              </div>
              <div className="col-span-full flex gap-3 pt-4">
                <Button type="button">Agendar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sessões do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {timeSlots.map((time) => {
                  const session = todaySessions.find((s) => s.session_time.slice(0, 5) === time);
                  return (
                    <div key={time} className="flex items-stretch gap-3 min-h-[60px]">
                      <div className="w-14 text-sm text-gray-500 pt-2 text-right shrink-0">
                        {time}
                      </div>
                      <div className="w-px bg-gray-200 relative">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-300" />
                      </div>
                      <div className="flex-1 pb-2">
                        {session ? (
                          <div
                            className={`p-3 rounded-lg border-l-4 ${
                              session.status === "agendada"
                                ? "bg-indigo-50 border-indigo-500"
                                : session.status === "realizada"
                                ? "bg-emerald-50 border-emerald-500"
                                : session.status === "falta"
                                ? "bg-amber-50 border-amber-500"
                                : "bg-red-50 border-red-500"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {session.patients?.name || "Paciente não informado"}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {session.psychologists?.name || "Não atribuído"} • {session.duration}min
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {session.type === "teleconsulta" ? (
                                  <Video className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                )}
                                <Badge variant={statusConfig[session.status].variant}>
                                  {statusConfig[session.status].label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full border border-dashed border-gray-200 rounded-lg" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo do Dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de sessões</span>
                <span className="text-sm font-semibold">{todaySessions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Presenciais</span>
                <span className="text-sm font-semibold">
                  {todaySessions.filter((s) => s.type === "presencial").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Teleconsultas</span>
                <span className="text-sm font-semibold">
                  {todaySessions.filter((s) => s.type === "teleconsulta").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Faltas</span>
                <span className="text-sm font-semibold text-amber-600">
                  {todaySessions.filter((s) => s.status === "falta").length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle className="text-base">Lembretes</CardTitle></CardHeader><CardContent><p className="text-sm text-gray-500 text-center py-4">Nenhum lembrete por enquanto</p></CardContent></Card></div>
      </div>
    </div>
  );
}
