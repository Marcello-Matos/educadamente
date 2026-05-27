"use client";

import {
  Users,
  Calendar,
  DollarSign,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  dashboardStats,
  monthlyRevenueData,
  sessions,
  payments,
} from "@/lib/mock-data";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const statusColors = {
  agendada: "default",
  realizada: "success",
  cancelada: "destructive",
  falta: "warning",
} as const;

export default function DashboardPage() {
  const upcomingSessions = sessions
    .filter((s) => s.status === "agendada")
    .slice(0, 5);
  const overduePayments = payments.filter((p) => p.status === "atrasado");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Visão geral da sua clínica
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardStats.totalPatients}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sessões do Mês</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardStats.sessionsThisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Taxa de faltas: {dashboardStats.absenceRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Faturamento Mensal</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(dashboardStats.monthlyRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +3.2% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Psicólogos Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardStats.activePsychologists}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Satisfação: {dashboardStats.satisfactionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [formatCurrency(Number(value)), "Receita"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessões por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Presencial", value: 85 },
                    { name: "Teleconsulta", value: 57 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0, 1].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-gray-600">Presencial (85)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600">Teleconsulta (57)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Próximas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.patientName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.date} às {session.time} - {session.psychologistName}
                    </p>
                  </div>
                  <Badge variant={session.type === "teleconsulta" ? "default" : "secondary"}>
                    {session.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Pagamentos em Atraso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overduePayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.patientName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vencimento: {payment.dueDate}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
              {overduePayments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum pagamento em atraso
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
