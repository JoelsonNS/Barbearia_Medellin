/* ============================================================
   pagamento.js — Lógica da página de confirmação do agendamento
   Responsável por:
     • Ler os dados do agendamento salvos no localStorage
     • Preencher o resumo na tela
     • Notificar o barbeiro via WhatsApp ao finalizar
     • Limpar o localStorage e redirecionar para home
   ============================================================ */

// ─── Preços dos serviços (deve bater com os do servicos.html) ─
// Usado apenas para exibir o valor estimado no resumo.
const PRECOS = {
  "Corte Social": 20,
  Degradê: 25,
  "Barba e Cabelo": 40,
};

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

// ─── Notificação ao barbeiro via WhatsApp ────────────────────

/**
 * Abre o WhatsApp com uma mensagem pré-preenchida para o barbeiro.
 */
function notificarWhatsApp(ag) {
  const telefone = "5581981222018";
  const dataFormatada = formatarData(ag.data);

  const mensagem = `📅 NOVO AGENDAMENTO

👤 Cliente: ${ag.cliente}
✂ Serviço: ${ag.servico}
📆 Data: ${dataFormatada}
⏰ Hora: ${ag.hora}

💰 Pagamento: na chegada`;

  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

// ─── Finalizar agendamento ───────────────────────────────────

/**
 * Ao clicar em "Finalizar Agendamento":
 * - Notifica o barbeiro via WhatsApp
 * - Remove os dados pendentes do localStorage
 * - Redireciona para a página inicial
 */
function inicializarBotaoFinalizar(ag) {
  const btn = document.getElementById("btnFinalizar");

  btn.addEventListener("click", () => {
    // Notifica o barbeiro via WhatsApp
    notificarWhatsApp(ag);

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
