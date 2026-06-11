import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export interface SignUpMeta {
  name: string;
  crp?: string;
  phone?: string;
  specialty?: string;
}

// Cria uma conta de login (Supabase Auth) SEM afetar a sessão do admin logado.
// Usa um client temporário que não persiste sessão no navegador.
export async function createUserAccount(email: string, password: string, meta: SignUpMeta) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const temp = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await temp.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: meta },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, meta: SignUpMeta) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
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
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
  if (error) throw error;
}
