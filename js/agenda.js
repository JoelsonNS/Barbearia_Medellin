/* ============================================================
   agenda.js — Lógica principal da página "Minha Agenda"
   Responsável por:
     • Gerar os cards de dias dinamicamente a partir de hoje
     • Renderizar agendamentos filtrados por dia
     • Atualizar o contador de atendimentos no cabeçalho
   ============================================================ */

// ─── Dados de agendamentos ───────────────────────────────────
// Cada entrada usa a data no formato "YYYY-MM-DD" como chave.
// Em um projeto real esses dados viriam de uma API/back-end.
const agendamentos = {
  [getDataFormatada(0)]: [
    {
      nome: "Ricardo Oliveira",
      servico: "Corte Social",
      icone: "bi-scissors",
      horario: "09:00",
      foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    },
    {
      nome: "Marcus Vinícius",
      servico: "Barba Premium",
      icone: "bi-brush",
      horario: "10:30",
      foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    },
    {
      nome: "Fernando Costa",
      servico: "Corte & Barba",
      icone: "bi-scissors",
      horario: "14:00",
      foto: null, // sem foto — exibe ícone placeholder
    },
    {
      nome: "André Santos",
      servico: "Limpeza de Pele",
      icone: "bi-emoji-sunglasses",
      horario: "16:30",
      foto: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
    },
    {
      nome: "Paulo Henrique",
      servico: "Corte Social",
      icone: "bi-scissors",
      horario: "18:00",
      foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
  ],
  [getDataFormatada(1)]: [
    {
      nome: "Carlos Mendes",
      servico: "Barba Premium",
      icone: "bi-brush",
      horario: "08:30",
      foto: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=300&q=80",
    },
    {
      nome: "Thiago Lima",
      servico: "Corte & Barba",
      icone: "bi-scissors",
      horario: "11:00",
      foto: null,
    },
    {
      nome: "Gabriel Rocha",
      servico: "Corte Social",
      icone: "bi-scissors",
      horario: "15:00",
      foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
    },
  ],
  [getDataFormatada(2)]: [
    {
      nome: "Roberto Alves",
      servico: "Limpeza de Pele",
      icone: "bi-emoji-sunglasses",
      horario: "10:00",
      foto: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=300&q=80",
    },
    {
      nome: "Eduardo Nunes",
      servico: "Corte Social",
      icone: "bi-scissors",
      horario: "13:30",
      foto: null,
    },
  ],
  // Demais dias ficam sem agendamentos — exibirá estado "vazio"
};

// ─── Helpers de data ─────────────────────────────────────────

/**
 * Retorna a data de hoje + `offsetDias` no formato "YYYY-MM-DD".
 * @param {number} offsetDias - Quantos dias a partir de hoje (0 = hoje)
 * @returns {string}
 */
function getDataFormatada(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  // Monta o formato ISO sem fuso horário para evitar deslocamentos
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata uma data "YYYY-MM-DD" para exibição nos cards de agendamento,
 * ex.: "14 OUT 2023".
 * @param {string} dataISO
 * @returns {string}
 */
function formatarDataExibicao(dataISO) {
  const meses = [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ];
  const [ano, mes, dia] = dataISO.split("-");
  return `${Number(dia)} ${meses[Number(mes) - 1]} ${ano}`;
}

// ─── Geração dos cards de dias ───────────────────────────────

/** Nomes abreviados dos dias da semana (0 = domingo) */
const NOMES_DIA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

/**
 * Gera e insere os botões de dias no slider.
 * Cria 7 dias a partir de hoje.
 * @param {string} dataAtiva - Chave "YYYY-MM-DD" do dia selecionado
 */
function renderizarSliderDias(dataAtiva) {
  const slider = document.querySelector(".days-slider");
  slider.innerHTML = ""; // limpa cards anteriores antes de re-renderizar

  for (let i = 0; i < 7; i++) {
    const dataISO = getDataFormatada(i);
    const dataObj = new Date(dataISO + "T00:00:00"); // força horário local

    const nomeDia = i === 0 ? "HOJE" : NOMES_DIA[dataObj.getDay()];
    const numeroDia = dataObj.getDate();
    const ativo = dataISO === dataAtiva ? "active" : "";

    // Cria o botão com os spans internos
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `day-card ${ativo}`.trim();
    btn.dataset.data = dataISO; // armazena a chave de data no elemento
    btn.setAttribute("aria-label", `${nomeDia} dia ${numeroDia}`);
    btn.innerHTML = `
      <span class="day-name">${nomeDia}</span>
      <span class="day-number">${numeroDia}</span>
    `;

    slider.appendChild(btn);
  }
}

// ─── Renderização dos agendamentos ──────────────────────────

/**
 * Cria o HTML de um único card de agendamento.
 * @param {Object} ag - Objeto de agendamento
 * @param {string} dataISO - Data no formato "YYYY-MM-DD" para exibição
 * @returns {string} HTML do <article>
 */
function criarCardAgendamento(ag, dataISO) {
  // Define o bloco de avatar: foto ou ícone placeholder
  const avatarHTML = ag.foto
    ? `<img src="${ag.foto}" alt="${ag.nome}" loading="lazy" />`
    : `<i class="bi bi-person-fill"></i>`;

  const classeAvatar = ag.foto ? "client-avatar" : "client-avatar placeholder";
  const dataExibicao = formatarDataExibicao(dataISO);

  return `
    <article class="appointment-card">
      <div class="${classeAvatar}">
        ${avatarHTML}
      </div>

      <div class="appointment-info">
        <h2>${ag.nome}</h2>
        <p class="service">
          <i class="bi ${ag.icone}"></i>
          ${ag.servico}
        </p>
      </div>

      <div class="appointment-time">
        <strong>${ag.horario}</strong>
        <span>${dataExibicao}</span>
      </div>
    </article>
  `;
}

/**
 * Exibe o estado vazio quando não há agendamentos no dia selecionado.
 * @returns {string} HTML do aviso
 */
function criarEstadoVazio() {
  return `
    <div class="empty-state" role="status" aria-live="polite">
      <i class="bi bi-calendar-x"></i>
      <p>Nenhum atendimento para este dia.</p>
    </div>
  `;
}

/**
 * Renderiza a lista de agendamentos do dia selecionado e
 * atualiza o contador no bloco de título.
 * @param {string} dataISO - Data no formato "YYYY-MM-DD"
 */
function renderizarAgendamentos(dataISO) {
  const lista = document.querySelector(".appointments-list");
  const contadorSpan = document.querySelector(".agenda-title-block span");

  // Busca os agendamentos do dia; retorna array vazio se não existir
  const registros = agendamentos[dataISO] ?? [];

  // Atualiza o contador no subtítulo
  const total = registros.length;
  contadorSpan.textContent = `${total} ${total === 1 ? "atendimento" : "atendimentos"}`;

  // Renderiza os cards ou o estado vazio
  if (total === 0) {
    lista.innerHTML = criarEstadoVazio();
  } else {
    lista.innerHTML = registros
      .map((ag) => criarCardAgendamento(ag, dataISO))
      .join("");
  }
}

// ─── Delegação de eventos ────────────────────────────────────

/**
 * Registra o listener de clique no slider de dias usando delegação de eventos.
 * Ao clicar em um day-card, atualiza o estado ativo e re-renderiza os dados.
 */
function inicializarSliderDias() {
  const slider = document.querySelector(".days-slider");

  slider.addEventListener("click", (evento) => {
    // Garante que o clique foi em um day-card (ou em elemento filho dele)
    const card = evento.target.closest(".day-card");
    if (!card) return;

    const dataSelecionada = card.dataset.data;

    // Remove a classe active do card anterior e aplica no novo
    slider.querySelectorAll(".day-card").forEach((btn) => {
      btn.classList.remove("active");
    });
    card.classList.add("active");

    // Garante que o card ativo fique visível no scroll horizontal
    card.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    // Re-renderiza os agendamentos com o novo dia
    renderizarAgendamentos(dataSelecionada);
  });
}

// ─── Inicialização ───────────────────────────────────────────

/**
 * Ponto de entrada da aplicação.
 * Executado quando o DOM estiver completamente carregado.
 */
document.addEventListener("DOMContentLoaded", () => {
  const dataHoje = getDataFormatada(0); // chave do dia atual

  renderizarSliderDias(dataHoje); // monta os botões de dias
  renderizarAgendamentos(dataHoje); // exibe os agendamentos de hoje
  inicializarSliderDias(); // ativa os eventos de clique
});
