-- =====================================================
-- Migração: adiciona status "farewell" ao bingo_session
-- Execute no SQL Editor do Supabase
-- =====================================================

-- O PostgreSQL não permite ALTER de constraint CHECK diretamente.
-- A solução é dropar e recriar.

-- 1. Remove o constraint antigo (nome gerado pelo Postgres)
alter table bingo_session
  drop constraint if exists bingo_session_game_status_check;

-- 2. Recria com "farewell" incluído
alter table bingo_session
  add constraint bingo_session_game_status_check
  check (game_status in ('waiting', 'playing', 'paused', 'finished', 'farewell'));

-- 3. Confirma
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'bingo_session'::regclass
  and contype = 'c';
