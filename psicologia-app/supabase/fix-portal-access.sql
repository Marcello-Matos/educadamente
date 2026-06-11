-- ════════════════════════════════════════════════════════════════════════
-- CORREÇÃO DE PROBLEMAS DE ACESSO AO PORTAL DO PACIENTE
-- Rode este script no SQL Editor do Supabase para corrigir problemas comuns
-- ════════════════════════════════════════════════════════════════════════

-- 1. Verificar pacientes que têm email mas não têm usuário correspondente no Auth
-- Isso é um problema: o paciente não consegue fazer login
select 
  p.id as patient_id,
  p.name,
  p.email,
  'Paciente sem usuário Auth' as problema
from patients p
where p.email is not null 
  and p.email != ''
  and not exists (
    select 1 from auth.users u where u.email = p.email
  );

-- 2. Verificar usuários Auth que não têm paciente correspondente
-- Isso também é um problema: o usuário consegue fazer login mas não vê dados
select 
  u.id as auth_id,
  u.email,
  'Usuário Auth sem paciente' as problema
from auth.users u
where not exists (
  select 1 from patients p where p.email ilike u.email
);

-- 3. Corrigir emails em diferentes formatos (maiúsculas/minúsculas)
-- Normaliza os emails para minúsculas para garantir consistência
update patients 
set email = lower(email)
where email is not null and email != lower(email);

-- 4. Verificar se há pacientes sem email (não conseguem acessar o portal)
select 
  id,
  name,
  phone,
  'Sem email cadastrado' as problema
from patients
where email is null or email = '';

-- 5. Verificar se há pacientes com email duplicado
select 
  lower(email) as email_normalizado,
  count(*) as quantidade
from patients
where email is not null and email != ''
group by lower(email)
having count(*) > 1;

-- 6. Verificar se o paciente tem profissional vinculado (necessário para agendamento)
select 
  p.id,
  p.name,
  p.email,
  p.psychologist_id,
  psy.name as profissional_nome,
  case when p.psychologist_id is null then 'Sem profissional vinculado' else 'OK' end as status
from patients p
left join psychologists psy on p.psychologist_id = psy.id
where p.email is not null and p.email != ''
order by p.created_at desc;

-- 7. Teste: verificar se a consulta do portal funciona
-- Simula a consulta que o código faz
select 
  p.*,
  psy.id as psych_id,
  psy.name as psych_name,
  psy.crp as psych_crp
from patients p
left join psychologists psy on p.psychologist_id = psy.id
where p.email ilike 'seu@email.com'  -- Substitua pelo email do paciente
limit 1;

-- 8. Verificar se há sessões para o paciente
select 
  s.id,
  s.session_date,
  s.session_time,
  s.status,
  s.type,
  p.name as paciente
from sessions s
join patients p on s.patient_id = p.id
where p.email ilike 'seu@email.com'  -- Substitua pelo email do paciente
order by s.session_date desc;
