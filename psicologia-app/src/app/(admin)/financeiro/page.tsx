"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Download,
  Filter,
  CreditCard,
  QrCode,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { payments } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const paymentMethodIcon = {
  pix: QrCode,
  cartao: CreditCard,
  boleto: FileText,
};

const paymentMethodLabel = {
  pix: "PIX",
  cartao: "Cartão",
  boleto: "Boleto",
};

const statusConfig = {
  pago: { label: "Pago", variant: "success" as const, icon: CheckCircle },
  pendente: { label: "Pendente", variant: "warning" as const, icon: Clock },
  atrasado: { label: "Atrasado", variant: "destructive" as const, icon: XCircle },
};

const monthlyData = [
  { month: "Jul", receita: 38000, despesas: 12000 },
  { month: "Ago", receita: 41000, despesas: 13000 },
  { month: "Set", receita: 39500, despesas: 11500 },
  { month: "Out", receita: 43000, despesas: 14000 },
  { month: "Nov", receita: 44200, despesas: 13500 },
  { month: "Dez", receita: 45600, despesas: 12800 },
];

export default function FinanceiroPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const totalReceived = payments
    .filter((p) => p.status === "pago")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments
    .filter((p) => p.status === "atrasado")
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments =
    statusFilter === "all"
      ? payments
      : payments.filter((p) => p.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Controle de pagamentos e faturamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="flex-1 sm:flex-none">
            <Receipt className="w-4 h-4" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recebido</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(totalReceived)}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendente</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(totalOverdue)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value)),
                  name === "receita" ? "Receita" : "Despesas",
                ]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="receita" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === "pago" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pago")}
        >
          Pagos
        </Button>
        <Button
          variant={statusFilter === "pendente" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pendente")}
        >
          Pendentes
        </Button>
        <Button
          variant={statusFilter === "atrasado" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("atrasado")}
        >
          Atrasados
        </Button>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Paciente
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Descrição
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Valor
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Vencimento
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Método
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
                  const MethodIcon = paymentMethodIcon[payment.method];
                  const StatusIcon = statusConfig[payment.status].icon;
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.patientName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{payment.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{payment.dueDate}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {paymentMethodLabel[payment.method]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusConfig[payment.status].variant}>
                          {statusConfig[payment.status].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Receipt className="w-3 h-3 mr-1" />
                            Recibo
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
