import { supabase } from "@/lib/supabase/client";

export interface ProfileRow {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isSystem: boolean;
}

export interface SystemUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileId: string;
  permissions: string[];
  status: "ativo" | "inativo";
  createdAt: string;
  lastAccess: string;
}

// ─── MAPPERS ───
type DbProfile = {
  id: string; name: string; description: string | null; color: string;
  permissions: string[]; is_system: boolean;
};
type DbUser = {
  id: string; name: string; email: string; phone: string | null; role: string | null;
  profile_id: string | null; permissions: string[] | null; status: string; last_access: string | null; created_at: string;
};

function mapProfile(p: DbProfile): ProfileRow {
  return {
    id: p.id, name: p.name, description: p.description ?? "", color: p.color,
    permissions: p.permissions ?? [], isSystem: p.is_system,
  };
}

function mapUser(u: DbUser): SystemUserRow {
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone ?? "", role: u.role ?? "",
    profileId: u.profile_id ?? "", permissions: u.permissions ?? [],
    status: (u.status as "ativo" | "inativo") ?? "ativo",
    createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "",
    lastAccess: u.last_access ?? "Nunca",
  };
}

// ─── PROFILES ───
export async function getProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await supabase.from("access_profiles").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data as DbProfile[]).map(mapProfile);
}

export async function createProfile(input: Omit<ProfileRow, "id">): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("access_profiles")
    .insert({ name: input.name, description: input.description, color: input.color, permissions: input.permissions, is_system: input.isSystem })
    .select("*").single();
  if (error) throw error;
  return mapProfile(data as DbProfile);
}

export async function updateProfile(id: string, input: Partial<Omit<ProfileRow, "id">>): Promise<ProfileRow> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.color !== undefined) patch.color = input.color;
  if (input.permissions !== undefined) patch.permissions = input.permissions;
  const { data, error } = await supabase.from("access_profiles").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return mapProfile(data as DbProfile);
}

export async function deleteProfile(id: string): Promise<void> {
  const { error } = await supabase.from("access_profiles").delete().eq("id", id);
  if (error) throw error;
}

// ─── USERS ───
export async function getSystemUsers(): Promise<SystemUserRow[]> {
  const { data, error } = await supabase.from("system_users").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data as DbUser[]).map(mapUser);
}

export async function createSystemUser(input: { name: string; email: string; phone: string; role: string; profileId: string; permissions?: string[]; status: "ativo" | "inativo"; }): Promise<SystemUserRow> {
  const { data, error } = await supabase
    .from("system_users")
    .insert({ name: input.name, email: input.email, phone: input.phone, role: input.role, profile_id: input.profileId || null, permissions: input.permissions ?? [], status: input.status })
    .select("*").single();
  if (error) throw error;
  return mapUser(data as DbUser);
}

export async function updateSystemUser(id: string, input: { name: string; email: string; phone: string; role: string; profileId: string; permissions?: string[]; status: "ativo" | "inativo"; }): Promise<SystemUserRow> {
  const patch: Record<string, unknown> = {
    name: input.name, email: input.email, phone: input.phone, role: input.role,
    profile_id: input.profileId || null, status: input.status,
  };
  if (input.permissions !== undefined) patch.permissions = input.permissions;
  const { data, error } = await supabase
    .from("system_users")
    .update(patch)
    .eq("id", id).select("*").single();
  if (error) throw error;
  return mapUser(data as DbUser);
}

export async function deleteSystemUser(id: string): Promise<void> {
  const { error } = await supabase.from("system_users").delete().eq("id", id);
  if (error) throw error;
}

// ─── SEED (primeira execução) ───
export async function seedProfilesIfEmpty(defaults: Omit<ProfileRow, "id">[]): Promise<ProfileRow[]> {
  const existing = await getProfiles();
  if (existing.length > 0) return existing;
  const { data, error } = await supabase
    .from("access_profiles")
    .insert(defaults.map(d => ({ name: d.name, description: d.description, color: d.color, permissions: d.permissions, is_system: d.isSystem })))
    .select("*");
  if (error) throw error;
  return (data as DbProfile[]).map(mapProfile);
}
