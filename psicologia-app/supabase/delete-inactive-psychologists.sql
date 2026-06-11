-- ════════════════════════════════════════════════════════════════════════
-- VERIFICAR E REMOVER PSICÓLOGOS INATIVOS/EXCLUÍDOS
-- Rode este script no SQL Editor do Supabase para limpar registros
-- ════════════════════════════════════════════════════════════════════════

-- 1. Ver todos os psicólogos no banco
select id, name, email, crp, status, created_at
from psychologists
order by name;

-- 2. Se quiser ver apenas os que NÃO são "ativo"
select id, name, email, crp, status, created_at
from psychologists
where status is null or status != 'ativo'
order by name;

-- 3. Para deletar um psicólogo específico pelo nome (substitua o nome abaixo):
-- delete from psychologists where name ilike '%Marcello Administrador%';

-- 4. Para deletar um psicólogo específico pelo email (substitua o email abaixo):
-- delete from psychologists where email ilike '%email_aqui%';

-- 5. Para verificar se existe na tabela system_users também:
select id, name, email, status
from system_users
where name ilike '%Marcello%'
order by name;

-- 6. Para deletar da tabela system_users também (se necessário):
-- delete from system_users where name ilike '%Marcello Administrador%';
