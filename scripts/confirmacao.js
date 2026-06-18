/* ============================================================
   confirmacao.js — Lógica da página "Agendamento Confirmado"
   Responsável por:
     • Ler os dados do agendamento salvos no localStorage
     • Preencher os cards de LOCAL, DATA e HORÁRIO
     • Configurar o botão "Ir pelo Maps" com o endereço real
     • Criar evento no calendário do cliente com lembrete de 30 minutos
     • Limpar o localStorage ao fechar ou voltar ao início
   ============================================================ */

// ─── Configurações da barbearia ──────────────────────────────
// Altere o endereço e a query quando o endereço real estiver definido.
const BARBEARIA = {
  nome: "Medellin Barbearia",
  endereco: "Rua Ana Rosa, 512 A - Maurício de Nassau, Caruaru - PE",
  mapsQuery: "Rua Ana Rosa, 512 A, Maurício de Nassau, Caruaru, PE, Brasil",
};

const DURACAO_PADRAO_MINUTOS = 30;
const LEMBRETE_MINUTOS = 30;

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

// ─── Calendário ──────────────────────────────────────────────

function criarDataHorario(dataISO, hora) {
  return new Date(`${dataISO}T${hora}:00-03:00`);
}

function formatarDataGoogle(data) {
  return data
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function formatarDataIcs(data) {
  return formatarDataGoogle(data);
}

function escaparTextoIcs(texto) {
  return String(texto)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function ehDispositivoAppleMovel() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

//Cria lembrete de 30 minutos antes do horário do agendamento, com título e detalhes do evento.
function montarEventoCalendario(ag) {
  const inicio = criarDataHorario(ag.data, ag.hora);
  const fim = new Date(inicio.getTime() + DURACAO_PADRAO_MINUTOS * 60 * 1000);
  const titulo = "✂️ Meu Corte na Medellin Barbearia";
  const detalhes =
    `Agendamento confirmado para ${ag.cliente}.\n` +
    `Serviço: ${ag.servico}.\n` +
    `Lembrete recomendado: ${LEMBRETE_MINUTOS} minutos antes.`;

  return {
    inicio,
    fim,
    titulo,
    detalhes,
    local: BARBEARIA.endereco,
  };
}

// Abre o Google Calendar com os detalhes do evento preenchidos (em nova aba).
function abrirGoogleCalendar(evento) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.titulo,
    dates: `${formatarDataGoogle(evento.inicio)}/${formatarDataGoogle(evento.fim)}`,
    details: evento.detalhes,
    location: evento.local,
  });

  window.open(
    `https://calendar.google.com/calendar/render?${params}`,
    "_blank",
  );
}

function abrirAppleCalendar(evento) {
  const agora = formatarDataIcs(new Date());
  const uid = `agendamento-${Date.now()}@medellinbarbearia`;
  const conteudo = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Medellin Barbearia//Agendamento//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${agora}`,
    `DTSTART:${formatarDataIcs(evento.inicio)}`,
    `DTEND:${formatarDataIcs(evento.fim)}`,
    `SUMMARY:${escaparTextoIcs(evento.titulo)}`,
    `DESCRIPTION:${escaparTextoIcs(evento.detalhes)}`,
    `LOCATION:${escaparTextoIcs(evento.local)}`,
    "BEGIN:VALARM",
    `TRIGGER:-PT${LEMBRETE_MINUTOS}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${escaparTextoIcs(evento.titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "agendamento-medellin.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function configurarCalendario(ag) {
  document.getElementById("btnCalendario").addEventListener("click", () => {
    const evento = montarEventoCalendario(ag);

    if (ehDispositivoAppleMovel()) {
      abrirAppleCalendar(evento);
      return;
    }

    abrirGoogleCalendar(evento);
  });
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

  // 4. Botão para adicionar o evento ao calendário
  configurarCalendario(ag);

  // 5. Botões de navegação (X e Voltar para o Início)
  configurarNavegacao();
});
