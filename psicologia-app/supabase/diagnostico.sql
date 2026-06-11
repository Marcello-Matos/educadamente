-- ════════════════════════════════════════════════════════════════════════
-- DIAGNÓSTICO DO PORTAL DO PACIENTE
-- Rode este script no SQL Editor do Supabase para verificar problemas
-- ════════════════════════════════════════════════════════════════════════

-- 1. Verificar se há pacientes cadastrados
select 'Pacientes cadastrados' as info, count(*) as total from patients;

-- 2. Listar todos os pacientes com email (substitua pelo email que você está testando)
select id, name, email, phone, psychologist_id, status 
from patients 
where email is not null 
order by created_at desc;

-- 3. Verificar se o email específico existe (substitua pelo email do paciente)
-- Descomente a linha abaixo e coloque o email do paciente:
-- select * from patients where email ilike 'seu@email.com';

-- 4. Verificar políticas RLS na tabela patients
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where tablename = 'patients';

-- 5. Verificar se RLS está ativado
select 
  schemaname,
  tablename,
  rowsecurity
from pg_tables 
where tablename = 'patients';

-- 6. Verificar usuários do Supabase Auth (auth.users)
select id, email, email_confirmed_at, created_at, last_sign_in_at 
from auth.users 
order by created_at desc 
limit 10;

-- 7. Verificar metadados dos usuários (para ver se portal_password_set está definido)
select 
  u.id,
  u.email,
  u.raw_user_meta_data
from auth.users u
where u.raw_user_meta_data ? 'portal_password_set';

-- 8. Testar consulta como anon (simula acesso do portal sem login)
-- Isso deve funcionar se as políticas RLS estão corretas
set role anon;
select count(*) as total_pacientes from patients;
reset role;

-- 9. Verificar se há sessões agendadas
select 
  s.id,
  s.session_date,
  s.session_time,
  s.status,
  s.type,
  p.name as paciente_nome,
  psy.name as profissional_nome
from sessions s
left join patients p on s.patient_id = p.id
left join psychologists psy on s.psychologist_id = psy.id
order by s.session_date desc, s.session_time desc
limit 10;
