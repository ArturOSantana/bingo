-- =====================================================
-- Chat moderado — Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Cria a tabela
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references bingo_session(id) on delete cascade,
  author text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Habilita Realtime
do $$ begin
  alter publication supabase_realtime add table chat_messages;
exception when duplicate_object then null;
end $$;

-- 3. Habilita RLS
alter table chat_messages enable row level security;

-- 4. Remove políticas antigas se existirem
drop policy if exists "chat_leitura_publica"   on chat_messages;
drop policy if exists "chat_insercao_publica"  on chat_messages;
drop policy if exists "chat_atualizacao_publica" on chat_messages;
drop policy if exists "chat_exclusao_publica"  on chat_messages;

-- 5. Leitura: qualquer um vê apenas mensagens aprovadas
create policy "chat_leitura_publica" on chat_messages
  for select to anon using (approved = true);

-- 6. Inserção: qualquer um pode enviar (fica pendente)
create policy "chat_insercao_publica" on chat_messages
  for insert to anon with check (true);

-- 7. Atualização: qualquer um pode aprovar/reprovar
--    (Em produção isso seria restrito ao service_role via API route)
create policy "chat_atualizacao_publica" on chat_messages
  for update to anon using (true) with check (true);

-- 8. Exclusão: qualquer um pode apagar (moderação)
create policy "chat_exclusao_publica" on chat_messages
  for delete to anon using (true);

-- 9. Índice para ordenação
create index if not exists chat_messages_created_at_idx
  on chat_messages (session_id, created_at desc);

-- 10. Confirma
select * from chat_messages limit 5;
