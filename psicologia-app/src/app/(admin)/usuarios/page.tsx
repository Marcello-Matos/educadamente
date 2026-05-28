"use client";

import { useState } from "react";
import {
  UserCog,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  User,
  Mail,
  Phone,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Crown,
  Users,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── TYPES ───
interface Permission {
  id: string;
  label: string;
  description: string;
}

interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

interface Profile {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isSystem: boolean;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileId: string;
  status: "ativo" | "inativo";
  createdAt: string;
  lastAccess: string;
}

// ─── ALL PERMISSIONS ───
const allPermissionGroups: PermissionGroup[] = [
  {
    group: "Dashboard",
    permissions: [
      { id: "dashboard.view", label: "Visualizar Dashboard", description: "Ver tela principal com métricas e KPIs" },
      { id: "dashboard.stats", label: "Ver Estatísticas", description: "Ver total de pacientes, sessões do mês, faturamento" },
      { id: "dashboard.charts", label: "Ver Gráficos", description: "Ver gráficos de faturamento mensal e sessões por tipo" },
      { id: "dashboard.upcoming", label: "Ver Próximas Sessões", description: "Ver lista de sessões agendadas no dashboard" },
      { id: "dashboard.overdue", label: "Ver Pagamentos em Atraso", description: "Ver lista de pagamentos pendentes" },
      { id: "dashboard.export", label: "Exportar Relatórios", description: "Exportar dados e relatórios do dashboard" },
    ],
  },
  {
    group: "Pacientes",
    permissions: [
      { id: "patients.view", label: "Visualizar Pacientes", description: "Ver lista e tabela de pacientes" },
      { id: "patients.search", label: "Buscar Pacientes", description: "Usar busca e filtros de pacientes" },
      { id: "patients.create", label: "Cadastrar Pacientes", description: "Criar novos pacientes no sistema" },
      { id: "patients.edit", label: "Editar Pacientes", description: "Alterar dados pessoais de pacientes" },
      { id: "patients.delete", label: "Excluir Pacientes", description: "Remover pacientes do sistema" },
      { id: "patients.history", label: "Ver Histórico Clínico", description: "Acessar histórico clínico do paciente" },
      { id: "patients.anamnesis", label: "Ver/Editar Anamnese", description: "Visualizar e editar anamnese do paciente" },
      { id: "patients.documents", label: "Upload de Documentos", description: "Enviar e gerenciar documentos do paciente" },
      { id: "patients.notes", label: "Observações Privadas", description: "Ver e criar notas privadas sobre pacientes" },
      { id: "patients.contacts", label: "Ver Contatos", description: "Acessar telefone, email e endereço do paciente" },
    ],
  },
  {
    group: "Agenda",
    permissions: [
      { id: "schedule.view", label: "Visualizar Agenda", description: "Ver calendário e lista de agendamentos" },
      { id: "schedule.create", label: "Criar Agendamentos", description: "Agendar novas sessões e consultas" },
      { id: "schedule.edit", label: "Editar Agendamentos", description: "Alterar data, hora e detalhes de agendamentos" },
      { id: "schedule.cancel", label: "Cancelar Agendamentos", description: "Cancelar sessões agendadas" },
      { id: "schedule.reschedule", label: "Reagendar Sessões", description: "Remarcar sessões para outro horário" },
      { id: "schedule.absence", label: "Controle de Faltas", description: "Registrar e gerenciar faltas de pacientes" },
      { id: "schedule.reminders", label: "Enviar Lembretes", description: "Enviar lembretes por WhatsApp e email" },
      { id: "schedule.calendar_self", label: "Ver Calendário Próprio", description: "Visualizar apenas sua própria agenda" },
      { id: "schedule.calendar_all", label: "Ver Calendários de Todos", description: "Visualizar agenda de todos os profissionais" },
      { id: "schedule.online_booking", label: "Agendamento Online", description: "Permitir agendamento online pelo portal" },
    ],
  },
  {
    group: "Financeiro",
    permissions: [
      { id: "finance.view", label: "Visualizar Financeiro", description: "Ver tela financeira e resumo" },
      { id: "finance.stats", label: "Ver Estatísticas Financeiras", description: "Ver receita, despesas e saldo" },
      { id: "finance.charts", label: "Ver Gráficos Financeiros", description: "Ver gráfico de receita vs despesas" },
      { id: "finance.create", label: "Registrar Pagamentos", description: "Registrar novos pagamentos recebidos" },
      { id: "finance.edit", label: "Editar Pagamentos", description: "Alterar dados de pagamentos" },
      { id: "finance.delete", label: "Excluir Pagamentos", description: "Remover registros de pagamento" },
      { id: "finance.receipts", label: "Emitir Recibos", description: "Gerar e imprimir recibos de pagamento" },
      { id: "finance.download_receipts", label: "Baixar Recibos", description: "Download de recibos em PDF/TXT" },
      { id: "finance.reports", label: "Relatórios Financeiros", description: "Acessar relatórios financeiros detalhados" },
      { id: "finance.overdue", label: "Controle de Inadimplência", description: "Ver e gerenciar pagamentos em atraso" },
      { id: "finance.pix", label: "Pagamentos via PIX", description: "Registrar pagamentos por PIX" },
      { id: "finance.card", label: "Pagamentos via Cartão", description: "Registrar pagamentos por cartão" },
      { id: "finance.boleto", label: "Pagamentos via Boleto", description: "Registrar pagamentos por boleto" },
      { id: "finance.plans", label: "Planos Mensais/Anuais", description: "Gerenciar planos de pagamento de pacientes" },
    ],
  },
  {
    group: "Prontuários (Registros Clínicos)",
    permissions: [
      { id: "records.view", label: "Visualizar Prontuários", description: "Ver prontuários e registros de pacientes" },
      { id: "records.create", label: "Criar Evoluções", description: "Registrar evoluções e anotações de sessão" },
      { id: "records.edit", label: "Editar Prontuários", description: "Alterar registros e evoluções existentes" },
      { id: "records.delete", label: "Excluir Registros", description: "Remover evoluções do prontuário" },
      { id: "records.anamnesis", label: "Anamnese Digital", description: "Criar e editar formulário de anamnese" },
      { id: "records.diagnostics", label: "CID / Diagnósticos", description: "Registrar e visualizar diagnósticos CID" },
      { id: "records.sign", label: "Assinatura Digital", description: "Assinar digitalmente documentos clínicos" },
      { id: "records.history", label: "Histórico Completo", description: "Acessar histórico protegido de todas as sessões" },
      { id: "records.evolution", label: "Evolução Terapêutica", description: "Registrar evolução detalhada do paciente" },
      { id: "records.private_notes", label: "Notas Privadas", description: "Notas visíveis apenas pelo profissional autor" },
      { id: "records.export", label: "Exportar Prontuário", description: "Exportar prontuário completo do paciente" },
    ],
  },
  {
    group: "Teleconsulta",
    permissions: [
      { id: "tele.view", label: "Visualizar Teleconsultas", description: "Ver lista de teleconsultas agendadas" },
      { id: "tele.create", label: "Agendar Teleconsulta", description: "Criar novas teleconsultas" },
      { id: "tele.start", label: "Iniciar Teleconsulta", description: "Entrar e iniciar sala de videochamada" },
      { id: "tele.video", label: "Usar Câmera", description: "Ligar/desligar câmera na teleconsulta" },
      { id: "tele.audio", label: "Usar Microfone", description: "Ligar/desligar microfone na teleconsulta" },
      { id: "tele.screen", label: "Compartilhar Tela", description: "Compartilhar tela durante a sessão" },
      { id: "tele.chat", label: "Chat na Sessão", description: "Enviar mensagens no chat da teleconsulta" },
      { id: "tele.files", label: "Compartilhar Arquivos", description: "Enviar e receber arquivos durante a sessão" },
      { id: "tele.record", label: "Gravar Sessão", description: "Gravar teleconsulta (com consentimento)" },
    ],
  },
  {
    group: "Portal do Paciente",
    permissions: [
      { id: "portal.view", label: "Visualizar Portal", description: "Acessar a tela do portal do paciente" },
      { id: "portal.manage", label: "Gerenciar Portal", description: "Configurar funcionalidades do portal" },
      { id: "portal.booking", label: "Agendamento pelo Portal", description: "Permitir que pacientes agendem consultas" },
      { id: "portal.history", label: "Histórico no Portal", description: "Pacientes verem seu histórico de sessões" },
      { id: "portal.receipts", label: "Recibos no Portal", description: "Pacientes baixarem seus recibos" },
      { id: "portal.teleconsult", label: "Teleconsulta no Portal", description: "Pacientes acessarem teleconsulta" },
    ],
  },
  {
    group: "Usuários",
    permissions: [
      { id: "users.view", label: "Visualizar Usuários", description: "Ver lista de todos os usuários do sistema" },
      { id: "users.create", label: "Criar Usuários", description: "Cadastrar novos usuários no sistema" },
      { id: "users.edit", label: "Editar Usuários", description: "Alterar dados e perfis de usuários" },
      { id: "users.delete", label: "Excluir Usuários", description: "Remover usuários do sistema" },
      { id: "users.activate", label: "Ativar/Desativar Usuários", description: "Mudar status de ativo/inativo" },
      { id: "users.profiles", label: "Gerenciar Perfis de Acesso", description: "Criar, editar e excluir perfis" },
      { id: "users.permissions", label: "Gerenciar Permissões", description: "Definir permissões por perfil" },
      { id: "users.reset_password", label: "Resetar Senhas", description: "Redefinir senha de outros usuários" },
      { id: "users.view_logs", label: "Ver Logs de Acesso", description: "Visualizar histórico de acessos dos usuários" },
    ],
  },
  {
    group: "Configurações do Sistema",
    permissions: [
      { id: "config.general", label: "Configurações Gerais", description: "Alterar nome, logo e dados da clínica" },
      { id: "config.lgpd", label: "Configurações LGPD", description: "Gerenciar consentimento e privacidade" },
      { id: "config.lgpd_consent", label: "Consentimento de Pacientes", description: "Ativar/desativar termos de consentimento" },
      { id: "config.lgpd_anonymize", label: "Anonimizar Dados", description: "Direito ao esquecimento (anonimização)" },
      { id: "config.lgpd_export", label: "Exportar Dados (LGPD)", description: "Exportar dados pessoais do paciente" },
      { id: "config.lgpd_logs", label: "Logs de Acesso LGPD", description: "Ver registros de acesso a dados sensíveis" },
      { id: "config.notifications", label: "Configurar Notificações", description: "Email, WhatsApp e lembretes automáticos" },
      { id: "config.whatsapp", label: "Integração WhatsApp", description: "Configurar envio de mensagens WhatsApp" },
      { id: "config.email", label: "Integração Email", description: "Configurar envio de emails automáticos" },
      { id: "config.team", label: "Gerenciar Equipe", description: "Adicionar/remover psicólogos e secretárias" },
      { id: "config.security", label: "Segurança", description: "2FA, políticas de senha, timeout de sessão" },
      { id: "config.backup", label: "Backup do Sistema", description: "Configurar e executar backups" },
      { id: "config.theme", label: "Personalizar Aparência", description: "Alterar cores e tema do sistema" },
    ],
  },
];

const allPermissionIds = allPermissionGroups.flatMap((g) => g.permissions.map((p) => p.id));

// ─── INITIAL DATA ───
const initialProfiles: Profile[] = [
  {
    id: "profile-master",
    name: "Master",
    description: "Acesso total ao sistema. Controle absoluto.",
    color: "red",
    permissions: [...allPermissionIds],
    isSystem: true,
  },
  {
    id: "profile-psicologo",
    name: "Psicólogo(a)",
    description: "Atendimento psicológico clínico completo.",
    color: "indigo",
    permissions: [
      "dashboard.view", "dashboard.stats", "dashboard.charts", "dashboard.upcoming", "dashboard.overdue",
      "patients.view", "patients.search", "patients.create", "patients.edit", "patients.history", "patients.anamnesis", "patients.documents", "patients.notes", "patients.contacts",
      "schedule.view", "schedule.create", "schedule.edit", "schedule.cancel", "schedule.reschedule", "schedule.absence", "schedule.reminders", "schedule.calendar_self",
      "finance.view", "finance.stats", "finance.receipts", "finance.download_receipts",
      "records.view", "records.create", "records.edit", "records.anamnesis", "records.diagnostics", "records.sign", "records.history", "records.evolution", "records.private_notes", "records.export",
      "tele.view", "tele.create", "tele.start", "tele.video", "tele.audio", "tele.screen", "tele.chat", "tele.files",
      "portal.view",
    ],
    isSystem: false,
  },
  {
    id: "profile-nutricionista",
    name: "Nutricionista",
    description: "Atendimento nutricional e acompanhamento alimentar.",
    color: "emerald",
    permissions: [
      "dashboard.view", "dashboard.stats", "dashboard.charts", "dashboard.upcoming",
      "patients.view", "patients.search", "patients.create", "patients.edit", "patients.history", "patients.anamnesis", "patients.documents", "patients.notes", "patients.contacts",
      "schedule.view", "schedule.create", "schedule.edit", "schedule.cancel", "schedule.reschedule", "schedule.reminders", "schedule.calendar_self",
      "finance.view", "finance.stats", "finance.receipts", "finance.download_receipts",
      "records.view", "records.create", "records.edit", "records.anamnesis", "records.diagnostics", "records.sign", "records.history", "records.evolution", "records.private_notes", "records.export",
      "tele.view", "tele.create", "tele.start", "tele.video", "tele.audio", "tele.screen", "tele.chat", "tele.files",
      "portal.view",
    ],
    isSystem: false,
  },
  {
    id: "profile-fisioterapeuta",
    name: "Fisioterapeuta",
    description: "Atendimento fisioterapêutico e reabilitação.",
    color: "blue",
    permissions: [
      "dashboard.view", "dashboard.stats", "dashboard.charts", "dashboard.upcoming",
      "patients.view", "patients.search", "patients.create", "patients.edit", "patients.history", "patients.anamnesis", "patients.documents", "patients.notes", "patients.contacts",
      "schedule.view", "schedule.create", "schedule.edit", "schedule.cancel", "schedule.reschedule", "schedule.reminders", "schedule.calendar_self",
      "finance.view", "finance.stats", "finance.receipts", "finance.download_receipts",
      "records.view", "records.create", "records.edit", "records.anamnesis", "records.diagnostics", "records.sign", "records.history", "records.evolution", "records.private_notes", "records.export",
      "tele.view", "tele.create", "tele.start", "tele.video", "tele.audio", "tele.screen", "tele.chat", "tele.files",
      "portal.view",
    ],
    isSystem: false,
  },
  {
    id: "profile-fonoaudiologa",
    name: "Fonoaudióloga",
    description: "Atendimento fonoaudiológico e terapia da fala.",
    color: "purple",
    permissions: [
      "dashboard.view", "dashboard.stats", "dashboard.charts", "dashboard.upcoming",
      "patients.view", "patients.search", "patients.create", "patients.edit", "patients.history", "patients.anamnesis", "patients.documents", "patients.notes", "patients.contacts",
      "schedule.view", "schedule.create", "schedule.edit", "schedule.cancel", "schedule.reschedule", "schedule.reminders", "schedule.calendar_self",
      "finance.view", "finance.stats", "finance.receipts", "finance.download_receipts",
      "records.view", "records.create", "records.edit", "records.anamnesis", "records.diagnostics", "records.sign", "records.history", "records.evolution", "records.private_notes", "records.export",
      "tele.view", "tele.create", "tele.start", "tele.video", "tele.audio", "tele.screen", "tele.chat", "tele.files",
      "portal.view",
    ],
    isSystem: false,
  },
  {
    id: "profile-psicopedagoga",
    name: "Psicopedagoga",
    description: "Atendimento psicopedagógico e apoio à aprendizagem.",
    color: "pink",
    permissions: [
      "dashboard.view", "dashboard.stats", "dashboard.charts", "dashboard.upcoming",
      "patients.view", "patients.search", "patients.create", "patients.edit", "patients.history", "patients.anamnesis", "patients.documents", "patients.notes", "patients.contacts",
      "schedule.view", "schedule.create", "schedule.edit", "schedule.cancel", "schedule.reschedule", "schedule.reminders", "schedule.calendar_self",
      "finance.view", "finance.stats", "finance.receipts", "finance.download_receipts",
      "records.view", "records.create", "records.edit", "records.anamnesis", "records.diagnostics", "records.sign", "records.history", "records.evolution", "records.private_notes", "records.export",
      "tele.view", "tele.create", "tele.start", "tele.video", "tele.audio", "tele.screen", "tele.chat", "tele.files",
      "portal.view",
    ],
    isSystem: false,
  },
];

const initialUsers: SystemUser[] = [
  {
    id: "user-1",
    name: "Dra. Maria Santos",
    email: "maria@clinica.com",
    phone: "(11) 99999-0001",
    role: "Psicóloga - CRP 06/123456",
    profileId: "profile-master",
    status: "ativo",
    createdAt: "01/01/2024",
    lastAccess: "26/05/2025 às 17:30",
  },
  {
    id: "user-2",
    name: "Dr. João Oliveira",
    email: "joao@clinica.com",
    phone: "(11) 99999-0002",
    role: "Psicólogo - CRP 06/654321",
    profileId: "profile-psicologo",
    status: "ativo",
    createdAt: "15/03/2024",
    lastAccess: "26/05/2025 às 16:00",
  },
  {
    id: "user-3",
    name: "Camila Rodrigues",
    email: "camila@clinica.com",
    phone: "(11) 99999-0003",
    role: "Nutricionista - CRN 03/45678",
    profileId: "profile-nutricionista",
    status: "ativo",
    createdAt: "01/06/2024",
    lastAccess: "26/05/2025 às 17:25",
  },
  {
    id: "user-4",
    name: "Fernanda Lima",
    email: "fernanda@clinica.com",
    phone: "(11) 99999-0004",
    role: "Fisioterapeuta - CREFITO 12345",
    profileId: "profile-fisioterapeuta",
    status: "ativo",
    createdAt: "10/08/2024",
    lastAccess: "26/05/2025 às 14:00",
  },
  {
    id: "user-5",
    name: "Patrícia Alves",
    email: "patricia@clinica.com",
    phone: "(11) 99999-0005",
    role: "Fonoaudióloga - CRFa 2-9876",
    profileId: "profile-fonoaudiologa",
    status: "ativo",
    createdAt: "15/09/2024",
    lastAccess: "26/05/2025 às 15:30",
  },
  {
    id: "user-6",
    name: "Renata Souza",
    email: "renata@clinica.com",
    phone: "(11) 99999-0006",
    role: "Psicopedagoga",
    profileId: "profile-psicopedagoga",
    status: "ativo",
    createdAt: "01/10/2024",
    lastAccess: "26/05/2025 às 16:45",
  },
];

type PageView = "users" | "profiles";
type ModalType = null | "create-user" | "edit-user" | "create-profile" | "edit-profile" | "view-user" | "delete-confirm";

export default function UsuariosPage() {
  const [pageView, setPageView] = useState<PageView>("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "user" | "profile"; id: string } | null>(null);

  // ─── Form states ───
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formProfileId, setFormProfileId] = useState("");
  const [formStatus, setFormStatus] = useState<"ativo" | "inativo">("ativo");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formUserPerms, setFormUserPerms] = useState<string[]>([]);
  const [userExpandedGroups, setUserExpandedGroups] = useState<string[]>([]);
  const [showUserPerms, setShowUserPerms] = useState(false);

  // ─── Profile form states ───
  const [profileName, setProfileName] = useState("");
  const [profileDesc, setProfileDesc] = useState("");
  const [profileColor, setProfileColor] = useState("indigo");
  const [profilePerms, setProfilePerms] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const getProfile = (profileId: string) => profiles.find((p) => p.id === profileId);

  const profileColorMap: Record<string, string> = {
    red: "bg-red-100 text-red-700 border-red-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  };

  const profileDotMap: Record<string, string> = {
    red: "bg-red-500",
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    pink: "bg-pink-500",
    cyan: "bg-cyan-500",
  };

  // ─── RESET FORMS ───
  const resetUserForm = () => {
    setFormName(""); setFormEmail(""); setFormPhone("");
    setFormRole(""); setFormProfileId(""); setFormStatus("ativo");
    setFormPassword(""); setShowPassword(false);
    setFormUserPerms([]); setUserExpandedGroups([]); setShowUserPerms(false);
  };

  const resetProfileForm = () => {
    setProfileName(""); setProfileDesc(""); setProfileColor("indigo");
    setProfilePerms([]); setExpandedGroups([]);
  };

  // ─── OPEN CREATE USER ───
  const openCreateUser = () => {
    resetUserForm();
    setSelectedUserId(null);
    setModal("create-user");
  };

  // ─── OPEN EDIT USER ───
  const openEditUser = (u: SystemUser) => {
    setSelectedUserId(u.id);
    setFormName(u.name); setFormEmail(u.email); setFormPhone(u.phone);
    setFormRole(u.role); setFormProfileId(u.profileId); setFormStatus(u.status);
    setFormPassword(""); setShowPassword(false);
    const prof = profiles.find(p => p.id === u.profileId);
    setFormUserPerms(prof ? [...prof.permissions] : []);
    setUserExpandedGroups([]); setShowUserPerms(false);
    setModal("edit-user");
  };

  // ─── SAVE USER ───
  const saveUser = () => {
    if (!formName || !formEmail || !formRole || !formProfileId) return;
    if (modal === "create-user") {
      const newUser: SystemUser = {
        id: `user-${Date.now()}`,
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        profileId: formProfileId,
        status: formStatus,
        createdAt: new Date().toLocaleDateString("pt-BR"),
        lastAccess: "Nunca",
      };
      setUsers([...users, newUser]);
    } else if (modal === "edit-user" && selectedUserId) {
      setUsers(users.map((u) =>
        u.id === selectedUserId
          ? { ...u, name: formName, email: formEmail, phone: formPhone, role: formRole, profileId: formProfileId, status: formStatus }
          : u
      ));
    }
    setModal(null);
    resetUserForm();
  };

  // ─── OPEN CREATE PROFILE ───
  const openCreateProfile = () => {
    resetProfileForm();
    setSelectedProfileId(null);
    setModal("create-profile");
  };

  // ─── OPEN EDIT PROFILE ───
  const openEditProfile = (p: Profile) => {
    setSelectedProfileId(p.id);
    setProfileName(p.name); setProfileDesc(p.description);
    setProfileColor(p.color); setProfilePerms([...p.permissions]);
    setExpandedGroups([]);
    setModal("edit-profile");
  };

  // ─── SAVE PROFILE ───
  const saveProfile = () => {
    if (!profileName) return;
    if (modal === "create-profile") {
      const newProfile: Profile = {
        id: `profile-${Date.now()}`,
        name: profileName,
        description: profileDesc,
        color: profileColor,
        permissions: profilePerms,
        isSystem: false,
      };
      setProfiles([...profiles, newProfile]);
    } else if (modal === "edit-profile" && selectedProfileId) {
      setProfiles(profiles.map((p) =>
        p.id === selectedProfileId
          ? { ...p, name: profileName, description: profileDesc, color: profileColor, permissions: profilePerms }
          : p
      ));
    }
    setModal(null);
    resetProfileForm();
  };

  // ─── DELETE ───
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "user") {
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
    } else {
      setProfiles(profiles.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
    setModal(null);
  };

  // ─── TOGGLE PERM ───
  const togglePerm = (permId: string) => {
    setProfilePerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroupAll = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => profilePerms.includes(id));
    if (allSelected) {
      setProfilePerms(profilePerms.filter((p) => !groupIds.includes(p)));
    } else {
      setProfilePerms([...new Set([...profilePerms, ...groupIds])]);
    }
  };

  const toggleExpandGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
    );
  };

  // ─── USER-LEVEL PERM HELPERS ───
  const toggleUserPerm = (permId: string) => {
    setFormUserPerms((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleUserGroupAll = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => formUserPerms.includes(id));
    if (allSelected) {
      setFormUserPerms(formUserPerms.filter((p) => !groupIds.includes(p)));
    } else {
      setFormUserPerms([...new Set([...formUserPerms, ...groupIds])]);
    }
  };

  const toggleUserExpandGroup = (groupName: string) => {
    setUserExpandedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── MODALS ───
  const renderModal = () => {
    // ─── DELETE CONFIRM ───
    if (modal === "delete-confirm" && deleteTarget) {
      const targetName = deleteTarget.type === "user"
        ? users.find((u) => u.id === deleteTarget.id)?.name
        : profiles.find((p) => p.id === deleteTarget.id)?.name;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setModal(null); setDeleteTarget(null); }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-500 mb-6">
                Tem certeza que deseja excluir <span className="font-semibold text-gray-700">{targetName}</span>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setModal(null); setDeleteTarget(null); }}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ─── CREATE/EDIT USER ───
    if (modal === "create-user" || modal === "edit-user") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modal === "create-user" ? "Novo Usuário" : "Editar Usuário"}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nome completo" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@clinica.com" className="pl-10" type="email" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(00) 00000-0000" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cargo / Função *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={formRole} onChange={(e) => setFormRole(e.target.value)} placeholder="Ex: Nutricionista, Psicóloga - CRP ..." className="pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Perfil de Acesso *</label>
                <select
                  value={formProfileId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setFormProfileId(pid);
                    const prof = profiles.find(p => p.id === pid);
                    if (prof) setFormUserPerms([...prof.permissions]);
                    else setFormUserPerms([]);
                  }}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um perfil</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {formProfileId && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getProfile(formProfileId)?.description}
                  </p>
                )}
              </div>
              {modal === "create-user" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha Inicial *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 flex items-center gap-1"
                    onClick={() => {
                      const pwd = Math.random().toString(36).slice(-10) + "A1!";
                      setFormPassword(pwd);
                      setShowPassword(true);
                    }}
                  >
                    <Copy className="w-3 h-3" /> Gerar senha automática
                  </button>
                </div>
              )}
              {/* ─── PERMISSIONS SECTION ─── */}
              {formProfileId && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowUserPerms(!showUserPerms)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-900">Permissões do Usuário</span>
                      <span className="text-xs text-gray-500">({formUserPerms.length}/{allPermissionIds.length})</span>
                    </div>
                    {showUserPerms ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>

                  {showUserPerms && (
                    <div>
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Personalize as permissões deste usuário</p>
                        <div className="flex gap-2">
                          <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium" onClick={() => setFormUserPerms([...allPermissionIds])}>
                            Todas
                          </button>
                          <span className="text-gray-300">|</span>
                          <button type="button" className="text-xs text-gray-500 hover:text-gray-700 font-medium" onClick={() => setFormUserPerms([])}>
                            Nenhuma
                          </button>
                          <span className="text-gray-300">|</span>
                          <button type="button" className="text-xs text-amber-600 hover:text-amber-700 font-medium" onClick={() => {
                            const prof = profiles.find(p => p.id === formProfileId);
                            if (prof) setFormUserPerms([...prof.permissions]);
                          }}>
                            Resetar Perfil
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {allPermissionGroups.map((group) => {
                          const isExpanded = userExpandedGroups.includes(group.group);
                          const groupIds = group.permissions.map((p) => p.id);
                          const selectedCount = groupIds.filter((id) => formUserPerms.includes(id)).length;
                          const allInGroup = selectedCount === groupIds.length;
                          const noneInGroup = selectedCount === 0;

                          return (
                            <div key={group.group}>
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                                onClick={() => toggleUserExpandGroup(group.group)}
                              >
                                <div className="flex items-center gap-3">
                                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                  <span className="text-sm font-medium text-gray-900">{group.group}</span>
                                  {noneInGroup && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Bloqueado</span>}
                                  {allInGroup && <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">Total</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium ${noneInGroup ? "text-red-500" : selectedCount === groupIds.length ? "text-emerald-600" : "text-amber-600"}`}>
                                    {selectedCount}/{groupIds.length}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleUserGroupAll(group); }}
                                    className={`text-xs px-2 py-0.5 rounded ${allInGroup ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                  >
                                    {allInGroup ? "Desmarcar" : "Todas"}
                                  </button>
                                </div>
                              </button>
                              {isExpanded && (
                                <div className="px-4 pb-3 space-y-0.5">
                                  {group.permissions.map((perm) => (
                                    <label key={perm.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={formUserPerms.includes(perm.id)}
                                        onChange={() => toggleUserPerm(perm.id)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900">{perm.label}</p>
                                        <p className="text-xs text-gray-500">{perm.description}</p>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <button
                  type="button"
                  onClick={() => setFormStatus(formStatus === "ativo" ? "inativo" : "ativo")}
                  className="flex items-center gap-2"
                >
                  {formStatus === "ativo" ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${formStatus === "ativo" ? "text-emerald-600" : "text-gray-500"}`}>
                    {formStatus === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={saveUser} disabled={!formName || !formEmail || !formRole || !formProfileId}>
                <Check className="w-4 h-4" />
                {modal === "create-user" ? "Criar Usuário" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // ─── CREATE/EDIT PROFILE ───
    if (modal === "create-profile" || modal === "edit-profile") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modal === "create-profile" ? "Novo Perfil de Acesso" : "Editar Perfil"}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Perfil *</label>
                  <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Ex: Nutricionista" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(profileColorMap).map((color) => (
                      <button
                        key={color}
                        onClick={() => setProfileColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                          profileColor === color ? "border-gray-900 scale-110" : "border-transparent"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md ${profileDotMap[color]}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <Input value={profileDesc} onChange={(e) => setProfileDesc(e.target.value)} placeholder="Breve descrição do perfil" />
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">Permissões ({profilePerms.length}/{allPermissionIds.length})</label>
                  <div className="flex gap-2">
                    <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium" onClick={() => setProfilePerms([...allPermissionIds])}>
                      Selecionar Todas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="text-xs text-gray-500 hover:text-gray-700 font-medium" onClick={() => setProfilePerms([])}>
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
                  {allPermissionGroups.map((group) => {
                    const isExpanded = expandedGroups.includes(group.group);
                    const groupIds = group.permissions.map((p) => p.id);
                    const selectedCount = groupIds.filter((id) => profilePerms.includes(id)).length;
                    const allInGroup = selectedCount === groupIds.length;

                    return (
                      <div key={group.group} className="border-b border-gray-100 last:border-0">
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => toggleExpandGroup(group.group)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <span className="text-sm font-medium text-gray-900">{group.group}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{selectedCount}/{groupIds.length}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleGroupAll(group); }}
                              className={`text-xs px-2 py-0.5 rounded ${allInGroup ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {allInGroup ? "Desmarcar" : "Todas"}
                            </button>
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3 space-y-1">
                            {group.permissions.map((perm) => (
                              <label key={perm.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={profilePerms.includes(perm.id)}
                                  onChange={() => togglePerm(perm.id)}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <p className="text-sm text-gray-900">{perm.label}</p>
                                  <p className="text-xs text-gray-500">{perm.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={saveProfile} disabled={!profileName}>
                <Check className="w-4 h-4" />
                {modal === "create-profile" ? "Criar Perfil" : "Salvar Perfil"}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // ─── VIEW USER ───
    if (modal === "view-user" && selectedUserId) {
      const user = users.find((u) => u.id === selectedUserId);
      const profile = user ? getProfile(user.profileId) : null;
      if (!user || !profile) return null;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Detalhes do Usuário</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.role}</p>
                  <Badge variant={user.status === "ativo" ? "success" : "secondary"} className="mt-1">
                    {user.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Telefone</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Perfil</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${profileColorMap[profile.color]}`}>
                    {profile.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Criado em</span>
                  <span className="font-medium">{user.createdAt}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Último acesso</span>
                  <span className="font-medium">{user.lastAccess}</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">Permissões ({profile.permissions.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.permissions.slice(0, 12).map((permId) => {
                    const perm = allPermissionGroups.flatMap((g) => g.permissions).find((p) => p.id === permId);
                    return perm ? (
                      <span key={permId} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {perm.label}
                      </span>
                    ) : null;
                  })}
                  {profile.permissions.length > 12 && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      +{profile.permissions.length - 12} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => { setModal(null); openEditUser(user); }}>
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {renderModal()}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="w-6 sm:w-7 h-6 sm:h-7 text-indigo-600" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Controle de acessos, perfis e permissões do sistema</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 w-fit">
          <Crown className="w-4 h-4 text-red-500" />
          <span className="font-medium text-red-700">Acesso Master</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setPageView("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            pageView === "users" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          Usuários ({users.length})
        </button>
        <button
          onClick={() => setPageView("profiles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            pageView === "profiles" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          Perfis de Acesso ({profiles.length})
        </button>
      </div>

      {/* ─── USERS TAB ─── */}
      {pageView === "users" && (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={openCreateUser}>
              <Plus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Usuário</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Cargo</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Perfil</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Último Acesso</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user) => {
                      const profile = getProfile(user.profileId);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                {profile?.id === "profile-master" ? (
                                  <Crown className="w-5 h-5 text-red-500" />
                                ) : (
                                  <User className="w-5 h-5 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-700">{user.role}</p>
                          </td>
                          <td className="px-4 py-3">
                            {profile && (
                              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${profileColorMap[profile.color]}`}>
                                {profile.name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.status === "ativo" ? "success" : "secondary"}>
                              {user.status === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-500">{user.lastAccess}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUserId(user.id); setModal("view-user"); }}>
                                <Eye className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditUser(user)}>
                                <Edit className="w-4 h-4 text-gray-500" />
                              </Button>
                              {profile?.id !== "profile-master" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDeleteTarget({ type: "user", id: user.id }); setModal("delete-confirm"); }}>
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum usuário encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── PROFILES TAB ─── */}
      {pageView === "profiles" && (
        <>
          <div className="flex items-center justify-end">
            <Button onClick={openCreateProfile}>
              <Plus className="w-4 h-4" />
              Novo Perfil
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {profiles.map((profile) => {
              const usersWithProfile = users.filter((u) => u.profileId === profile.id);
              return (
                <Card key={profile.id} className="hover:border-gray-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          profile.id === "profile-master" ? "bg-red-100" : "bg-gray-100"
                        }`}>
                          {profile.id === "profile-master" ? (
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                          ) : (
                            <ShieldCheck className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900">{profile.name}</h3>
                            <div className={`w-2.5 h-2.5 rounded-full ${profileDotMap[profile.color]}`} />
                          </div>
                          <p className="text-xs text-gray-500">{profile.description}</p>
                        </div>
                      </div>
                      {!profile.isSystem && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProfile(profile)}>
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDeleteTarget({ type: "profile", id: profile.id }); setModal("delete-confirm"); }}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      )}
                      {profile.isSystem && (
                        <Badge variant="secondary" className="text-xs">Sistema</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-500">
                        <span className="font-semibold text-gray-900">{profile.permissions.length}</span> permissões
                      </span>
                      <span className="text-gray-500">
                        <span className="font-semibold text-gray-900">{usersWithProfile.length}</span> usuário(s)
                      </span>
                    </div>

                    {/* Permission summary */}
                    <div className="flex flex-wrap gap-1">
                      {allPermissionGroups.map((group) => {
                        const groupIds = group.permissions.map((p) => p.id);
                        const count = groupIds.filter((id) => profile.permissions.includes(id)).length;
                        if (count === 0) return null;
                        return (
                          <span key={group.group} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {group.group.split(" ")[0]} ({count})
                          </span>
                        );
                      })}
                    </div>

                    {/* Users in this profile */}
                    {usersWithProfile.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Usuários neste perfil:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {usersWithProfile.map((u) => (
                            <span key={u.id} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${u.status === "ativo" ? "bg-emerald-500" : "bg-gray-400"}`} />
                              {u.name.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
