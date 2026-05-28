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
