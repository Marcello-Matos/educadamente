import { supabase } from "@/lib/supabase/client";
import { CreatePatientInput, Patient, Psychologist } from "@/lib/supabase/types";

export async function checkCrpExists(crp: string): Promise<boolean> {
  const { data } = await supabase.from("psychologists").select("id").eq("crp", crp).maybeSingle();
  return !!data;
}

export async function getPsychologists() {
  const { data, error } = await supabase
    .from("psychologists")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Psychologist[];
}

export async function upsertPsychologistByEmail(input: {
  name: string;
  crp: string;
  email: string;
  phone?: string | null;
  specialties?: string[];
}) {
  const { data: existing } = await supabase
    .from("psychologists")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("psychologists")
      .update({ name: input.name, crp: input.crp, phone: input.phone ?? null, specialties: input.specialties ?? [] })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Psychologist;
  }

  const { data, error } = await supabase
    .from("psychologists")
    .insert({ name: input.name, crp: input.crp, email: input.email, phone: input.phone ?? null, specialties: input.specialties ?? [] })
    .select("*")
    .single();
  if (error) throw error;
  return data as Psychologist;
}

export async function deletePsychologistByEmail(email: string) {
  if (!email) return;
  await supabase.from("psychologists").delete().eq("email", email);
}

export async function createPsychologist(input: {
  name: string;
  crp: string;
  email?: string | null;
  phone?: string | null;
  specialties?: string[];
}) {
  const { data, error } = await supabase
    .from("psychologists")
    .insert({
      name: input.name,
      crp: input.crp,
      email: input.email ?? null,
      phone: input.phone ?? null,
      specialties: input.specialties ?? [],
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Psychologist;
}

export async function getPatients() {
  const { data, error } = await supabase
    .from("patients")
    .select("*, psychologists(id, name, crp)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Patient[];
}

export async function createPatient(input: CreatePatientInput) {
  const { data, error } = await supabase
    .from("patients")
    .insert(input)
    .select("*, psychologists(id, name, crp)")
    .single();

  if (error) throw error;
  return data as Patient;
}
