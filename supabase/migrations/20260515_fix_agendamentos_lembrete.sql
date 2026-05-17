-- Correção para o erro:
-- Could not find the 'lembrete_enviado' column of 'agendamentos' in the schema cache
--
-- Execute este arquivo no Supabase Dashboard -> SQL Editor.
-- Ele e seguro para rodar mais de uma vez por causa do IF NOT EXISTS.

ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS lembrete_enviado BOOLEAN NOT NULL DEFAULT FALSE;
