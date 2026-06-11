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
  color?: string | null;
}) {
  const { data: existing } = await supabase
    .from("psychologists")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (existing) {
    const patch: Record<string, unknown> = {
      name: input.name, crp: input.crp, phone: input.phone ?? null, specialties: input.specialties ?? [],
    };
    if (input.color !== undefined) patch.color = input.color;
    const { data, error } = await supabase
      .from("psychologists")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Psychologist;
  }

  const { data, error } = await supabase
    .from("psychologists")
    .insert({ name: input.name, crp: input.crp, email: input.email, phone: input.phone ?? null, specialties: input.specialties ?? [], color: input.color ?? null })
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

export async function updatePatient(id: string, input: CreatePatientInput) {
  const { data, error } = await supabase
    .from("patients")
    .update(input)
    .eq("id", id)
    .select("*, psychologists(id, name, crp)")
    .single();

  if (error) throw error;
  return data as Patient;
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
}
