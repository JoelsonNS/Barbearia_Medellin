/* ============================================================
   pagamento.js — Lógica da página de confirmação do agendamento
   Responsável por:
     • Ler os dados do agendamento salvos no localStorage
     • Preencher o resumo na tela
     • Salvar o agendamento no Supabase ao finalizar
     • Limpar o localStorage e redirecionar para home
   ============================================================ */

// ─── Preços dos serviços (deve bater com os do servicos.html) ─
// Usado apenas para exibir o valor estimado no resumo.
const PRECOS = {
  "Corte Social": 20,
  Degradê: 25,
  "Barba e Cabelo": 40,
};

// ─── Supabase ───────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Variaveis do Supabase nao foram carregadas.", {
    supabaseUrl,
    supabaseKey: supabaseKey ? "[ok]" : undefined,
  });
  alert(
    "As configuracoes do Supabase nao foram carregadas. Verifique o arquivo .env e reinicie o servidor.",
  );
}

const db = supabase.createClient(supabaseUrl, supabaseKey);

// ─── Leitura dos dados do agendamento ───────────────────────

/**
 * Lê os dados salvos pelo servicos.js no localStorage.
 * Se não houver dados, redireciona de volta para serviços.
 */
function lerDadosAgendamento() {
  const raw = localStorage.getItem("agendamentoPendente");

  if (!raw) {
    alert("Nenhum agendamento em andamento. Redirecionando...");
    window.location.replace("servicos.html");
    return null;
  }

  return JSON.parse(raw);
}

// ─── Preenchimento do resumo ─────────────────────────────────

/**
 * Formata "YYYY-MM-DD" para exibição humana: "28/04/2026".
 * @param {string} dataISO
 * @returns {string}
 */
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function horarioJaPassou(dataISO, hora) {
  if (!dataISO || !hora) return true;

  const dataHorario = new Date(`${dataISO}T${hora}:00`);
  return dataHorario <= new Date();
}

/**
 * Preenche os elementos do resumo com os dados do agendamento.
 */
function preencherResumo(ag) {
  document.getElementById("resumoServico").textContent = ag.servico;
  document.getElementById("resumoData").textContent = formatarData(ag.data);
  document.getElementById("resumoHora").textContent = ag.hora;

  const preco = PRECOS[ag.servico];
  document.getElementById("resumoPreco").textContent = preco
    ? `R$ ${preco.toFixed(2).replace(".", ",")}`
    : "R$ —";
}

// ─── Gravar agendamento no banco ────────────────────────────

async function salvarAgendamento(ag) {
  try {
    if (horarioJaPassou(ag.data, ag.hora)) {
      alert("Este horario ja passou. Escolha outro horario disponivel.");
      return false;
    }

    const { data: existente, error: erroBusca } = await db
      .from("agendamentos")
      .select("id")
      .eq("dados", ag.data)
      .eq("hora", ag.hora);

    if (erroBusca) {
      console.error("Erro ao consultar agendamento existente:", erroBusca);
      alert("Nao foi possivel verificar os horarios disponiveis.");
      return false;
    }

    if (existente && existente.length > 0) {
      alert(
        "Este horario acabou de ser agendado por outra pessoa. Escolha outro horario.",
      );
      return false;
    }

    const { error } = await db.from("agendamentos").insert([
      {
        servico: ag.servico,
        dados: ag.data,
        hora: ag.hora,
        cliente: ag.cliente,
        telefone: ag.telefone ?? null,
        lembrete_enviado: false,
      },
    ]);

    if (error) {
      console.error("Erro real do Supabase:", error);
      alert("Erro ao finalizar agendamento: " + error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Falha de rede ao salvar agendamento:", error);
    alert(
      "Nao foi possivel conectar ao Supabase. Verifique sua internet, extensoes do navegador ou bloqueios de rede.",
    );
    return false;
  }
}

// ─── Finalizar agendamento ───────────────────────────────────

/**
 * Ao clicar em "Finalizar Agendamento":
 * - Salva o agendamento no Supabase
 * - Remove os dados pendentes do localStorage
 * - Redireciona para a página inicial
 */
function inicializarBotaoFinalizar(ag) {
  const btn = document.getElementById("btnFinalizar");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Finalizando...";

    const sucesso = await salvarAgendamento(ag);

    if (!sucesso) {
      btn.disabled = false;
      btn.textContent = "Finalizar Agendamento";
      return;
    }

    // Salva os dados com a chave esperada pela página de confirmação
    localStorage.setItem("agendamentoConfirmado", JSON.stringify(ag));

    // Remove a chave do agendamento pendente
    localStorage.removeItem("agendamentoPendente");

    // Redireciona para a página de confirmação (tela de sucesso)
    window.location.replace("confirmacao.html");
  });
}

// ─── Inicialização ───────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const ag = lerDadosAgendamento();
  if (!ag) return;

  preencherResumo(ag);
  inicializarBotaoFinalizar(ag);
});
