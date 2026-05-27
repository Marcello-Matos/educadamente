export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  status: "ativo" | "inativo" | "alta";
  plan: "mensal" | "anual" | "avulso";
  psychologist: string;
  startDate: string;
  notes: string;
  diagnosis?: string;
  cid?: string;
}

export interface Session {
  id: string;
  patientId: string;
  patientName: string;
  psychologistId: string;
  psychologistName: string;
  date: string;
  time: string;
  duration: number;
  status: "agendada" | "realizada" | "cancelada" | "falta";
  type: "presencial" | "teleconsulta";
  notes?: string;
  evolution?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  date: string;
  dueDate: string;
  method: "pix" | "cartao" | "boleto";
  status: "pago" | "pendente" | "atrasado";
  description: string;
  receiptUrl?: string;
}

export interface Psychologist {
  id: string;
  name: string;
  crp: string;
  email: string;
  phone: string;
  specialties: string[];
  avatar?: string;
  status: "ativo" | "inativo";
}

export const psychologists: Psychologist[] = [
  {
    id: "psy-1",
    name: "Dra. Maria Santos",
    crp: "06/123456",
    email: "maria@clinica.com",
    phone: "(11) 99999-0001",
    specialties: ["TCC", "Ansiedade", "Depressão"],
    status: "ativo",
  },
  {
    id: "psy-2",
    name: "Dr. João Oliveira",
    crp: "06/654321",
    email: "joao@clinica.com",
    phone: "(11) 99999-0002",
    specialties: ["Psicanálise", "Trauma", "Luto"],
    status: "ativo",
  },
  {
    id: "psy-3",
    name: "Dra. Ana Costa",
    crp: "06/111222",
    email: "ana@clinica.com",
    phone: "(11) 99999-0003",
    specialties: ["Infantil", "Família", "Casal"],
    status: "ativo",
  },
];

export const patients: Patient[] = [
  {
    id: "pat-1",
    name: "Carlos Alberto Silva",
    email: "carlos@email.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    birthDate: "1990-05-15",
    gender: "Masculino",
    address: "Rua das Flores, 123 - São Paulo/SP",
    emergencyContact: "Maria Silva",
    emergencyPhone: "(11) 91234-5678",
    status: "ativo",
    plan: "mensal",
    psychologist: "psy-1",
    startDate: "2024-01-10",
    notes: "Paciente com quadro de ansiedade generalizada",
    diagnosis: "Transtorno de Ansiedade Generalizada",
    cid: "F41.1",
  },
  {
    id: "pat-2",
    name: "Fernanda Oliveira",
    email: "fernanda@email.com",
    phone: "(11) 97654-3210",
    cpf: "987.654.321-00",
    birthDate: "1985-08-22",
    gender: "Feminino",
    address: "Av. Paulista, 456 - São Paulo/SP",
    emergencyContact: "Pedro Oliveira",
    emergencyPhone: "(11) 92345-6789",
    status: "ativo",
    plan: "anual",
    psychologist: "psy-2",
    startDate: "2023-06-15",
    notes: "Acompanhamento por depressão moderada",
    diagnosis: "Episódio Depressivo Moderado",
    cid: "F32.1",
  },
  {
    id: "pat-3",
    name: "Roberto Mendes",
    email: "roberto@email.com",
    phone: "(11) 96543-2100",
    cpf: "456.789.123-00",
    birthDate: "1978-12-03",
    gender: "Masculino",
    address: "Rua Augusta, 789 - São Paulo/SP",
    emergencyContact: "Ana Mendes",
    emergencyPhone: "(11) 93456-7890",
    status: "ativo",
    plan: "mensal",
    psychologist: "psy-1",
    startDate: "2024-03-01",
    notes: "Paciente em processo de luto",
    diagnosis: "Reação ao Luto",
    cid: "F43.2",
  },
  {
    id: "pat-4",
    name: "Juliana Pereira",
    email: "juliana@email.com",
    phone: "(11) 95432-1098",
    cpf: "321.654.987-00",
    birthDate: "1995-03-28",
    gender: "Feminino",
    address: "Rua Oscar Freire, 321 - São Paulo/SP",
    emergencyContact: "Marcos Pereira",
    emergencyPhone: "(11) 94567-8901",
    status: "ativo",
    plan: "avulso",
    psychologist: "psy-3",
    startDate: "2024-02-20",
    notes: "Terapia de casal",
  },
  {
    id: "pat-5",
    name: "André Souza",
    email: "andre@email.com",
    phone: "(11) 94321-0987",
    cpf: "654.321.987-00",
    birthDate: "2000-07-10",
    gender: "Masculino",
    address: "Rua Consolação, 654 - São Paulo/SP",
    emergencyContact: "Lucia Souza",
    emergencyPhone: "(11) 95678-9012",
    status: "inativo",
    plan: "mensal",
    psychologist: "psy-2",
    startDate: "2023-09-01",
    notes: "Paciente recebeu alta",
  },
];

