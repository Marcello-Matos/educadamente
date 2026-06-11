-- ════════════════════════════════════════════════════════════════════════
-- SETUP COMPLETO — EducadaMente
-- Rode ESTE arquivo no SQL Editor do Supabase (uma única vez).
-- É idempotente: pode rodar de novo sem dar erro.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin create type patient_status as enum ('ativo', 'inativo', 'alta'); exception when duplicate_object then null; end $$;
do $$ begin create type patient_plan as enum ('mensal', 'anual', 'avulso'); exception when duplicate_object then null; end $$;
do $$ begin create type professional_status as enum ('ativo', 'inativo'); exception when duplicate_object then null; end $$;
do $$ begin create type session_status as enum ('agendada', 'realizada', 'cancelada', 'falta'); exception when duplicate_object then null; end $$;
do $$ begin create type session_type as enum ('presencial', 'teleconsulta'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_method as enum ('pix', 'cartao', 'boleto'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_status as enum ('pago', 'pendente', 'atrasado'); exception when duplicate_object then null; end $$;
do $$ begin create type clinical_form_type as enum ('triagem-crianca', 'triagem-adulto', 'anamnese-psicopedagogia'); exception when duplicate_object then null; end $$;
do $$ begin create type task_priority as enum ('baixa', 'media', 'alta'); exception when duplicate_object then null; end $$;
do $$ begin create type task_status as enum ('pendente', 'em_andamento', 'concluida'); exception when duplicate_object then null; end $$;
do $$ begin create type reminder_channel as enum ('sistema', 'whatsapp', 'email'); exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- TABELAS PRINCIPAIS
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists psychologists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  crp text not null unique,
  email text,
  phone text,
  specialties text[] not null default '{}',
  photo_url text,
  color text,
  status professional_status not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garante a coluna de cor mesmo em bancos já existentes
alter table psychologists add column if not exists color text;
-- Migração: renomear avatar_url para photo_url se existir
alter table psychologists rename column avatar_url to photo_url;

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  cpf text unique,
  birth_date date,
  gender text,
  address text,
  emergency_contact text,
  emergency_phone text,
  status patient_status not null default 'ativo',
  plan patient_plan not null default 'mensal',
  psychologist_id uuid references psychologists(id) on delete set null,
  start_date date,
  notes text,
  diagnosis text,
  cid text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  psychologist_id uuid references psychologists(id) on delete set null,
  session_date date not null,
  session_time time not null,
  duration integer not null default 50,
  status session_status not null default 'agendada',
  type session_type not null default 'presencial',
  notes text,
  evolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  amount numeric(10,2) not null,
  paid_date date,
  due_date date not null,
  method payment_method not null default 'pix',
  status payment_status not null default 'pendente',
  description text not null,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinical_forms (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  type clinical_form_type not null,
  patient_name text not null,
  form_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- USUÁRIOS & PERFIS DE ACESSO
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists access_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text not null default 'indigo',
  permissions text[] not null default '{}',
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists system_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  role text,
  profile_id uuid references access_profiles(id) on delete set null,
  permissions text[] not null default '{}',
  status text not null default 'ativo',
  last_access text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Garante a coluna de permissões mesmo em bancos já existentes
alter table system_users add column if not exists permissions text[] not null default '{}';
alter table system_users add column if not exists photo_url text;

-- ─────────────────────────────────────────────────────────────────────────
-- COLABORAÇÃO: TAREFAS, LEMBRETES, CHAT
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority task_priority not null default 'media',
  status task_status not null default 'pendente',
  due_date date,
  psychologist_id uuid references psychologists(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  remind_at timestamptz not null,
  channel reminder_channel not null default 'sistema',
  session_id uuid references sessions(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  psychologist_id uuid references psychologists(id) on delete set null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists team_messages (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid references psychologists(id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Gravações de teleconsulta (vídeos salvos no Storage)
create table if not exists session_recordings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete set null,
  psychologist_id uuid references psychologists(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,
  storage_path text not null,
  public_url text,
  duration_seconds integer,
  file_size_bytes integer,
  mime_type text not null default 'video/webm',
  status text not null default 'gravando',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────────────────────────────────────
create index if not exists patients_name_idx on patients using gin (to_tsvector('portuguese', name));
create index if not exists patients_psychologist_id_idx on patients(psychologist_id);
create index if not exists sessions_date_idx on sessions(session_date);
create index if not exists sessions_patient_id_idx on sessions(patient_id);
create index if not exists payments_status_idx on payments(status);
create index if not exists payments_due_date_idx on payments(due_date);
create index if not exists system_users_profile_idx on system_users(profile_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists reminders_remind_at_idx on reminders(remind_at);
create index if not exists team_messages_created_idx on team_messages(created_at);
create index if not exists session_recordings_session_id_idx on session_recordings(session_id);

-- ─────────────────────────────────────────────────────────────────────────
-- RLS (Row Level Security)
-- ─────────────────────────────────────────────────────────────────────────
alter table psychologists enable row level security;
alter table patients enable row level security;
alter table sessions enable row level security;
alter table payments enable row level security;
alter table clinical_forms enable row level security;
alter table access_profiles enable row level security;
alter table system_users enable row level security;
alter table tasks enable row level security;
alter table reminders enable row level security;
alter table team_messages enable row level security;
alter table session_recordings enable row level security;

-- Bucket para vídeos de teleconsulta
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('session-recordings', 'session-recordings', true, 524288000, array['video/webm', 'video/mp4', 'video/x-matroska'])
on conflict (id) do update set
  public = true,
  allowed_mime_types = array['video/webm', 'video/mp4', 'video/x-matroska'];

-- Bucket para fotos de perfil de usuários
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-photos', 'user-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = true,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Políticas de Storage para o bucket session-recordings (sem elas o upload é bloqueado pelo RLS)
drop policy if exists "recordings read" on storage.objects;
drop policy if exists "recordings insert" on storage.objects;
drop policy if exists "recordings update" on storage.objects;
drop policy if exists "recordings delete" on storage.objects;

create policy "recordings read" on storage.objects
  for select to authenticated, anon
  using (bucket_id = 'session-recordings');

create policy "recordings insert" on storage.objects
  for insert to authenticated, anon
  with check (bucket_id = 'session-recordings');

create policy "recordings update" on storage.objects
  for update to authenticated, anon
  using (bucket_id = 'session-recordings')
  with check (bucket_id = 'session-recordings');

create policy "recordings delete" on storage.objects
  for delete to authenticated, anon
  using (bucket_id = 'session-recordings');

-- Políticas de Storage para o bucket user-photos
drop policy if exists "user-photos read" on storage.objects;
drop policy if exists "user-photos insert" on storage.objects;
drop policy if exists "user-photos update" on storage.objects;
drop policy if exists "user-photos delete" on storage.objects;

create policy "user-photos read" on storage.objects
  for select to authenticated, anon
  using (bucket_id = 'user-photos');

create policy "user-photos insert" on storage.objects
  for insert to authenticated, anon
  with check (bucket_id = 'user-photos');

create policy "user-photos update" on storage.objects
  for update to authenticated, anon
  using (bucket_id = 'user-photos')
  with check (bucket_id = 'user-photos');

create policy "user-photos delete" on storage.objects
  for delete to authenticated, anon
  using (bucket_id = 'user-photos');

-- Políticas (cria para authenticated e anon). Recria de forma segura.
do $$
declare
  t text;
  tbls text[] := array[
    'psychologists','patients','sessions','payments','clinical_forms',
    'access_profiles','system_users','tasks','reminders','team_messages','session_recordings'
  ];
begin
  foreach t in array tbls loop
    execute format('drop policy if exists "auth read %1$s" on %1$s', t);
    execute format('drop policy if exists "auth write %1$s" on %1$s', t);
    execute format('drop policy if exists "anon read %1$s" on %1$s', t);
    execute format('drop policy if exists "anon write %1$s" on %1$s', t);

    execute format('create policy "auth read %1$s" on %1$s for select to authenticated using (true)', t);
    execute format('create policy "auth write %1$s" on %1$s for all to authenticated using (true) with check (true)', t);
    execute format('create policy "anon read %1$s" on %1$s for select to anon using (true)', t);
    execute format('create policy "anon write %1$s" on %1$s for all to anon using (true) with check (true)', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin alter publication supabase_realtime add table sessions; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table tasks; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table reminders; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table team_messages; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table access_profiles; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table system_users; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table psychologists; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table session_recordings; exception when duplicate_object then null; end $$;

-- ════════════════════════════════════════════════════════════════════════
-- PRONTO! Recarregue a aplicação. Os perfis padrão serão criados
-- automaticamente na primeira vez que abrir a página "Usuários".
-- ════════════════════════════════════════════════════════════════════════
