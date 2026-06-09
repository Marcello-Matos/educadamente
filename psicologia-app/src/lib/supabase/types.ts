export type PatientStatus = "ativo" | "inativo" | "alta";
export type PatientPlan = "mensal" | "anual" | "avulso";
export type ProfessionalStatus = "ativo" | "inativo";
export type SessionStatus = "agendada" | "realizada" | "cancelada" | "falta";
export type SessionType = "presencial" | "teleconsulta";
export type PaymentMethod = "pix" | "cartao" | "boleto";
export type PaymentStatus = "pago" | "pendente" | "atrasado";

export interface Psychologist {
  id: string;
  name: string;
  crp: string;
  email: string | null;
  phone: string | null;
  specialties: string[];
  avatar_url: string | null;
  color: string | null;
  status: ProfessionalStatus;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpf: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  status: PatientStatus;
  plan: PatientPlan;
  psychologist_id: string | null;
  start_date: string | null;
  notes: string | null;
  diagnosis: string | null;
  cid: string | null;
  created_at: string;
  updated_at: string;
  psychologists?: Pick<Psychologist, "id" | "name" | "crp"> | null;
}

export type CreatePatientInput = {
  name: string;
  email?: string | null;
  phone: string;
  cpf?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_phone?: string | null;
  status?: PatientStatus;
  plan?: PatientPlan;
  psychologist_id?: string | null;
  start_date?: string | null;
  notes?: string | null;
  diagnosis?: string | null;
  cid?: string | null;
};

export interface Session {
  id: string;
  patient_id: string;
  psychologist_id: string | null;
  session_date: string;
  session_time: string;
  duration: number;
  status: SessionStatus;
  type: SessionType;
  notes: string | null;
  evolution: string | null;
  created_at: string;
  updated_at: string;
  patients?: Pick<Patient, "id" | "name" | "phone"> | null;
  psychologists?: Pick<Psychologist, "id" | "name" | "crp"> | null;
}

export type CreateSessionInput = {
  patient_id: string;
  psychologist_id?: string | null;
  session_date: string;
  session_time: string;
  duration?: number;
  status?: SessionStatus;
  type?: SessionType;
  notes?: string | null;
  evolution?: string | null;
};

export interface Payment {
  id: string;
  patient_id: string | null;
  amount: number;
  paid_date: string | null;
  due_date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  patients?: Pick<Patient, "id" | "name"> | null;
}

export type CreatePaymentInput = {
  patient_id?: string | null;
  amount: number;
  paid_date?: string | null;
  due_date: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  description: string;
  receipt_url?: string | null;
};

// ─── TAREFAS ───
export type TaskPriority = "baixa" | "media" | "alta";
export type TaskStatus = "pendente" | "em_andamento" | "concluida";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  psychologist_id: string | null;
  patient_id: string | null;
  created_at: string;
  updated_at: string;
  psychologists?: Pick<Psychologist, "id" | "name"> | null;
  patients?: Pick<Patient, "id" | "name"> | null;
}

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null;
  psychologist_id?: string | null;
  patient_id?: string | null;
};

// ─── LEMBRETES ───
export type ReminderChannel = "sistema" | "whatsapp" | "email";

export interface Reminder {
  id: string;
  title: string;
  notes: string | null;
  remind_at: string;
  channel: ReminderChannel;
  session_id: string | null;
  patient_id: string | null;
  psychologist_id: string | null;
  done: boolean;
  created_at: string;
  patients?: Pick<Patient, "id" | "name" | "phone"> | null;
  psychologists?: Pick<Psychologist, "id" | "name"> | null;
}

export type CreateReminderInput = {
  title: string;
  notes?: string | null;
  remind_at: string;
  channel?: ReminderChannel;
  session_id?: string | null;
  patient_id?: string | null;
  psychologist_id?: string | null;
  done?: boolean;
};

// ─── CHAT DA EQUIPE ───
export interface TeamMessage {
  id: string;
  psychologist_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export type CreateTeamMessageInput = {
  psychologist_id?: string | null;
  author_name: string;
  content: string;
};