export const sessions: Session[] = [
  {
    id: "ses-1",
    patientId: "pat-1",
    patientName: "Carlos Alberto Silva",
    psychologistId: "psy-1",
    psychologistName: "Dra. Maria Santos",
    date: "2024-12-20",
    time: "09:00",
    duration: 50,
    status: "agendada",
    type: "presencial",
  },
  {
    id: "ses-2",
    patientId: "pat-2",
    patientName: "Fernanda Oliveira",
    psychologistId: "psy-2",
    psychologistName: "Dr. João Oliveira",
    date: "2024-12-20",
    time: "10:00",
    duration: 50,
    status: "agendada",
    type: "teleconsulta",
  },
  {
    id: "ses-3",
    patientId: "pat-3",
    patientName: "Roberto Mendes",
    psychologistId: "psy-1",
    psychologistName: "Dra. Maria Santos",
    date: "2024-12-20",
    time: "11:00",
    duration: 50,
    status: "agendada",
    type: "presencial",
  },
  {
    id: "ses-4",
    patientId: "pat-1",
    patientName: "Carlos Alberto Silva",
    psychologistId: "psy-1",
    psychologistName: "Dra. Maria Santos",
    date: "2024-12-13",
    time: "09:00",
    duration: 50,
    status: "realizada",
    type: "presencial",
    notes: "Paciente relatou melhora nos sintomas de ansiedade.",
    evolution: "Boa evolução. Redução significativa de crises de pânico.",
  },
  {
    id: "ses-5",
    patientId: "pat-2",
    patientName: "Fernanda Oliveira",
    psychologistId: "psy-2",
    psychologistName: "Dr. João Oliveira",
    date: "2024-12-13",
    time: "10:00",
    duration: 50,
    status: "realizada",
    type: "teleconsulta",
    notes: "Sessão produtiva. Paciente demonstrou avanço.",
    evolution: "Paciente conseguiu aplicar técnicas discutidas na sessão anterior.",
  },
  {
    id: "ses-6",
    patientId: "pat-4",
    patientName: "Juliana Pereira",
    psychologistId: "psy-3",
    psychologistName: "Dra. Ana Costa",
    date: "2024-12-12",
    time: "14:00",
    duration: 50,
    status: "falta",
    type: "presencial",
  },
  {
    id: "ses-7",
    patientId: "pat-3",
    patientName: "Roberto Mendes",
    psychologistId: "psy-1",
    psychologistName: "Dra. Maria Santos",
    date: "2024-12-19",
    time: "11:00",
    duration: 50,
    status: "realizada",
    type: "presencial",
    notes: "Paciente expressou sentimentos de forma mais clara.",
    evolution: "Progresso no processo de elaboração do luto.",
  },
];

export const payments: Payment[] = [
  {
    id: "pay-1",
    patientId: "pat-1",
    patientName: "Carlos Alberto Silva",
    amount: 250,
    date: "2024-12-10",
    dueDate: "2024-12-10",
    method: "pix",
    status: "pago",
    description: "Sessão individual - Dezembro/2024",
  },
  {
    id: "pay-2",
    patientId: "pat-2",
    patientName: "Fernanda Oliveira",
    amount: 2400,
    date: "2024-12-01",
    dueDate: "2024-12-05",
    method: "cartao",
    status: "pago",
    description: "Plano anual - Parcela 7/12",
  },
  {
    id: "pay-3",
    patientId: "pat-3",
    patientName: "Roberto Mendes",
    amount: 250,
    date: "",
    dueDate: "2024-12-15",
    method: "boleto",
    status: "atrasado",
    description: "Sessão individual - Dezembro/2024",
  },
  {
    id: "pay-4",
    patientId: "pat-4",
    patientName: "Juliana Pereira",
    amount: 350,
    date: "",
    dueDate: "2024-12-20",
    method: "pix",
    status: "pendente",
    description: "Sessão de casal - Dezembro/2024",
  },
  {
    id: "pay-5",
    patientId: "pat-1",
    patientName: "Carlos Alberto Silva",
    amount: 250,
    date: "2024-11-10",
    dueDate: "2024-11-10",
    method: "pix",
    status: "pago",
    description: "Sessão individual - Novembro/2024",
  },
  {
    id: "pay-6",
    patientId: "pat-5",
    patientName: "André Souza",
    amount: 800,
    date: "",
    dueDate: "2024-11-20",
    method: "boleto",
    status: "atrasado",
    description: "Plano mensal - Novembro/2024",
  },
];

export const dashboardStats = {
  totalPatients: 48,
  activePsychologists: 3,
  sessionsThisMonth: 142,
  monthlyRevenue: 45600,
  absenceRate: 8.5,
  satisfactionRate: 96,
};

export const monthlyRevenueData = [
  { month: "Jul", revenue: 38000 },
  { month: "Ago", revenue: 41000 },
  { month: "Set", revenue: 39500 },
  { month: "Out", revenue: 43000 },
  { month: "Nov", revenue: 44200 },
  { month: "Dez", revenue: 45600 },
];

export const sessionsByTypeData = [
  { name: "Presencial", value: 85 },
  { name: "Teleconsulta", value: 57 },
];

export const patientStatusData = [
  { name: "Ativos", value: 38, color: "#10b981" },
  { name: "Inativos", value: 7, color: "#f59e0b" },
  { name: "Alta", value: 3, color: "#6366f1" },
];
