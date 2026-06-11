-- ════════════════════════════════════════════════════════════════════════
-- ADICIONAR FOTOS DE PERFIL AO SISTEMA
-- Rode este script no SQL Editor do Supabase para ativar fotos de perfil
-- ════════════════════════════════════════════════════════════════════════

-- 1. Adicionar coluna photo_url na tabela patients
alter table patients add column if not exists photo_url text;

-- 2. Adicionar coluna photo_url na tabela system_users
alter table system_users add column if not exists photo_url text;

-- 3. Renomear avatar_url para photo_url na tabela psychologists (se existir)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'psychologists' and column_name = 'avatar_url'
  ) then
    alter table psychologists rename column avatar_url to photo_url;
  end if;
end $$;

-- 4. Adicionar coluna photo_url na tabela psychologists (se não existir)
alter table psychologists add column if not exists photo_url text;

-- 5. Criar bucket user-photos para fotos de perfil
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-photos', 'user-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = true,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 6. Remover políticas antigas do bucket user-photos (se existirem)
drop policy if exists "user-photos read" on storage.objects;
drop policy if exists "user-photos insert" on storage.objects;
drop policy if exists "user-photos update" on storage.objects;
drop policy if exists "user-photos delete" on storage.objects;

-- 7. Criar políticas RLS para o bucket user-photos
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

-- 8. Verificar se as colunas foram criadas corretamente
select 
  'patients' as tabela,
  column_name,
  data_type
from information_schema.columns
where table_name = 'patients' and column_name = 'photo_url'
union all
select 
  'psychologists' as tabela,
  column_name,
  data_type
from information_schema.columns
where table_name = 'psychologists' and column_name = 'photo_url'
union all
select 
  'system_users' as tabela,
  column_name,
  data_type
from information_schema.columns
where table_name = 'system_users' and column_name = 'photo_url';

-- 9. Verificar se o bucket foi criado
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'user-photos';
