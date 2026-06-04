import { supabase } from "@/lib/supabase/client";
import { CreateReminderInput, Reminder } from "@/lib/supabase/types";

export async function getReminders() {
  const { data, error } = await supabase
    .from("reminders")
    .select("*, patients(id, name, phone), psychologists(id, name)")
    .order("remind_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Reminder[];
}

export async function createReminder(input: CreateReminderInput) {
  const { data, error } = await supabase
    .from("reminders")
    .insert(input)
    .select("*, patients(id, name, phone), psychologists(id, name)")
    .single();

  if (error) throw error;
  return data as Reminder;
}

export async function toggleReminderDone(id: string, done: boolean) {
  const { data, error } = await supabase
    .from("reminders")
    .update({ done })
    .eq("id", id)
    .select("*, patients(id, name, phone), psychologists(id, name)")
    .single();

  if (error) throw error;
  return data as Reminder;
}

export async function deleteReminder(id: string) {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
}

export async function getPendingReminderCount() {
  const { count, error } = await supabase
    .from("reminders")
    .select("id", { count: "exact", head: true })
    .eq("done", false);

  if (error) return 0;
  return count ?? 0;
}
