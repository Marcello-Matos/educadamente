-- ════════════════════════════════════════════════════════════════════════
-- RESET TOTAL DE DADOS — EducadaMente
-- Rode ESTE arquivo no SQL Editor do Supabase para APAGAR TODOS OS DADOS
-- e começar os cadastros reais do zero.
--
-- ATENÇÃO: esta ação é IRREVERSÍVEL. Todos os registros serão apagados.
-- A estrutura (tabelas, enums, políticas, bucket) é preservada.
-- As contas de login (Supabase Auth) NÃO são apagadas.
-- ════════════════════════════════════════════════════════════════════════

-- 1) Apaga todos os dados de todas as tabelas do sistema
truncate table
  session_recordings,
  team_messages,
  reminders,
  tasks,
  clinical_forms,
  payments,
  sessions,
  patients,
  psychologists,
  system_users,
  access_profiles
restart identity cascade;

-- 2) Apaga todos os vídeos de gravação do Storage
delete from storage.objects where bucket_id = 'session-recordings';

-- ════════════════════════════════════════════════════════════════════════
-- PRONTO! Recarregue a aplicação. Os perfis de acesso padrão serão
-- recriados automaticamente pelo sistema na primeira abertura.
-- ════════════════════════════════════════════════════════════════════════
