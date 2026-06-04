import { supabase } from "@/lib/supabase/client";
import { CreateTeamMessageInput, TeamMessage } from "@/lib/supabase/types";

export async function getTeamMessages() {
  const { data, error } = await supabase
    .from("team_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw error;
  return (data ?? []) as TeamMessage[];
}

export async function sendTeamMessage(input: CreateTeamMessageInput) {
  const { data, error } = await supabase
    .from("team_messages")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data as TeamMessage;
}
