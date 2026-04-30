-- ============================================================
-- Migração: adiciona suporte ao lembrete de WhatsApp
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Adicionar colunas na tabela agendamentos
ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS lembrete_enviado BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Habilitar extensões necessárias (caso ainda não estejam ativas)
--    Faça isso em: Supabase Dashboard → Settings → Extensions
--    Ative: pg_cron  e  pg_net

-- 3. Criar o job de lembrete (roda a cada minuto)
--    Substitua <SEU-PROJETO> e <SUA-ANON-KEY> pelos valores reais.
--    Acesse sua anon key em: Supabase Dashboard → Settings → API

SELECT cron.schedule(
  'lembrete-15min',
  '* * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://<SEU-PROJETO>.supabase.co/functions/v1/enviar-lembrete',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer <SUA-ANON-KEY>'
      ),
      body    := '{}'::jsonb
    );
  $$
);

-- Para remover o job futuramente:
-- SELECT cron.unschedule('lembrete-15min');
