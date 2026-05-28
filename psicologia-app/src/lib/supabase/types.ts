export type PatientStatus = "ativo" | "inativo" | "alta";
export type PatientPlan = "mensal" | "anual" | "avulso";
export type ProfessionalStatus = "ativo" | "inativo";

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
