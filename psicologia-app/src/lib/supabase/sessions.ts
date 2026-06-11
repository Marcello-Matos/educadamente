import { supabase } from "@/lib/supabase/client";
import { CreateSessionInput, Session } from "@/lib/supabase/types";

export async function getSessions() {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, patients(id, name, phone), psychologists(id, name, crp)")
    .order("session_date", { ascending: true })
    .order("session_time", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Session[];
}

export async function createSession(input: CreateSessionInput) {
  const { data, error } = await supabase
    .from("sessions")
    .insert(input)
    .select("*, patients(id, name, phone), psychologists(id, name, crp)")
    .single();

  if (error) throw error;
  return data as Session;
}

export async function updateSession(id: string, input: CreateSessionInput) {
  const { data, error } = await supabase
    .from("sessions")
    .update(input)
    .eq("id", id)
    .select("*, patients(id, name, phone), psychologists(id, name, crp)")
    .single();

  if (error) throw error;
  return data as Session;
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) throw error;
}
