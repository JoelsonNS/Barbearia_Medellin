/* ============================================================
   login.js — Autenticação do barbeiro via Supabase Auth
   Fluxo: preenche form → signInWithPassword → redireciona
          para agenda.html se credenciais corretas.
   ============================================================ */

// ─── Cliente Supabase ────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// "supabase" é o objeto global carregado pelo CDN no login.html
const db = supabase.createClient(supabaseUrl, supabaseKey);

// ─── Referências ao DOM ──────────────────────────────────────
const form = document.getElementById("loginForm");
const btnEntrar = form.querySelector(".login-button");

// ─── Exibição de erro inline (sem alert) ────────────────────
/**
 * Cria ou atualiza o parágrafo de erro abaixo dos campos.
 * @param {string} mensagem
 */
function exibirErro(mensagem) {
  let erro = document.getElementById("loginErro");

  // Cria o elemento apenas na primeira vez
  if (!erro) {
    erro = document.createElement("p");
    erro.id = "loginErro";
    erro.className = "login-error";
    // Insere acima do botão Entrar
    form.insertBefore(erro, btnEntrar);
  }

  erro.textContent = mensagem;
}

/** Remove a mensagem de erro da tela */
function limparErro() {
  const erro = document.getElementById("loginErro");
  if (erro) erro.textContent = "";
}

// ─── Envio do formulário ─────────────────────────────────────
form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparErro();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Validação básica dos campos
  if (!email || !senha) {
    exibirErro("Preencha e-mail e senha.");
    return;
  }

  // Feedback visual enquanto aguarda a resposta do Supabase
  btnEntrar.disabled = true;
  btnEntrar.innerHTML = "Entrando… <span>⏳</span>";

  // Tenta autenticar no Supabase Auth
  const { error } = await db.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    // Credenciais inválidas ou erro de rede
    exibirErro("E-mail ou senha incorretos. Tente novamente.");
    btnEntrar.disabled = false;
    btnEntrar.innerHTML = "Entrar <span aria-hidden='true'>→</span>";
    return;
  }

  // Login bem-sucedido: redireciona para a agenda do barbeiro
  window.location.replace("agenda.html");
});
