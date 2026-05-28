"use client";

import { useEffect, useState } from "react";
import { DollarSign, AlertTriangle, Receipt, Download, CreditCard, QrCode, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getPayments } from "@/lib/supabase/payments";
import { Payment } from "@/lib/supabase/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const paymentMethodIcon = { pix: QrCode, cartao: CreditCard, boleto: FileText };
const paymentMethodLabel = { pix: "PIX", cartao: "Cartão", boleto: "Boleto" };
const statusConfig = {
  pago: { label: "Pago", variant: "success" as const, icon: CheckCircle },
  pendente: { label: "Pendente", variant: "warning" as const, icon: Clock },
  atrasado: { label: "Atrasado", variant: "destructive" as const, icon: XCircle },
};

export default function FinanceiroPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayments()
      .then(setPayments)
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const totalReceived = payments.filter((p) => p.status === "pago").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pendente").reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter((p) => p.status === "atrasado").reduce((sum, p) => sum + p.amount, 0);
  const filteredPayments = statusFilter === "all" ? payments : payments.filter((p) => p.status === statusFilter);
  const monthlyData: { month: string; receita: number; despesas: number }[] = [];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">Financeiro</h1><p className="text-sm sm:text-base text-gray-500 mt-1 leading-relaxed">Controle de pagamentos e faturamento</p></div>
        <div className="flex gap-2"><Button variant="outline" className="flex-1 sm:flex-none"><Download className="w-4 h-4" />Exportar</Button><Button className="flex-1 sm:flex-none"><Receipt className="w-4 h-4" />Novo Pagamento</Button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="group cursor-default"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Recebido</p><p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{formatCurrency(totalReceived)}</p></div><div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"><CheckCircle className="w-5 h-5 text-emerald-600" /></div></div></CardContent></Card>
        <Card className="group cursor-default"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Pendente</p><p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{formatCurrency(totalPending)}</p></div><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"><Clock className="w-5 h-5 text-amber-600" /></div></div></CardContent></Card>
        <Card className="group cursor-default"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Em Atraso</p><p className="text-2xl font-bold text-red-600 mt-1 tabular-nums">{formatCurrency(totalOverdue)}</p></div><div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"><AlertTriangle className="w-5 h-5 text-red-600" /></div></div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="text-lg font-semibold tracking-tight">Receita vs Despesas</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={280}><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} /><Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name === "receita" ? "Receita" : "Despesas"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} /><Bar dataKey="receita" fill="#6366f1" radius={[4, 4, 0, 0]} /><Bar dataKey="despesas" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[['all','Todos'],['pago','Pagos'],['pendente','Pendentes'],['atrasado','Atrasados']].map(([value,label]) => <Button key={value} variant={statusFilter === value ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(value)}>{label}</Button>)}
      </div>

      <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[700px]"><thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Paciente</th><th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Descrição</th><th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Valor</th><th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Vencimento</th><th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Método</th><th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th><th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th></tr></thead><tbody className="divide-y divide-gray-100">
        {loading && <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Carregando pagamentos...</td></tr>}
        {!loading && filteredPayments.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Nenhum pagamento cadastrado ainda.</td></tr>}
        {!loading && filteredPayments.map((payment) => { const MethodIcon = paymentMethodIcon[payment.method]; return <tr key={payment.id} className="hover:bg-gray-50/80 transition-colors duration-150"><td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{payment.patients?.name || "Não informado"}</p></td><td className="px-4 py-3"><p className="text-sm text-gray-600">{payment.description}</p></td><td className="px-4 py-3"><p className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(payment.amount)}</p></td><td className="px-4 py-3"><p className="text-sm text-gray-600">{payment.due_date}</p></td><td className="px-4 py-3"><div className="flex items-center gap-1.5"><MethodIcon className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">{paymentMethodLabel[payment.method]}</span></div></td><td className="px-4 py-3"><Badge variant={statusConfig[payment.status].variant}>{statusConfig[payment.status].label}</Badge></td><td className="px-4 py-3"><Button variant="ghost" size="sm" className="text-xs"><Receipt className="w-3 h-3 mr-1" />Recibo</Button></td></tr>; })}
      </tbody></table></div></CardContent></Card>
    </div>
  );
}
