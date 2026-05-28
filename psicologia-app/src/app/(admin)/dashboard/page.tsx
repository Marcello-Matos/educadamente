"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Calendar, DollarSign, UserCheck, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getPatients, getPsychologists } from "@/lib/supabase/patients";
import { getSessions } from "@/lib/supabase/sessions";
import { getPayments } from "@/lib/supabase/payments";
import { Patient, Payment, Psychologist, Session } from "@/lib/supabase/types";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    Promise.all([getPatients(), getPsychologists(), getSessions(), getPayments()])
      .then(([patientsData, psychologistsData, sessionsData, paymentsData]) => {
        setPatients(patientsData);
        setPsychologists(psychologistsData);
        setSessions(sessionsData);
        setPayments(paymentsData);
      })
      .catch(() => {
        setPatients([]);
        setPsychologists([]);
        setSessions([]);
        setPayments([]);
      });
  }, []);

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    const monthSessions = sessions.filter((s) => s.session_date.startsWith(`${year}-${month}`));
    const absences = monthSessions.filter((s) => s.status === "falta").length;

    return {
      totalPatients: patients.length,
      activePsychologists: psychologists.filter((p) => p.status === "ativo").length,
      sessionsThisMonth: monthSessions.length,
      monthlyRevenue: payments
        .filter((p) => p.status === "pago" && (p.paid_date ?? "").startsWith(`${year}-${month}`))
        .reduce((sum, p) => sum + p.amount, 0),
      absenceRate: monthSessions.length ? Math.round((absences / monthSessions.length) * 100) : 0,
    };
  }, [patients, psychologists, sessions, payments]);

  const monthlyRevenueData: { month: string; revenue: number }[] = [];
  const sessionsByTypeData = [
    { name: "Presencial", value: sessions.filter((s) => s.type === "presencial").length },
    { name: "Teleconsulta", value: sessions.filter((s) => s.type === "teleconsulta").length },
  ];
  const upcomingSessions = sessions.filter((s) => s.status === "agendada").slice(0, 5);
  const overduePayments = payments.filter((p) => p.status === "atrasado");

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 leading-relaxed">Visão geral da sua clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="group cursor-default"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Pacientes</p><p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{dashboardStats.totalPatients}</p></div><div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"><Users className="w-6 h-6 text-indigo-600" /></div></div><p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Dados reais</p></CardContent></Card>
        <Card className="group cursor-default"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Sessões do Mês</p><p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{dashboardStats.sessionsThisMonth}</p></div><div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"><Calendar className="w-6 h-6 text-emerald-600" /></div></div><p className="text-xs text-gray-500 mt-2">Taxa de faltas: {dashboardStats.absenceRate}%</p></CardContent></Card>
        <Card className="group cursor-default"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Faturamento Mensal</p><p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{formatCurrency(dashboardStats.monthlyRevenue)}</p></div><div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"><DollarSign className="w-6 h-6 text-amber-600" /></div></div><p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Dados reais</p></CardContent></Card>
        <Card className="group cursor-default"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Psicólogos Ativos</p><p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{dashboardStats.activePsychologists}</p></div><div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"><UserCheck className="w-6 h-6 text-purple-600" /></div></div><p className="text-xs text-gray-500 mt-2">Satisfação: sem dados</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold tracking-tight">Faturamento Mensal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Receita"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold tracking-tight">Sessões por Tipo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sessionsByTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {[0, 1].map((index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500" /><span className="text-sm text-gray-600">Presencial ({sessionsByTypeData[0].value})</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-sm text-gray-600">Teleconsulta ({sessionsByTypeData[1].value})</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight"><Clock className="w-5 h-5 text-indigo-600" />Próximas Sessões</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">
            {upcomingSessions.map((session) => <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100/80 hover:border-purple-200 border border-transparent transition-all duration-200 cursor-pointer"><div><p className="text-sm font-medium text-gray-900">{session.patients?.name || "Paciente não informado"}</p><p className="text-xs text-gray-500">{session.session_date} às {session.session_time.slice(0, 5)} - {session.psychologists?.name || "Não atribuído"}</p></div><Badge variant={session.type === "teleconsulta" ? "default" : "secondary"}>{session.type}</Badge></div>)}
            {upcomingSessions.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhuma sessão agendada</p>}
          </div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight"><AlertTriangle className="w-5 h-5 text-amber-600" />Pagamentos em Atraso</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">
            {overduePayments.map((payment) => <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100/80 border border-transparent hover:border-red-200 transition-all duration-200"><div><p className="text-sm font-medium text-gray-900">{payment.patients?.name || "Paciente não informado"}</p><p className="text-xs text-gray-500">Vencimento: {payment.due_date}</p></div><span className="text-sm font-bold text-red-600 tabular-nums">{formatCurrency(payment.amount)}</span></div>)}
            {overduePayments.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhum pagamento em atraso</p>}
          </div></CardContent>
        </Card>
      </div>
    </div>
  );
}
