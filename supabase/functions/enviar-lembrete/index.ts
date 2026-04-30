// ============================================================
// enviar-lembrete/index.ts — Supabase Edge Function
//
// Disparada pelo pg_cron a cada minuto.
// Busca agendamentos que ocorrem em ~15 min e ainda não
// receberam lembrete, e envia mensagem via Z-API (WhatsApp).
//
// Variáveis de ambiente necessárias (configure em
// Supabase Dashboard → Edge Functions → Secrets):
//   ZAPI_INSTANCE_ID   — ID da instância Z-API
//   ZAPI_TOKEN         — Token da instância Z-API
//   ZAPI_CLIENT_TOKEN  — Client-Token de segurança Z-API
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Timezone Brasil ─────────────────────────────────────────
// Recife / Brasília: UTC-3 (sem horário de verão)
function agora_brasil(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Recife" }),
  );
}

// ─── Handler principal ───────────────────────────────────────
Deno.serve(async (_req) => {
  // Credenciais injetadas automaticamente pelo Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Credenciais Z-API
  const zapiInstanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const zapiToken = Deno.env.get("ZAPI_TOKEN");
  const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!zapiInstanceId || !zapiToken || !zapiClientToken) {
    return new Response(
      JSON.stringify({ erro: "Secrets do Z-API não configurados." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = createClient(supabaseUrl, serviceKey);

  // ── Janela de 15 min (±30 s de tolerância) ───────────────
  const agora = agora_brasil();
  const em15 = new Date(agora.getTime() + 15 * 60 * 1000);

  const dataAlvo = [
    em15.getFullYear(),
    String(em15.getMonth() + 1).padStart(2, "0"),
    String(em15.getDate()).padStart(2, "0"),
  ].join("-");

  const horaAlvo = [
    String(em15.getHours()).padStart(2, "0"),
    String(em15.getMinutes()).padStart(2, "0"),
  ].join(":");

  // ── Buscar agendamentos na janela ─────────────────────────
  const { data: agendamentos, error } = await db
    .from("agendamentos")
    .select("id, cliente, servico, hora, telefone")
    .eq("dados", dataAlvo)
    .eq("hora", horaAlvo)
    .eq("lembrete_enviado", false)
    .not("telefone", "is", null);

  if (error) {
    return new Response(JSON.stringify({ erro: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resultados: { cliente: string; status: string }[] = [];

  for (const ag of agendamentos ?? []) {
    // Normaliza o telefone: apenas dígitos + prefixo 55 (Brasil)
    let fone = String(ag.telefone).replace(/\D/g, "");
    if (!fone.startsWith("55")) fone = "55" + fone;

    const mensagem =
      `✂️ *Medellin Barbearia*\n\n` +
      `Olá, ${ag.cliente}! Seu horário de *${ag.servico}* começa em *15 minutos* (${ag.hora}).\n\n` +
      `Te esperamos! 💈`;

    const res = await fetch(
      `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Token": zapiClientToken,
        },
        body: JSON.stringify({ phone: fone, message: mensagem }),
      },
    );

    if (res.ok) {
      // Marca como enviado para não reenviar
      await db
        .from("agendamentos")
        .update({ lembrete_enviado: true })
        .eq("id", ag.id);

      resultados.push({ cliente: ag.cliente, status: "enviado" });
    } else {
      const corpo = await res.text();
      resultados.push({ cliente: ag.cliente, status: `falhou: ${corpo}` });
    }
  }

  return new Response(
    JSON.stringify({ processados: resultados.length, resultados }),
    { headers: { "Content-Type": "application/json" } },
  );
});
