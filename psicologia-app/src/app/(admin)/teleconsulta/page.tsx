"use client";

import { useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Paperclip,
  Monitor,
  Send,
  Shield,
  Clock,
  User,
  Plus,
  Copy,
  Check,
  ArrowLeft,
  Users,
  Circle,
  X,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── TYPES ───
interface TeleRoom {
  id: string;
  patientName: string;
  professionalName: string;
  professionalRole: string;
  date: string;
  time: string;
  duration: number;
  status: "agendada" | "em_andamento" | "finalizada";
  roomLink: string;
  chatMessages: ChatMsg[];
}

interface ChatMsg {
  id: number;
  sender: "professional" | "patient";
  text: string;
  time: string;
}

// ─── MOCK ROOMS (multiple simultaneous) ───
const initialRooms: TeleRoom[] = [
  {
    id: "room-1",
    patientName: "Carlos Alberto Silva",
    professionalName: "Dra. Maria Santos",
    professionalRole: "Psicóloga",
    date: "2024-12-20",
    time: "09:00",
    duration: 50,
    status: "em_andamento",
    roomLink: "https://educadamente.app/sala/room-1-abc",
    chatMessages: [
      { id: 1, sender: "professional", text: "Bom dia Carlos! Como foi sua semana?", time: "09:01" },
      { id: 2, sender: "patient", text: "Bom dia Dra. Maria! Me senti mais tranquilo.", time: "09:02" },
    ],
  },
  {
    id: "room-2",
    patientName: "Fernanda Oliveira",
    professionalName: "Camila Rodrigues",
    professionalRole: "Nutricionista",
    date: "2024-12-20",
    time: "09:00",
    duration: 40,
    status: "em_andamento",
    roomLink: "https://educadamente.app/sala/room-2-def",
    chatMessages: [
      { id: 1, sender: "professional", text: "Oi Fernanda! Trouxe o diário alimentar?", time: "09:01" },
      { id: 2, sender: "patient", text: "Trouxe sim! Anotei tudo certinho.", time: "09:02" },
    ],
  },
  {
    id: "room-3",
    patientName: "Roberto Mendes",
    professionalName: "Fernanda Lima",
    professionalRole: "Fisioterapeuta",
    date: "2024-12-20",
    time: "09:30",
    duration: 50,
    status: "agendada",
    roomLink: "https://educadamente.app/sala/room-3-ghi",
    chatMessages: [],
  },
  {
    id: "room-4",
    patientName: "Juliana Almeida",
    professionalName: "Patrícia Alves",
    professionalRole: "Fonoaudióloga",
    date: "2024-12-20",
    time: "09:00",
    duration: 45,
    status: "em_andamento",
    roomLink: "https://educadamente.app/sala/room-4-jkl",
    chatMessages: [
      { id: 1, sender: "professional", text: "Oi Juliana, vamos praticar os exercícios de hoje?", time: "09:01" },
    ],
  },
  {
    id: "room-5",
    patientName: "Pedro Henrique Costa",
    professionalName: "Renata Souza",
    professionalRole: "Psicopedagoga",
    date: "2024-12-20",
    time: "10:00",
    duration: 50,
    status: "agendada",
    roomLink: "https://educadamente.app/sala/room-5-mno",
    chatMessages: [],
  },
  {
    id: "room-6",
    patientName: "Ana Beatriz Ramos",
    professionalName: "Dr. João Oliveira",
    professionalRole: "Psicólogo",
    date: "2024-12-20",
    time: "09:00",
    duration: 50,
    status: "em_andamento",
    roomLink: "https://educadamente.app/sala/room-6-pqr",
    chatMessages: [
      { id: 1, sender: "professional", text: "Ana, como você está se sentindo com a nova rotina?", time: "09:03" },
      { id: 2, sender: "patient", text: "Está sendo desafiador, mas sinto progresso.", time: "09:04" },
    ],
  },
  {
    id: "room-7",
    patientName: "Marcos Vinícius",
    professionalName: "Dra. Maria Santos",
    professionalRole: "Psicóloga",
    date: "2024-12-20",
    time: "10:00",
    duration: 50,
    status: "agendada",
    roomLink: "https://educadamente.app/sala/room-7-stu",
    chatMessages: [],
  },
  {
    id: "room-8",
    patientName: "Lúcia Ferreira",
    professionalName: "Camila Rodrigues",
    professionalRole: "Nutricionista",
    date: "2024-12-20",
    time: "10:00",
    duration: 30,
    status: "agendada",
    roomLink: "https://educadamente.app/sala/room-8-vwx",
    chatMessages: [],
  },
];

const roleColorMap: Record<string, string> = {
  Psicóloga: "bg-indigo-100 text-indigo-700",
  Psicólogo: "bg-indigo-100 text-indigo-700",
  Nutricionista: "bg-emerald-100 text-emerald-700",
  Fisioterapeuta: "bg-blue-100 text-blue-700",
  Fonoaudióloga: "bg-purple-100 text-purple-700",
  Psicopedagoga: "bg-pink-100 text-pink-700",
};

const roleDotMap: Record<string, string> = {
  Psicóloga: "bg-indigo-500",
  Psicólogo: "bg-indigo-500",
  Nutricionista: "bg-emerald-500",
  Fisioterapeuta: "bg-blue-500",
  Fonoaudióloga: "bg-purple-500",
  Psicopedagoga: "bg-pink-500",
};

export default function TeleconsultaPage() {
  const [rooms, setRooms] = useState<TeleRoom[]>(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>("todos");
  const [quickPatient, setQuickPatient] = useState("");
  const [quickProfessional, setQuickProfessional] = useState("");

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const liveRooms = rooms.filter((r) => r.status === "em_andamento");
  const scheduledRooms = rooms.filter((r) => r.status === "agendada");
  const allRoles = [...new Set(rooms.map((r) => r.professionalRole))];

  const filteredLive = filterRole === "todos" ? liveRooms : liveRooms.filter((r) => r.professionalRole === filterRole);
  const filteredScheduled = filterRole === "todos" ? scheduledRooms : scheduledRooms.filter((r) => r.professionalRole === filterRole);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const startRoom = (roomId: string) => {
    setRooms(rooms.map((r) => r.id === roomId ? { ...r, status: "em_andamento" as const } : r));
    setActiveRoomId(roomId);
    setVideoOn(true); setMicOn(true); setChatOpen(false); setMessage("");
  };

  const endRoom = (roomId: string) => {
    setRooms(rooms.map((r) => r.id === roomId ? { ...r, status: "finalizada" as const } : r));
    setActiveRoomId(null);
  };

  const enterRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setVideoOn(true); setMicOn(true); setChatOpen(false); setMessage("");
  };

  const sendMessage = () => {
    if (!message.trim() || !activeRoomId) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setRooms(rooms.map((r) =>
      r.id === activeRoomId
        ? { ...r, chatMessages: [...r.chatMessages, { id: Date.now(), sender: "professional", text: message, time: timeStr }] }
        : r
    ));
    setMessage("");
  };

  const createQuickRoom = () => {
    if (!quickPatient || !quickProfessional) return;
    const profInfo: Record<string, string> = {
      "Dra. Maria Santos": "Psicóloga",
      "Dr. João Oliveira": "Psicólogo",
      "Camila Rodrigues": "Nutricionista",
      "Fernanda Lima": "Fisioterapeuta",
      "Patrícia Alves": "Fonoaudióloga",
      "Renata Souza": "Psicopedagoga",
    };
    const newRoom: TeleRoom = {
      id: `room-${Date.now()}`,
      patientName: quickPatient,
      professionalName: quickProfessional,
      professionalRole: profInfo[quickProfessional] || "Profissional",
      date: new Date().toISOString().split("T")[0],
      time: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
      duration: 50,
      status: "em_andamento",
      roomLink: `https://educadamente.app/sala/${Date.now().toString(36)}`,
      chatMessages: [],
    };
    setRooms([newRoom, ...rooms]);
    setActiveRoomId(newRoom.id);
    setQuickPatient(""); setQuickProfessional("");
    setVideoOn(true); setMicOn(true); setChatOpen(false);
  };

  // ─── INSIDE A ROOM ───
  if (activeRoomId && activeRoom) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setActiveRoomId(null)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar às Salas
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={roleColorMap[activeRoom.professionalRole] || "bg-gray-100 text-gray-700"}>
              {activeRoom.professionalRole}
            </Badge>
            <Badge variant="success" className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Criptografada
            </Badge>
            {liveRooms.length > 1 && (
              <Badge variant="default" className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {liveRooms.length} salas ativas
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className={chatOpen ? "lg:col-span-3" : "lg:col-span-4"}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-white text-lg">{activeRoom.patientName}</p>
                    <p className="text-gray-400 text-sm">
                      Profissional: {activeRoom.professionalName} ({activeRoom.professionalRole})
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {activeRoom.status === "em_andamento" ? "Conectado" : "Aguardando"} • Sala {activeRoom.id.replace("room-", "#")}
                    </p>
                  </div>

                  <div className="absolute bottom-4 right-4 w-24 h-20 sm:w-48 sm:h-36 bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                    <div className="text-center">
                      {videoOn ? (
                        <>
                          <User className="w-8 h-8 text-gray-500 mx-auto" />
                          <p className="text-gray-400 text-xs mt-1">Você</p>
                        </>
                      ) : (
                        <>
                          <VideoOff className="w-8 h-8 text-red-400 mx-auto" />
                          <p className="text-red-400 text-xs mt-1">Câmera desligada</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 bg-black/50 px-3 py-1.5 rounded-full">
                    <span className="text-white text-sm font-mono flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      AO VIVO
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-full">
                    <span className="text-white text-xs">{activeRoom.professionalRole} • {activeRoom.duration}min</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-900 flex-wrap">
                  <Button variant={micOn ? "secondary" : "destructive"} size="icon" className="rounded-full w-12 h-12" onClick={() => setMicOn(!micOn)}>
                    {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button variant={videoOn ? "secondary" : "destructive"} size="icon" className="rounded-full w-12 h-12" onClick={() => setVideoOn(!videoOn)}>
                    {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                    <Monitor className="w-5 h-5" />
                  </Button>
                  <Button variant={chatOpen ? "default" : "secondary"} size="icon" className="rounded-full w-12 h-12" onClick={() => setChatOpen(!chatOpen)}>
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button variant="destructive" size="icon" className="rounded-full w-12 h-12" onClick={() => endRoom(activeRoomId)}>
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Chat da Sessão</CardTitle>
                    <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto mb-4 min-h-[300px]">
                    {activeRoom.chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "professional" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${msg.sender === "professional" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === "professional" ? "text-indigo-200" : "text-gray-400"}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                    {activeRoom.chatMessages.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-8">Nenhuma mensagem ainda</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma mensagem..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="text-sm"
                    />
                    <Button size="icon" onClick={sendMessage}>
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

  // ─── LOBBY: ALL ROOMS ───
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Teleconsulta</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Salas virtuais simultâneas para todos os profissionais</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="flex items-center gap-1 text-xs">
            <Shield className="w-3 h-3" /> Criptografada
          </Badge>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Circle className="w-5 h-5 text-green-600 fill-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{liveRooms.length}</p>
              <p className="text-xs text-gray-500">Salas Ativas Agora</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{scheduledRooms.length}</p>
              <p className="text-xs text-gray-500">Agendadas Hoje</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{new Set(rooms.map(r => r.professionalName)).size}</p>
              <p className="text-xs text-gray-500">Profissionais</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              <p className="text-xs text-gray-500">Total de Salas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter by role */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">Filtrar:</span>
        <Button variant={filterRole === "todos" ? "secondary" : "outline"} size="sm" onClick={() => setFilterRole("todos")}>
          Todos
        </Button>
        {allRoles.map((role) => (
          <Button key={role} variant={filterRole === role ? "secondary" : "outline"} size="sm" onClick={() => setFilterRole(role)}>
            <div className={`w-2 h-2 rounded-full mr-1.5 ${roleDotMap[role] || "bg-gray-400"}`} />
            {role}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live rooms */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active rooms */}
          {filteredLive.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                Salas em Andamento ({filteredLive.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredLive.map((room) => (
                  <Card key={room.id} className="border-green-200 bg-green-50/30 hover:border-green-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs font-medium text-green-700">AO VIVO</span>
                        </div>
                        <Badge className={`text-xs ${roleColorMap[room.professionalRole] || "bg-gray-100 text-gray-700"}`}>
                          {room.professionalRole}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900">{room.patientName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3" /> {room.professionalName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {room.time} • {room.duration}min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="flex-1" onClick={() => enterRoom(room.id)}>
                          <Video className="w-3.5 h-3.5" /> Entrar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyLink(room.roomLink)}>
                          {copiedLink === room.roomLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled rooms */}
          {filteredScheduled.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Agendadas ({filteredScheduled.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredScheduled.map((room) => (
                  <Card key={room.id} className="hover:border-gray-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="text-xs">Agendada</Badge>
                        <Badge className={`text-xs ${roleColorMap[room.professionalRole] || "bg-gray-100 text-gray-700"}`}>
                          {room.professionalRole}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900">{room.patientName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3" /> {room.professionalName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {room.time} • {room.duration}min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="flex-1" onClick={() => startRoom(room.id)}>
                          <Video className="w-3.5 h-3.5" /> Iniciar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => copyLink(room.roomLink)}>
                          {copiedLink === room.roomLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredLive.length === 0 && filteredScheduled.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma teleconsulta encontrada para este filtro</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick start sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Criar Sala Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-500">
                Crie uma sala instantânea. Cada profissional tem sua própria sala independente.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Profissional</label>
                <select
                  value={quickProfessional}
                  onChange={(e) => setQuickProfessional(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm"
                >
                  <option value="">Selecione</option>
                  <option value="Dra. Maria Santos">Dra. Maria Santos (Psicóloga)</option>
                  <option value="Dr. João Oliveira">Dr. João Oliveira (Psicólogo)</option>
                  <option value="Camila Rodrigues">Camila Rodrigues (Nutricionista)</option>
                  <option value="Fernanda Lima">Fernanda Lima (Fisioterapeuta)</option>
                  <option value="Patrícia Alves">Patrícia Alves (Fonoaudióloga)</option>
                  <option value="Renata Souza">Renata Souza (Psicopedagoga)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Paciente</label>
                <Input
                  value={quickPatient}
                  onChange={(e) => setQuickPatient(e.target.value)}
                  placeholder="Nome do paciente"
                  className="h-9 text-sm"
                />
              </div>
              <Button className="w-full" size="sm" onClick={createQuickRoom} disabled={!quickPatient || !quickProfessional}>
                <Video className="w-4 h-4" /> Criar Sala e Iniciar
              </Button>
            </CardContent>
          </Card>

          {/* Live summary */}
          {liveRooms.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700">Resumo ao Vivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {liveRooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${roleDotMap[room.professionalRole] || "bg-gray-400"}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{room.professionalName.split(" ").slice(0, 2).join(" ")}</p>
                        <p className="text-[10px] text-gray-400">{room.patientName.split(" ")[0]}</p>
                      </div>
                    </div>
                    <button onClick={() => enterRoom(room.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      Entrar
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
