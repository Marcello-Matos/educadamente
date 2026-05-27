"use client";

import { useState } from "react";
import {
  Calendar,
  FileText,
  Receipt,
  Video,
  User,
  Clock,
  Download,
  ExternalLink,
  LogIn,
  Shield,
  ArrowLeft,
  CheckCircle,
  X,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Send,
  Monitor,
  ChevronRight,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

type PortalView = "home" | "agendar" | "historico" | "recibos" | "teleconsulta" | "sala";

const myAppointments = [
  { id: 1, date: "20/12/2024", time: "09:00", type: "Presencial" as const, psy: "Dra. Maria Santos", status: "agendada" as const, desc: "Sessão Individual" },
  { id: 2, date: "27/12/2024", time: "09:00", type: "Teleconsulta" as const, psy: "Dra. Maria Santos", status: "agendada" as const, desc: "Sessão Individual" },
  { id: 3, date: "13/12/2024", time: "09:00", type: "Presencial" as const, psy: "Dra. Maria Santos", status: "realizada" as const, desc: "Sessão Individual" },
  { id: 4, date: "06/12/2024", time: "09:00", type: "Presencial" as const, psy: "Dra. Maria Santos", status: "realizada" as const, desc: "Sessão Individual" },
  { id: 5, date: "29/11/2024", time: "09:00", type: "Teleconsulta" as const, psy: "Dra. Maria Santos", status: "realizada" as const, desc: "Sessão Individual" },
  { id: 6, date: "22/11/2024", time: "09:00", type: "Presencial" as const, psy: "Dra. Maria Santos", status: "falta" as const, desc: "Sessão Individual" },
];

const myReceipts = [
  { id: 1, desc: "Sessão Individual - Dezembro/2024", date: "10/12/2024", amount: 250, method: "PIX" },
  { id: 2, desc: "Sessão Individual - Novembro/2024", date: "10/11/2024", amount: 250, method: "PIX" },
  { id: 3, desc: "Sessão Individual - Outubro/2024", date: "10/10/2024", amount: 250, method: "Cartão" },
  { id: 4, desc: "Sessão Individual - Setembro/2024", date: "10/09/2024", amount: 250, method: "PIX" },
  { id: 5, desc: "Sessão Individual - Agosto/2024", date: "10/08/2024", amount: 250, method: "Boleto" },
];

const availableSlots = [
  { date: "23/12/2024", day: "Segunda", slots: ["09:00", "10:00", "14:00", "15:00"] },
  { date: "24/12/2024", day: "Terça", slots: ["09:00", "11:00"] },
  { date: "26/12/2024", day: "Quinta", slots: ["08:00", "09:00", "10:00", "14:00", "16:00"] },
  { date: "27/12/2024", day: "Sexta", slots: ["10:00", "11:00", "15:00"] },
  { date: "30/12/2024", day: "Segunda", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
];

export default function PortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<PortalView>("home");
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [sessionType, setSessionType] = useState<"presencial" | "teleconsulta">("presencial");
  const [receiptModal, setReceiptModal] = useState<number | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"todas" | "realizada" | "agendada" | "falta">("todas");
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "psy" as const, text: "Bom dia! Como você está se sentindo hoje?", time: "09:01" },
    { id: 2, sender: "me" as const, text: "Bom dia, Dra. Estou me sentindo melhor essa semana.", time: "09:02" },
  ]);

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle className="text-xl">Portal do Paciente</CardTitle>
            <CardDescription>
              Acesse seu histórico, agende consultas e muito mais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input type="email" placeholder="seu@email.com" defaultValue="carlos@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <Input type="password" placeholder="••••••••" defaultValue="12345678" />
            </div>
            <Button className="w-full" onClick={() => setIsLoggedIn(true)}>
              <LogIn className="w-4 h-4" />
              Entrar
            </Button>
            <p className="text-xs text-center text-gray-500">
              <Shield className="w-3 h-3 inline mr-1" />
              Acesso seguro protegido por LGPD
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Header for all views
  const portalHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {view !== "home" && (
          <Button variant="ghost" size="icon" onClick={() => { setView("home"); setBookingConfirmed(false); setSelectedSlot(null); }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {view === "home" && "Portal do Paciente"}
            {view === "agendar" && "Agendar Consulta"}
            {view === "historico" && "Meu Histórico"}
            {view === "recibos" && "Meus Recibos"}
            {view === "teleconsulta" && "Teleconsulta"}
            {view === "sala" && "Sala de Teleconsulta"}
          </h1>
          {view === "home" && <p className="text-sm sm:text-base text-gray-500 mt-1">Bem-vindo de volta, Carlos Alberto</p>}
        </div>
      </div>
      <Button variant="outline" className="w-full sm:w-auto" onClick={() => { setIsLoggedIn(false); setView("home"); }}>
        Sair
      </Button>
    </div>
  );

  // ─── AGENDAR CONSULTA ───
  if (view === "agendar") {
    return (
      <div className="space-y-6">
        {portalHeader}

        {bookingConfirmed ? (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Consulta Agendada!</h2>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">{selectedSlot?.date}</span> às <span className="font-medium">{selectedSlot?.time}</span>
              </p>
              <p className="text-gray-500 text-sm mb-1">Tipo: {sessionType === "presencial" ? "Presencial" : "Teleconsulta"}</p>
              <p className="text-gray-500 text-sm mb-4">Com Dra. Maria Santos</p>
              <p className="text-xs text-gray-400 mb-6">Um lembrete será enviado por WhatsApp e email 24h antes.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setBookingConfirmed(false); setSelectedSlot(null); }}>
                  Agendar Outra
                </Button>
                <Button variant="outline" onClick={() => { setView("home"); setBookingConfirmed(false); setSelectedSlot(null); }}>
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Session Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tipo de Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSessionType("presencial")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      sessionType === "presencial" ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <User className={`w-6 h-6 mx-auto mb-2 ${sessionType === "presencial" ? "text-indigo-600" : "text-gray-400"}`} />
                    <p className={`text-sm font-medium ${sessionType === "presencial" ? "text-indigo-700" : "text-gray-700"}`}>Presencial</p>
                  </button>
                  <button
                    onClick={() => setSessionType("teleconsulta")}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      sessionType === "teleconsulta" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Video className={`w-6 h-6 mx-auto mb-2 ${sessionType === "teleconsulta" ? "text-purple-600" : "text-gray-400"}`} />
                    <p className={`text-sm font-medium ${sessionType === "teleconsulta" ? "text-purple-700" : "text-gray-700"}`}>Teleconsulta</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Available Slots */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Horários Disponíveis</CardTitle>
                <CardDescription>Selecione a data e horário de sua preferência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableSlots.map((day) => (
                  <div key={day.date}>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      {day.day}, {day.date}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {day.slots.map((time) => {
                        const isSelected = selectedSlot?.date === day.date && selectedSlot?.time === time;
                        return (
                          <button
                            key={`${day.date}-${time}`}
                            onClick={() => setSelectedSlot({ date: day.date, time })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações (opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Alguma observação para o psicólogo sobre esta consulta?" rows={3} />
              </CardContent>
            </Card>

            {/* Confirm */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled={!selectedSlot}
                onClick={() => setBookingConfirmed(true)}
              >
                <Calendar className="w-4 h-4" />
                Confirmar Agendamento
              </Button>
              <Button variant="outline" onClick={() => setView("home")}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── MEU HISTÓRICO ───
  if (view === "historico") {
    return (
      <div className="space-y-6">
        {portalHeader}

        <div className="flex gap-2">
          <Button variant={historyFilter === "todas" ? "secondary" : "outline"} size="sm" onClick={() => setHistoryFilter("todas")}>Todas</Button>
          <Button variant={historyFilter === "realizada" ? "secondary" : "outline"} size="sm" onClick={() => setHistoryFilter("realizada")}>Realizadas</Button>
          <Button variant={historyFilter === "agendada" ? "secondary" : "outline"} size="sm" onClick={() => setHistoryFilter("agendada")}>Agendadas</Button>
          <Button variant={historyFilter === "falta" ? "secondary" : "outline"} size="sm" onClick={() => setHistoryFilter("falta")}>Faltas</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {myAppointments.filter(apt => historyFilter === "todas" || apt.status === historyFilter).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      apt.status === "realizada" ? "bg-emerald-100" :
                      apt.status === "agendada" ? "bg-indigo-100" :
                      "bg-amber-100"
                    }`}>
                      {apt.status === "realizada" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                       apt.status === "agendada" ? <Clock className="w-5 h-5 text-indigo-600" /> :
                       <X className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.desc}</p>
                      <p className="text-xs text-gray-500">{apt.date} às {apt.time} • {apt.psy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={apt.type === "Teleconsulta" ? "default" : "secondary"}>
                      {apt.type}
                    </Badge>
                    <Badge
                      variant={
                        apt.status === "realizada" ? "success" :
                        apt.status === "agendada" ? "default" :
                        "warning"
                      }
                    >
                      {apt.status === "realizada" ? "Realizada" :
                       apt.status === "agendada" ? "Agendada" :
                       "Falta"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium">{myAppointments.length}</span> sessões •
            Realizadas: <span className="font-medium text-emerald-600">{myAppointments.filter(a => a.status === "realizada").length}</span> •
            Faltas: <span className="font-medium text-amber-600">{myAppointments.filter(a => a.status === "falta").length}</span>
          </p>
        </div>
      </div>
    );
  }

  // ─── MEUS RECIBOS ───
  if (view === "recibos") {
    const receiptData = receiptModal !== null ? myReceipts.find(r => r.id === receiptModal) : null;

    return (
      <div className="space-y-6">
        {portalHeader}

        {/* Receipt Modal */}
        {receiptData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setReceiptModal(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recibo de Pagamento</h3>
                <button onClick={() => setReceiptModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-5 space-y-4">
                <div className="text-center border-b border-gray-100 pb-4">
                  <h4 className="text-lg font-bold text-gray-900">Sistema Educadamente</h4>
                  <p className="text-xs text-gray-500">CNPJ: 12.345.678/0001-90</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paciente:</span>
                    <span className="font-medium">Carlos Alberto Silva</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CPF:</span>
                    <span className="font-medium">123.456.789-00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Descrição:</span>
                    <span className="font-medium">{receiptData.desc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Pagamento:</span>
                    <span className="font-medium">{receiptData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Método:</span>
                    <span className="font-medium">{receiptData.method}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                    <span className="text-gray-700 font-semibold">Valor:</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(receiptData.amount)}</span>
                  </div>
                </div>
                <div className="text-center border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400">Psicóloga: Dra. Maria Santos - CRP 06/123456</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button className="flex-1" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" />
                  Imprimir
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => {
                  const blob = new Blob([
                    `RECIBO DE PAGAMENTO\n\nSistema Educadamente\nCNPJ: 12.345.678/0001-90\n\nPaciente: Carlos Alberto Silva\nCPF: 123.456.789-00\nDescrição: ${receiptData.desc}\nData: ${receiptData.date}\nMétodo: ${receiptData.method}\nValor: R$ ${receiptData.amount},00\n\nPsicóloga: Dra. Maria Santos - CRP 06/123456`
                  ], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `recibo-${receiptData.date.replace(/\//g, "-")}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <Download className="w-4 h-4" />
                  Baixar
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {myReceipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{receipt.desc}</p>
                      <p className="text-xs text-gray-500">Pago em {receipt.date} • {receipt.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(receipt.amount)}</span>
                    <Button variant="outline" size="sm" onClick={() => setReceiptModal(receipt.id)}>
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      Ver Recibo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Pago</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(myReceipts.reduce((s, r) => s + r.amount, 0))}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── TELECONSULTA (Lista) ───
  if (view === "teleconsulta") {
    const teleAppts = myAppointments.filter(a => a.type === "Teleconsulta" && a.status === "agendada");

    return (
      <div className="space-y-6">
        {portalHeader}

        {teleAppts.length > 0 ? (
          <div className="space-y-3">
            {teleAppts.map((apt) => (
              <Card key={apt.id} className="border-purple-200 hover:border-purple-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">{apt.desc}</p>
                        <p className="text-sm text-gray-500">{apt.date} às {apt.time} • {apt.psy}</p>
                      </div>
                    </div>
                    <Button onClick={() => setView("sala")}>
                      <ExternalLink className="w-4 h-4" />
                      Entrar na Sala
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma teleconsulta agendada</p>
              <Button onClick={() => setView("agendar")}>Agendar Teleconsulta</Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Dicas para a teleconsulta:</h4>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>• Escolha um ambiente silencioso e privado</li>
              <li>• Verifique sua câmera e microfone antes de entrar</li>
              <li>• Use fones de ouvido para maior privacidade</li>
              <li>• Tenha uma conexão estável de internet</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── SALA DE TELECONSULTA ───
  if (view === "sala") {
    return (
      <div className="space-y-4">
        {portalHeader}

        <div className={`grid grid-cols-1 ${chatOpen ? "lg:grid-cols-4" : ""} gap-4`}>
          <div className={chatOpen ? "lg:col-span-3" : ""}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gray-900 aspect-video flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-white text-lg font-medium">Dra. Maria Santos</p>
                    <p className="text-gray-400 text-sm">Conectado</p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-40 h-28 bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                    <div className="text-center">
                      <User className="w-6 h-6 text-gray-500 mx-auto" />
                      <p className="text-gray-400 text-xs mt-1">Você</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-mono">00:15:32</span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" className="bg-emerald-600 text-white border-0">
                      <Shield className="w-3 h-3 mr-1" /> Criptografada
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-900">
                  <Button
                    variant={micOn ? "secondary" : "destructive"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => setMicOn(!micOn)}
                  >
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant={videoOn ? "secondary" : "destructive"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => setVideoOn(!videoOn)}
                  >
                    {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                    <Monitor className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={chatOpen ? "default" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => setChatOpen(!chatOpen)}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => setView("teleconsulta")}
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {chatOpen && (
            <div className="lg:col-span-1">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Chat da Sessão</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto mb-4 min-h-[300px]">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                          msg.sender === "me" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === "me" ? "text-indigo-200" : "text-gray-400"}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite..."
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && chatMsg.trim()) {
                          setChatMessages([...chatMessages, { id: Date.now(), sender: "me", text: chatMsg, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
                          setChatMsg("");
                        }
                      }}
                      className="text-sm"
                    />
                    <Button size="icon" onClick={() => {
                      if (chatMsg.trim()) {
                        setChatMessages([...chatMessages, { id: Date.now(), sender: "me", text: chatMsg, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
                        setChatMsg("");
                      }
                    }}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── HOME ───
  return (
    <div className="space-y-6">
      {portalHeader}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:border-indigo-200 cursor-pointer transition-colors group" onClick={() => setView("agendar")}>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Agendar Consulta</p>
          </CardContent>
        </Card>
        <Card className="hover:border-emerald-200 cursor-pointer transition-colors group" onClick={() => setView("historico")}>
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Meu Histórico</p>
          </CardContent>
        </Card>
        <Card className="hover:border-amber-200 cursor-pointer transition-colors group" onClick={() => setView("recibos")}>
          <CardContent className="p-6 text-center">
            <Receipt className="w-8 h-8 text-amber-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Meus Recibos</p>
          </CardContent>
        </Card>
        <Card className="hover:border-purple-200 cursor-pointer transition-colors group" onClick={() => setView("teleconsulta")}>
          <CardContent className="p-6 text-center">
            <Video className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Teleconsulta</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myAppointments.filter(a => a.status === "agendada").map((apt) => (
              <div key={apt.id} className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.desc}</p>
                    <p className="text-xs text-gray-500">{apt.date} às {apt.time} • {apt.psy}</p>
                  </div>
                  <Badge variant={apt.type === "Teleconsulta" ? "default" : "secondary"}>{apt.type}</Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => setView("agendar")}>
              <Calendar className="w-4 h-4" />
              Agendar Nova Consulta
            </Button>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Recibos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myReceipts.slice(0, 2).map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{receipt.desc.split(" - ")[1]}</p>
                  <p className="text-xs text-gray-500">Pago em {receipt.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(receipt.amount)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView("recibos")}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => setView("recibos")}>
              <Receipt className="w-4 h-4" />
              Ver Todos os Recibos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Teleconsult Banner */}
      {myAppointments.some(a => a.type === "Teleconsulta" && a.status === "agendada") && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sua próxima teleconsulta</h3>
                  <p className="text-sm text-gray-500">27/12/2024 às 09:00 com Dra. Maria Santos</p>
                </div>
              </div>
              <Button onClick={() => setView("sala")}>
                <ExternalLink className="w-4 h-4" />
                Entrar na Sala
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
