import { supabase } from "@/lib/supabase/client";
import { CreateTaskInput, Task, TaskStatus } from "@/lib/supabase/types";

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, psychologists(id, name), patients(id, name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function createTask(input: CreateTaskInput) {
  const { data, error } = await supabase
    .from("tasks")
    .insert(input)
    .select("*, psychologists(id, name), patients(id, name)")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, psychologists(id, name), patients(id, name)")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
