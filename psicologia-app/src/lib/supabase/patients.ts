import { supabase } from "@/lib/supabase/client";
import { CreatePatientInput, Patient, Psychologist } from "@/lib/supabase/types";

export async function getPsychologists() {
  const { data, error } = await supabase
    .from("psychologists")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Psychologist[];
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
