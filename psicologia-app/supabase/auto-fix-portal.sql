-- ════════════════════════════════════════════════════════════════════════
-- CORREÇÃO AUTOMÁTICA DE PROBLEMAS DE ACESSO AO PORTAL
-- Rode este script no SQL Editor do Supabase para corrigir problemas
-- ════════════════════════════════════════════════════════════════════════

-- 1. Normalizar emails para minúsculas (evita problemas de case sensitivity)
update patients 
set email = lower(trim(email))
where email is not null and email != '';

-- 2. Criar uma tabela temporária para armazenar pacientes sem usuário Auth
create temp table patients_without_auth as
select p.id, p.name, p.email
from patients p
where p.email is not null 
  and p.email != ''
  and not exists (
    select 1 from auth.users u where lower(u.email) = lower(p.email)
  );

-- 3. Mostrar quais pacientes precisarão de usuário Auth
select * from patients_without_auth;

-- 4. Para cada paciente sem usuário Auth, você precisará criar o usuário manualmente
-- Infelizmente o Supabase não permite criar usuários Auth diretamente via SQL
-- Você tem duas opções:
-- 
-- OPÇÃO A: O paciente usa o fluxo "Primeiro acesso" no portal
-- - O paciente entra no portal
-- - Clica em "Primeiro acesso ou esqueceu a senha"
-- - Digita o email
-- - Recebe o link mágico
-- - Ao clicar no link, o Supabase cria o usuário Auth automaticamente
-- - O paciente então define a senha
--
-- OPÇÃO B: Você cria o usuário via Admin UI do Supabase
-- - Vá em Authentication > Users
-- - Clique em "Add user"
-- - Digite o email do paciente
-- - O paciente receberá um email para definir a senha
--
-- 5. Verificar pacientes que têm usuário Auth mas não têm profissional vinculado
-- Isso impede o agendamento de consultas
select 
  p.id,
  p.name,
  p.email,
  'Sem profissional vinculado' as problema
from patients p
where p.email is not null 
  and p.email != ''
  and p.psychologist_id is null
  and exists (
    select 1 from auth.users u where lower(u.email) = lower(p.email)
  );

-- 6. Se você tiver um profissional padrão, pode vincular automaticamente
-- Descomente e modifique as linhas abaixo:
-- update patients 
-- set psychologist_id = (select id from psychologists where status = 'ativo' limit 1)
-- where psychologist_id is null 
--   and email is not null 
--   and email != '';

-- 7. Limpar tabela temporária
drop table if exists patients_without_auth;

-- 8. Verificar o estado final
select 
  'Pacientes com email' as metrica,
  count(*) as total
from patients 
where email is not null and email != ''
union all
select 
  'Pacientes com usuário Auth' as metrica,
  count(*) as total
from patients p
where p.email is not null 
  and p.email != ''
  and exists (
    select 1 from auth.users u where lower(u.email) = lower(p.email)
  )
union all
select 
  'Pacientes com profissional vinculado' as metrica,
  count(*) as total
from patients 
where psychologist_id is not null;
