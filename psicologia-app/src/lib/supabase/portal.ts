import { supabase } from "@/lib/supabase/client";
import { Patient, Session, Payment } from "@/lib/supabase/types";

// Busca o paciente pelo email cadastrado pela clínica (fluxo de convite:
// só quem foi cadastrado pela clínica consegue acessar o portal).
export async function findPatientByEmail(email: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from("patients")
    .select("*, psychologists(id, name, crp)")
    .ilike("email", email.trim())
    .limit(1);
  if (error) throw error;
  return (data && data.length > 0 ? (data[0] as Patient) : null);
}

// Envia o link mágico de acesso por email (sem senha).
export async function sendPatientMagicLink(email: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}${basePath}/paciente/`
      : undefined;
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function getPatientSessions(patientId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, psychologists(id, name, crp)")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false })
    .order("session_time", { ascending: false });
  if (error) throw error;
  return (data || []) as Session[];
}

export async function getPatientPayments(patientId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("patient_id", patientId)
    .order("due_date", { ascending: false });
  if (error) throw error;
  return (data || []) as Payment[];
}

// Define a senha do paciente após o primeiro acesso pelo link mágico.
// Marca no perfil que a senha já foi criada para não pedir de novo.
export async function setPatientPassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
    data: { portal_password_set: true },
  });
  if (error) throw error;
}

// Horários já ocupados do profissional num intervalo de datas (para o agendamento)
export async function getBookedSlots(
  psychologistId: string,
  fromDate: string,
  toDate: string
): Promise<{ session_date: string; session_time: string }[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("session_date, session_time")
    .eq("psychologist_id", psychologistId)
    .gte("session_date", fromDate)
    .lte("session_date", toDate)
    .neq("status", "cancelada");
  if (error) throw error;
  return (data || []) as { session_date: string; session_time: string }[];
}

// Paciente agenda uma consulta pelo portal
export async function bookPatientSession(input: {
  patient_id: string;
  psychologist_id: string | null;
  session_date: string;
  session_time: string;
  type: "presencial" | "teleconsulta";
}): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      patient_id: input.patient_id,
      psychologist_id: input.psychologist_id,
      session_date: input.session_date,
      session_time: input.session_time,
      duration: 50,
      status: "agendada",
      type: input.type,
      notes: "Agendada pelo paciente via Portal",
    })
    .select("*, psychologists(id, name, crp)")
    .single();
  if (error) throw error;
  return data as Session;
}
