/* ============================================================
   confirmacao.js — Lógica da página "Agendamento Confirmado"
   Responsável por:
     • Ler os dados do agendamento salvos no localStorage
     • Preencher os cards de LOCAL, DATA e HORÁRIO
     • Configurar o botão "Ir pelo Maps" com o endereço real
     • Limpar o localStorage ao fechar ou voltar ao início
   ============================================================ */

// ─── Configurações da barbearia ──────────────────────────────
// Altere o endereço e a query quando o endereço real estiver definido.
const BARBEARIA = {
  nome: "Medellin Barbearia",
  endereco: "Recife - PE",
  mapsQuery: "Medellin+Barbearia+Recife+PE",
};

// ─── Leitura dos dados ───────────────────────────────────────

/**
 * Lê os dados do agendamento salvo em localStorage pelo pagamento.js.
 * Se não houver dados, redireciona para a página inicial.
 */
function lerDados() {
  const raw = localStorage.getItem("agendamentoConfirmado");
  if (!raw) {
    // Acesso direto sem passar pelo fluxo: volta para home
    window.location.replace("index.html");
    return null;
  }
  return JSON.parse(raw);
}

// ─── Formatação de data ──────────────────────────────────────

/**
 * Converte "YYYY-MM-DD" para "24 de Outubro" (formato do print).
 * @param {string} dataISO
 * @returns {string}
 */
function formatarDataExtenso(dataISO) {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const [, mes, dia] = dataISO.split("-");
  return `${Number(dia)} de ${meses[Number(mes) - 1]}`;
}

// ─── Preenchimento dos cards ─────────────────────────────────

/**
 * Preenche os elementos da tela com os dados do agendamento.
 * @param {{ servico: string, data: string, hora: string }} ag
 */
function preencherCards(ag) {
  // Card LOCAL: nome fixo da barbearia
  document.getElementById("detalhesLocal").textContent = BARBEARIA.nome;

  // Card DATA: "29 de Abril"
  document.getElementById("detalhesData").textContent = formatarDataExtenso(
    ag.data,
  );

  // Card HORÁRIO: ex. "14:30"
  document.getElementById("detalhesHora").textContent = ag.hora;

  // Endereço no rodapé do mapa
  document.getElementById("enderecoTexto").textContent = BARBEARIA.endereco;
}

// ─── Mapa e link Maps ────────────────────────────────────────

/**
 * Injeta o src no iframe do mapa e configura o href do botão Maps.
 * Usa Google Maps embed (sem chave de API necessária para embed básico).
 */
function configurarMapa() {
  const query = encodeURIComponent(BARBEARIA.mapsQuery);

  // Embed do Google Maps dentro do iframe
  document.getElementById("mapaEmbed").src =
    `https://www.google.com/maps?q=${query}&output=embed`;

  // Botão "Ir pelo Maps" abre o app/site do Maps diretamente
  document.getElementById("btnMaps").href =
    `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// ─── Limpeza e navegação ─────────────────────────────────────

/** Remove a chave do agendamento confirmado do localStorage. */
function limpar() {
  localStorage.removeItem("agendamentoConfirmado");
}

/**
 * Configura o botão X e o link "Voltar para o Início":
 * ambos limpam o localStorage e redirecionam para home.
 */
function configurarNavegacao() {
  document.getElementById("btnFechar").addEventListener("click", () => {
    limpar();
    window.location.replace("index.html");
  });

  document.getElementById("btnVoltar").addEventListener("click", () => {
    limpar();
    window.location.replace("index.html");
  });
}

// ─── Inicialização ───────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // 1. Lê os dados (redireciona para home se não houver)
  const ag = lerDados();
  if (!ag) return;

  // 2. Preenche os cards com os dados do agendamento
  preencherCards(ag);

  // 3. Configura o mapa embed e o link do botão Maps
  configurarMapa();

  // 4. Botões de navegação (X e Voltar para o Início)
  configurarNavegacao();
});
