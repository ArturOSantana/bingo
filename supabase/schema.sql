-- =====================================================
-- Execute este script completo no SQL Editor do Supabase
-- Projeto: https://supabase.com/dashboard/project/faeafcbtddquvuipflsd/sql
-- =====================================================

-- 1. Cria a tabela (se não existir)
create table if not exists bingo_session (
  id text primary key,
  drawn_numbers integer[] default '{}',
  remaining_numbers integer[] default '{}',
  prize text default '',
  game_status text default 'waiting' check (game_status in ('waiting', 'playing', 'paused', 'finished')),
  last_drawn integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Habilita Realtime (ignora se já estiver na publicação)
do $$ begin
  alter publication supabase_realtime add table bingo_session;
exception when duplicate_object then null;
end $$;

-- 3. Habilita RLS
alter table bingo_session enable row level security;

-- 4. Remove políticas antigas se existirem
drop policy if exists "leitura_publica" on bingo_session;
drop policy if exists "insercao_publica" on bingo_session;
drop policy if exists "atualizacao_publica" on bingo_session;

-- 5. Cria políticas: leitura e escrita públicas para anon
create policy "leitura_publica" on bingo_session
  for select to anon using (true);

create policy "insercao_publica" on bingo_session
  for insert to anon with check (true);

create policy "atualizacao_publica" on bingo_session
  for update to anon using (true) with check (true);

-- 6. Insere a sessão inicial
insert into bingo_session (id, drawn_numbers, remaining_numbers, prize, game_status, last_drawn)
values (
  'main',
  '{}',
  array(select generate_series(1, 75)),
  '',
  'waiting',
  null
)
on conflict (id) do nothing;

-- 7. Confirma
select * from bingo_session;
