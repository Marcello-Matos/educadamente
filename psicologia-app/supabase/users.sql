-- ════════════════════════════════════════════════════════════════════════
-- USUÁRIOS & PERFIS DE ACESSO (persistência no banco)
-- Rode no SQL Editor do Supabase (depois de schema.sql)
-- ════════════════════════════════════════════════════════════════════════

-- ─── PERFIS DE ACESSO ───
create table if not exists access_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text not null default 'indigo',
  permissions text[] not null default '{}',
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── USUÁRIOS DO SISTEMA ───
create table if not exists system_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  role text,
  profile_id uuid references access_profiles(id) on delete set null,
  status text not null default 'ativo',
  last_access text,
  created_at timestamptz not null default now()
);

create index if not exists system_users_profile_idx on system_users(profile_id);

-- ─── RLS ───
alter table access_profiles enable row level security;
alter table system_users enable row level security;

create policy "auth read access_profiles" on access_profiles for select to authenticated using (true);
create policy "auth write access_profiles" on access_profiles for all to authenticated using (true) with check (true);
create policy "auth read system_users" on system_users for select to authenticated using (true);
create policy "auth write system_users" on system_users for all to authenticated using (true) with check (true);

create policy "anon read access_profiles" on access_profiles for select to anon using (true);
create policy "anon write access_profiles" on access_profiles for all to anon using (true) with check (true);
create policy "anon read system_users" on system_users for select to anon using (true);
create policy "anon write system_users" on system_users for all to anon using (true) with check (true);

-- ─── REALTIME ───
do $$ begin
  alter publication supabase_realtime add table access_profiles;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table system_users;
exception when duplicate_object then null; end $$;
