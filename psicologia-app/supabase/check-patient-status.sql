-- ════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO DO STATUS DO PACIENTE ESPECÍFICO
-- Substitua 'seu@email.com' pelo email do paciente que você está testando
-- Rode este script no SQL Editor do Supabase
-- ════════════════════════════════════════════════════════════════════════

-- 1. Verificar se o paciente existe na tabela patients
select 
  'Paciente na tabela patients' as tabela,
  id,
  name,
  email,
  phone,
  psychologist_id,
  status,
  created_at
from patients 
where email ilike 'seu@email.com';  -- SUBSTITUA PELO EMAIL DO PACIENTE

-- 2. Verificar se existe usuário Auth correspondente
select 
  'Usuário Auth correspondente' as tabela,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
from auth.users 
where email ilike 'seu@email.com';  -- SUBSTITUA PELO EMAIL DO PACIENTE

-- 3. Verificar se o usuário Auth tem a flag portal_password_set
select 
  'Metadados do usuário Auth' as tabela,
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data ->> 'portal_password_set' as senha_definida
from auth.users 
where email ilike 'seu@email.com';  -- SUBSTITUA PELO EMAIL DO PACIENTE

-- 4. Verificar sessões do paciente
select 
  'Sessões do paciente' as tabela,
  s.id,
  s.session_date,
  s.session_time,
  s.status,
  s.type,
  s.notes
from sessions s
join patients p on s.patient_id = p.id
where p.email ilike 'seu@email.com'  -- SUBSTITUA PELO EMAIL DO PACIENTE
order by s.session_date desc, s.session_time desc;

-- 5. Verificar pagamentos do paciente
select 
  'Pagamentos do paciente' as tabela,
  id,
  amount,
  due_date,
  paid_date,
  method,
  status,
  description
from payments
where patient_id = (
  select id from patients where email ilike 'seu@email.com'  -- SUBSTITUA PELO EMAIL DO PACIENTE
)
order by due_date desc;

-- 6. Teste da consulta que o portal faz (findPatientByEmail)
select 
  'Teste da consulta do portal' as tabela,
  p.*,
  psy.id as psych_id,
  psy.name as psych_name,
  psy.crp as psych_crp
from patients p
left join psychologists psy on p.psychologist_id = psy.id
where p.email ilike 'seu@email.com'  -- SUBSTITUA PELO EMAIL DO PACIENTE
limit 1;
