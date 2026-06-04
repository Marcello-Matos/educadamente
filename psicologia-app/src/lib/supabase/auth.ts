import { supabase } from "@/lib/supabase/client";

export interface SignUpMeta {
  name: string;
  crp?: string;
  phone?: string;
  specialty?: string;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, meta: SignUpMeta) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: meta },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function resetPassword(email: string) {
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}
