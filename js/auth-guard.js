/* ============================================================
   auth-guard.js — Proteção de rota para páginas restritas
   Deve ser o PRIMEIRO import em qualquer JS da área do barbeiro.

   O que faz:
     1. Cria o cliente Supabase (exporta para outros módulos)
     2. Consulta a sessão ativa do usuário
     3. Se não houver sessão → redireciona para login.html
   ============================================================ */

// ─── Cliente Supabase compartilhado ─────────────────────────
// "supabase" é o objeto global carregado pelo CDN no HTML.
// Exportamos "db" para que agenda.js não precise criar outro cliente.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const db = supabase.createClient(supabaseUrl, supabaseKey);

// ─── Verificação de sessão (top-level await) ─────────────────
// Bloqueia a execução do módulo que importou este arquivo até
// confirmar que o barbeiro está autenticado.
const {
  data: { session },
} = await db.auth.getSession();

if (!session) {
  // Sem sessão válida: redireciona e interrompe tudo
  window.location.replace("login.html");
}

// Exporta a sessão caso outros módulos precisem de dados do usuário
export { session };
