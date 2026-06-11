"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Receipt,
  Video,
  User,
  Clock,
  Shield,
  LogOut,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Briefcase,
  FileText,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { signOut, signIn } from "@/lib/supabase/auth";
import {
  findPatientByEmail,
  sendPatientMagicLink,
  setPatientPassword,
  getPatientSessions,
  getPatientPayments,
  getBookedSlots,
  bookPatientSession,
} from "@/lib/supabase/portal";
import { Patient, Session, Payment } from "@/lib/supabase/types";

type View = "home" | "agendar" | "historico" | "recibos" | "teleconsulta" | "sala";

const SLOT_HOURS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function toISODate(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

const sessionStatusMap: Record<string, { label: string; variant: "success" | "default" | "destructive" | "secondary" }> = {
  agendada: { label: "Agendada", variant: "default" },
  realizada: { label: "Realizada", variant: "success" },
  cancelada: { label: "Cancelada", variant: "secondary" },
  falta: { label: "Falta", variant: "destructive" },
};

const paymentStatusMap: Record<string, { label: string; variant: "success" | "default" | "destructive" | "secondary" }> = {
  pago: { label: "Pago", variant: "success" },
  pendente: { label: "Pendente", variant: "default" },
  atrasado: { label: "Atrasado", variant: "destructive" },
};

const methodLabel: Record<string, string> = { pix: "PIX", cartao: "Cartão", boleto: "Boleto" };

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export default function PacientePortalPage() {
  const { user, loading: authLoading } = useAuth();

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [firstAccess, setFirstAccess] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Criação de senha (primeiro acesso)
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Dados do paciente logado
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [view, setView] = useState<View>("home");

  // Agendamento
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [sessionType, setSessionType] = useState<"presencial" | "teleconsulta">("presencial");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ session_date: string; session_time: string }[]>([]);

  // Sala de teleconsulta
  const [activeTele, setActiveTele] = useState<Session | null>(null);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camError, setCamError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);

  // Quando autenticado, busca o cadastro do paciente pelo email
  useEffect(() => {
    if (!user?.email) {
      setPatient(null);
      setNotRegistered(false);
      return;
    }
    let cancelled = false;
    setLoadingData(true);
    (async () => {
      try {
        const p = await findPatientByEmail(user.email!);
        if (cancelled) return;
        if (!p) {
          setNotRegistered(true);
          setPatient(null);
          return;
        }
        setPatient(p);
        setNotRegistered(false);
        const [sess, pays] = await Promise.all([
          getPatientSessions(p.id),
          getPatientPayments(p.id),
        ]);
        if (cancelled) return;
        setSessions(sess);
        setPayments(pays);
      } catch (err) {
        console.error("[portal] erro ao carregar dados:", err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const translateAuthError = (msg: string | undefined): string => {
    if (!msg) return "Algo deu errado. Tente novamente.";
    const m = msg.toLowerCase();
    if (m.includes("rate limit")) return "Limite de envio de emails atingido. Aguarde alguns minutos ou entre com email e senha.";
    if (m.includes("invalid login credentials")) return "Email ou senha incorretos. Se for seu primeiro acesso, use a opção de receber o link por email.";
    if (m.includes("email not confirmed")) return "Email ainda não confirmado. Use a opção de receber o link por email.";
    return msg;
  };

  // Primeiro acesso / esqueci a senha: envia o link mágico
  const requestAccess = async () => {
    if (!email.trim()) return;
    setSending(true);
    setLoginError(null);
    try {
      const p = await findPatientByEmail(email);
      if (!p) {
        setLoginError("Este email não está cadastrado na clínica. Entre em contato com a recepção para solicitar seu acesso.");
        return;
      }
      await sendPatientMagicLink(email);
      setLinkSent(true);
    } catch (err: any) {
      console.error("[portal] erro ao enviar link:", err);
      setLoginError(translateAuthError(err?.message));
    } finally {
      setSending(false);
    }
  };

  // Acesso normal: email + senha
  const loginWithPassword = async () => {
    if (!email.trim() || !password) return;
    setLoggingIn(true);
    setLoginError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      console.error("[portal] erro no login:", err);
      setLoginError(translateAuthError(err?.message));
    } finally {
      setLoggingIn(false);
    }
  };

  // Cria a senha após o primeiro acesso via link
  const createPassword = async () => {
    setPassError(null);
    if (newPass.length < 8) {
      setPassError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (newPass !== newPass2) {
      setPassError("As senhas não conferem.");
      return;
    }
    setSavingPass(true);
    try {
      await setPatientPassword(newPass);
      setNewPass("");
      setNewPass2("");
    } catch (err: any) {
      console.error("[portal] erro ao criar senha:", err);
      setPassError(translateAuthError(err?.message));
    } finally {
      setSavingPass(false);
    }
  };

  // Carrega horários ocupados do profissional ao abrir a tela de agendamento
  useEffect(() => {
    if (view !== "agendar" || !patient?.psychologist_id) return;
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 14);
    getBookedSlots(patient.psychologist_id, toISODate(from), toISODate(to))
      .then(setBooked)
      .catch((err) => console.error("[portal] erro ao carregar horários:", err));
  }, [view, patient?.psychologist_id]);

  // Liga a webcam ao entrar na sala; desliga ao sair
  useEffect(() => {
    if (view !== "sala") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        camStreamRef.current = stream;
        setCamError(null);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        setCamError(
          err?.name === "NotAllowedError"
            ? "Permissão de câmera negada"
            : "Não foi possível acessar a câmera"
        );
      }
    })();
    return () => {
      cancelled = true;
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((t) => t.stop());
        camStreamRef.current = null;
      }
    };
  }, [view]);

  useEffect(() => {
    if (camStreamRef.current) camStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = videoOn));
  }, [videoOn]);

  useEffect(() => {
    if (camStreamRef.current) camStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [micOn]);

  const confirmBooking = async () => {
    if (!patient || !selectedSlot) return;
    setBookingBusy(true);
    setBookingError(null);
    try {
      await bookPatientSession({
        patient_id: patient.id,
        psychologist_id: patient.psychologist_id,
        session_date: selectedSlot.date,
        session_time: selectedSlot.time,
        type: sessionType,
      });
      setBookingConfirmed(true);
      const sess = await getPatientSessions(patient.id);
      setSessions(sess);
    } catch (err: any) {
      console.error("[portal] erro ao agendar:", err);
      setBookingError(err?.message || "Não foi possível agendar. Tente novamente.");
    } finally {
      setBookingBusy(false);
    }
  };

  const goTo = (v: View) => {
    setView(v);
    setSelectedSlot(null);
    setBookingConfirmed(false);
    setBookingError(null);
  };

  const handleSignOut = async () => {
    await signOut();
    setPatient(null);
    setNotRegistered(false);
    setLinkSent(false);
    setEmail("");
    setView("home");
  };

  // ─── CARREGANDO SESSÃO ───
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // ─── LOGIN (link mágico por email) ───
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Portal do Paciente</CardTitle>
              <CardDescription>
                Acesse seu histórico de consultas e recibos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkSent ? (
                <div className="text-center space-y-3 py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">Link de acesso enviado!</p>
                  <p className="text-xs text-gray-500">
                    Verifique sua caixa de entrada em <span className="font-medium">{email}</span> e
                    clique no link para entrar. Confira também a pasta de spam.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => { setLinkSent(false); setFirstAccess(false); }}>
                    Voltar
                  </Button>
                </div>
              ) : firstAccess ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email cadastrado na clínica
                    </label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && requestAccess()}
                    />
                  </div>
                  {loginError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}
                  <Button className="w-full" onClick={requestAccess} disabled={sending || !email.trim()}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Receber link de acesso por email
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Você receberá um link seguro no email. Ao entrar, criará sua senha.
                  </p>
                  <button
                    type="button"
                    className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium cursor-pointer"
                    onClick={() => { setFirstAccess(false); setLoginError(null); }}
                  >
                    Já tenho senha — voltar para o login
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loginWithPassword()}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {loginError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}
                  <Button className="w-full" onClick={loginWithPassword} disabled={loggingIn || !email.trim() || !password}>
                    {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 rotate-180" />}
                    Entrar
                  </Button>
                  <button
                    type="button"
                    className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-medium cursor-pointer"
                    onClick={() => { setFirstAccess(true); setLoginError(null); }}
                  >
                    Primeiro acesso ou esqueceu a senha? Clique aqui
                  </button>
                </>
              )}
              <p className="text-xs text-center text-gray-500">
                <Shield className="w-3 h-3 inline mr-1" />
                Acesso seguro protegido por LGPD
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── LOGADO MAS SEM CADASTRO NA CLÍNICA ───
  if (notRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <p className="text-sm font-medium text-gray-900">Cadastro não encontrado</p>
            <p className="text-xs text-gray-500">
              O email <span className="font-medium">{user.email}</span> não está cadastrado como
              paciente. Entre em contato com a clínica para solicitar seu acesso.
            </p>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── CARREGANDO DADOS ───
  if (loadingData || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // ─── PRIMEIRO ACESSO: CRIAR SENHA ───
  if (!user.user_metadata?.portal_password_set) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Crie sua senha</CardTitle>
              <CardDescription>
                Bem-vindo, {patient.name.split(" ")[0]}! Defina uma senha para entrar
                nas próximas vezes sem precisar do link por email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
                <Input
                  type={showNewPass ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={newPass2}
                  onChange={(e) => setNewPass2(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createPassword()}
                />
              </div>
              {passError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passError}</span>
                </div>
              )}
              <Button className="w-full" onClick={createPassword} disabled={savingPass || !newPass || !newPass2}>
                {savingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Salvar senha e entrar
              </Button>
              <p className="text-xs text-center text-gray-500">
                Da próxima vez, entre com seu email e esta senha.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = sessions
    .filter((s) => s.status === "agendada" && s.session_date >= today)
    .sort((a, b) => (a.session_date + a.session_time).localeCompare(b.session_date + b.session_time));
  const nextTele = upcoming.find((s) => s.type === "teleconsulta");
  const recentPaid = payments.filter((p) => p.status === "pago").slice(0, 2);

  // Gera os próximos 10 dias úteis com horários livres
  const bookedSet = new Set(booked.map((b) => `${b.session_date}|${b.session_time.slice(0, 5)}`));
  const availableDays: { date: string; day: string; slots: string[] }[] = [];
  {
    const cursor = new Date();
    cursor.setDate(cursor.getDate() + 1);
    while (availableDays.length < 10) {
      const dow = cursor.getDay();
      if (dow !== 0 && dow !== 6) {
        const iso = toISODate(cursor);
        const free = SLOT_HOURS.filter((h) => !bookedSet.has(`${iso}|${h}`));
        if (free.length > 0) availableDays.push({ date: iso, day: WEEKDAYS[dow], slots: free });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const pageTitle: Record<View, string> = {
    home: "Portal do Paciente",
    agendar: "Agendar Consulta",
    historico: "Meu Histórico",
    recibos: "Meus Recibos",
    teleconsulta: "Teleconsulta",
    sala: "Sala de Teleconsulta",
  };

  const teleAppts = upcoming.filter((s) => s.type === "teleconsulta");

  // ─── PORTAL ───
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
              <p className="text-xs text-gray-500">Portal do Paciente</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Título + voltar */}
        <div className="flex items-center gap-3">
          {view !== "home" && (
            <Button variant="ghost" size="sm" onClick={() => goTo("home")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{pageTitle[view]}</h1>
            {view === "home" && (
              <p className="text-sm text-gray-500">Bem-vindo de volta, {patient.name.split(" ")[0]}</p>
            )}
          </div>
        </div>

        {/* ─── HOME ─── */}
        {view === "home" && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => goTo("agendar")} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-indigo-300 hover:shadow-sm transition-all">
                <Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-indigo-700">Agendar Consulta</p>
              </button>
              <button onClick={() => goTo("historico")} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-emerald-300 hover:shadow-sm transition-all">
                <FileText className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-700">Meu Histórico</p>
              </button>
              <button onClick={() => goTo("recibos")} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-amber-300 hover:shadow-sm transition-all">
                <Receipt className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-700">Meus Recibos</p>
              </button>
              <button onClick={() => goTo("teleconsulta")} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-purple-300 hover:shadow-sm transition-all">
                <Video className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Teleconsulta</p>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Próximas Consultas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" /> Próximas Consultas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sessão Individual</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(s.session_date)} às {s.session_time.slice(0, 5)}
                          {s.psychologists ? ` • ${s.psychologists.name}` : ""}
                        </p>
                      </div>
                      <Badge variant={s.type === "teleconsulta" ? "default" : "secondary"}>
                        {s.type === "teleconsulta" ? "Teleconsulta" : "Presencial"}
                      </Badge>
                    </div>
                  ))}
                  {upcoming.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Nenhuma consulta agendada</p>
                  )}
                  <Button variant="outline" className="w-full" size="sm" onClick={() => goTo("agendar")}>
                    <Calendar className="w-4 h-4" /> Agendar Nova Consulta
                  </Button>
                </CardContent>
              </Card>

              {/* Recibos Recentes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-600" /> Recibos Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentPaid.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.description}</p>
                        <p className="text-xs text-gray-500">
                          {p.paid_date ? `Pago em ${formatDate(p.paid_date)}` : `Vence em ${formatDate(p.due_date)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                        {formatCurrency(p.amount)} <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                  {recentPaid.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Nenhum recibo ainda</p>
                  )}
                  <Button variant="outline" className="w-full" size="sm" onClick={() => goTo("recibos")}>
                    <Receipt className="w-4 h-4" /> Ver Todos os Recibos
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Próxima teleconsulta */}
            {nextTele && (
              <Card className="border-purple-200 bg-purple-50/40">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Sua próxima teleconsulta</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(nextTele.session_date)} às {nextTele.session_time.slice(0, 5)}
                        {nextTele.psychologists ? ` com ${nextTele.psychologists.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => { setActiveTele(nextTele); setVideoOn(true); setMicOn(true); setView("sala"); }}>
                    <ExternalLink className="w-4 h-4" /> Entrar na Sala
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Profissional responsável */}
            {patient.psychologists && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.psychologists.name}</p>
                    <p className="text-xs text-gray-500">Profissional responsável • CRP {patient.psychologists.crp}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─── AGENDAR ─── */}
        {view === "agendar" && (
          bookingConfirmed ? (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="py-10 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-base font-semibold text-gray-900">Consulta agendada com sucesso!</p>
                <p className="text-sm text-gray-600">
                  {selectedSlot && `${formatDate(selectedSlot.date)} às ${selectedSlot.time}`} •{" "}
                  {sessionType === "teleconsulta" ? "Teleconsulta" : "Presencial"}
                  {patient.psychologists ? ` • ${patient.psychologists.name}` : ""}
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => { setBookingConfirmed(false); setSelectedSlot(null); }}>
                    Agendar outra
                  </Button>
                  <Button size="sm" onClick={() => goTo("home")}>Voltar ao início</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Tipo de consulta */}
              <div className="flex gap-2">
                <Button variant={sessionType === "presencial" ? "secondary" : "outline"} size="sm" onClick={() => setSessionType("presencial")}>
                  <MapPin className="w-4 h-4" /> Presencial
                </Button>
                <Button variant={sessionType === "teleconsulta" ? "secondary" : "outline"} size="sm" onClick={() => setSessionType("teleconsulta")}>
                  <Video className="w-4 h-4" /> Teleconsulta
                </Button>
              </div>

              {!patient.psychologist_id && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Você ainda não tem um profissional vinculado. A consulta será agendada e a clínica definirá o profissional.</span>
                </div>
              )}

              {/* Dias e horários */}
              <div className="space-y-3">
                {availableDays.map((d) => (
                  <Card key={d.date}>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {d.day}, {formatDate(d.date)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {d.slots.map((h) => {
                          const selected = selectedSlot?.date === d.date && selectedSlot?.time === h;
                          return (
                            <button
                              key={h}
                              onClick={() => setSelectedSlot({ date: d.date, time: h })}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                selected
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                              }`}
                            >
                              {h}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {bookingError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              <Button className="w-full" disabled={!selectedSlot || bookingBusy} onClick={confirmBooking}>
                {bookingBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {selectedSlot
                  ? `Confirmar ${formatDate(selectedSlot.date)} às ${selectedSlot.time}`
                  : "Selecione um horário"}
              </Button>
            </div>
          )
        )}

        {/* ─── HISTÓRICO ─── */}
        {view === "historico" && (
          <div className="space-y-3">
            {sessions.length > 0 ? sessions.map((s) => {
              const st = sessionStatusMap[s.status] || sessionStatusMap.agendada;
              return (
                <Card key={s.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(s.session_date)} às {s.session_time.slice(0, 5)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.type === "teleconsulta" ? "Teleconsulta" : "Presencial"} • {s.duration}min
                        {s.psychologists ? ` • ${s.psychologists.name}` : ""}
                      </p>
                    </div>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </CardContent>
                </Card>
              );
            }) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma sessão registrada ainda</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─── RECIBOS ─── */}
        {view === "recibos" && (
          <div className="space-y-3">
            {payments.length > 0 ? payments.map((p) => {
              const st = paymentStatusMap[p.status] || paymentStatusMap.pendente;
              return (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.description}</p>
                      <p className="text-xs text-gray-500">
                        Vencimento {formatDate(p.due_date)}
                        {p.paid_date ? ` • Pago em ${formatDate(p.paid_date)}` : ""} • {methodLabel[p.method] || p.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum pagamento registrado ainda</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─── TELECONSULTA (lista) ─── */}
        {view === "teleconsulta" && (
          <div className="space-y-3">
            {teleAppts.length > 0 ? teleAppts.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(s.session_date)} às {s.session_time.slice(0, 5)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.duration}min{s.psychologists ? ` • ${s.psychologists.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => { setActiveTele(s); setVideoOn(true); setMicOn(true); setView("sala"); }}>
                    <ExternalLink className="w-4 h-4" /> Entrar na Sala
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Video className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma teleconsulta agendada</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => goTo("agendar")}>
                    <Calendar className="w-4 h-4" /> Agendar Teleconsulta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ─── SALA DE VÍDEO ─── */}
        {view === "sala" && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                {/* Área principal: profissional (aguardando) */}
                <div className="text-center z-10">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-white text-lg">
                    {activeTele?.psychologists?.name || "Profissional"}
                  </p>
                  <p className="text-gray-400 text-sm">Aguardando o profissional entrar...</p>
                </div>

                {/* Miniatura: sua webcam */}
                <div className="absolute bottom-4 right-4 w-24 h-20 sm:w-48 sm:h-36 bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden flex items-center justify-center z-10">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover -scale-x-100 ${videoOn && !camError ? "block" : "hidden"}`}
                  />
                  {videoOn && !camError ? (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Você</span>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="w-6 h-6 text-red-400 mx-auto" />
                      <p className="text-red-400 text-[10px] mt-1">{camError || "Câmera desligada"}</p>
                    </div>
                  )}
                </div>

                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1.5 rounded-full">
                  <span className="text-white text-xs">
                    {activeTele ? `${formatDate(activeTele.session_date)} às ${activeTele.session_time.slice(0, 5)}` : "Teleconsulta"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 p-4 bg-gray-900">
                <Button variant={micOn ? "secondary" : "destructive"} size="icon" className="rounded-full w-12 h-12" onClick={() => setMicOn(!micOn)}>
                  {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button variant={videoOn ? "secondary" : "destructive"} size="icon" className="rounded-full w-12 h-12" onClick={() => setVideoOn(!videoOn)}>
                  {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button variant="destructive" size="icon" className="rounded-full w-12 h-12" onClick={() => { setActiveTele(null); goTo("teleconsulta"); }}>
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-gray-400 pb-6">
          <Shield className="w-3 h-3 inline mr-1" />
          Seus dados são protegidos conforme a LGPD
        </p>
      </main>
    </div>
  );
}
