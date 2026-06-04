-- ════════════════════════════════════════════════════════════════════════
-- COLABORAÇÃO: Tarefas, Lembretes e Chat da Equipe + Realtime
-- Rode este arquivo no SQL Editor do Supabase (depois de schema.sql)
-- ════════════════════════════════════════════════════════════════════════

-- ─── ENUMS ───
do $$ begin
  create type task_priority as enum ('baixa', 'media', 'alta');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('pendente', 'em_andamento', 'concluida');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reminder_channel as enum ('sistema', 'whatsapp', 'email');
exception when duplicate_object then null; end $$;

-- ─── TAREFAS ───
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

-- ─── LEMBRETES ───
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

-- ─── CHAT DA EQUIPE ───
create table if not exists team_messages (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid references psychologists(id) on delete set null,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- ─── ÍNDICES ───
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists reminders_remind_at_idx on reminders(remind_at);
create index if not exists team_messages_created_idx on team_messages(created_at);

-- ─── RLS ───
alter table tasks enable row level security;
alter table reminders enable row level security;
alter table team_messages enable row level security;

-- Políticas para usuários autenticados
create policy "auth read tasks" on tasks for select to authenticated using (true);
create policy "auth write tasks" on tasks for all to authenticated using (true) with check (true);
create policy "auth read reminders" on reminders for select to authenticated using (true);
create policy "auth write reminders" on reminders for all to authenticated using (true) with check (true);
create policy "auth read team_messages" on team_messages for select to authenticated using (true);
create policy "auth write team_messages" on team_messages for all to authenticated using (true) with check (true);

-- Políticas para anon (desenvolvimento)
create policy "anon read tasks" on tasks for select to anon using (true);
create policy "anon write tasks" on tasks for all to anon using (true) with check (true);
create policy "anon read reminders" on reminders for select to anon using (true);
create policy "anon write reminders" on reminders for all to anon using (true) with check (true);
create policy "anon read team_messages" on team_messages for select to anon using (true);
create policy "anon write team_messages" on team_messages for all to anon using (true) with check (true);

-- ─── REALTIME (colaboração em tempo real) ───
-- Adiciona tabelas à publicação de realtime do Supabase
do $$ begin
  alter publication supabase_realtime add table sessions;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table tasks;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table reminders;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table team_messages;
exception when duplicate_object then null; end $$;
