create extension if not exists "pgcrypto";

create type patient_status as enum ('ativo', 'inativo', 'alta');
create type patient_plan as enum ('mensal', 'anual', 'avulso');
create type professional_status as enum ('ativo', 'inativo');
create type session_status as enum ('agendada', 'realizada', 'cancelada', 'falta');
create type session_type as enum ('presencial', 'teleconsulta');
create type payment_method as enum ('pix', 'cartao', 'boleto');
create type payment_status as enum ('pago', 'pendente', 'atrasado');
create type clinical_form_type as enum ('triagem-crianca', 'triagem-adulto', 'anamnese-psicopedagogia');

create table if not exists psychologists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  crp text not null unique,
  email text,
  phone text,
  specialties text[] not null default '{}',
  avatar_url text,
  status professional_status not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists patients_name_idx on patients using gin (to_tsvector('portuguese', name));
create index if not exists patients_psychologist_id_idx on patients(psychologist_id);
create index if not exists sessions_date_idx on sessions(session_date);
create index if not exists sessions_patient_id_idx on sessions(patient_id);
create index if not exists payments_status_idx on payments(status);
create index if not exists payments_due_date_idx on payments(due_date);

alter table psychologists enable row level security;
alter table patients enable row level security;
alter table sessions enable row level security;
alter table payments enable row level security;
alter table clinical_forms enable row level security;

create policy "Allow authenticated read psychologists" on psychologists for select to authenticated using (true);
create policy "Allow authenticated write psychologists" on psychologists for all to authenticated using (true) with check (true);

create policy "Allow authenticated read patients" on patients for select to authenticated using (true);
create policy "Allow authenticated write patients" on patients for all to authenticated using (true) with check (true);

create policy "Allow authenticated read sessions" on sessions for select to authenticated using (true);
create policy "Allow authenticated write sessions" on sessions for all to authenticated using (true) with check (true);

create policy "Allow authenticated read payments" on payments for select to authenticated using (true);
create policy "Allow authenticated write payments" on payments for all to authenticated using (true) with check (true);

create policy "Allow authenticated read clinical forms" on clinical_forms for select to authenticated using (true);
create policy "Allow authenticated write clinical forms" on clinical_forms for all to authenticated using (true) with check (true);
