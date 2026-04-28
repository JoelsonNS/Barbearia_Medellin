/* ============================================================
   agenda.js — Agenda do barbeiro conectada ao Supabase
   Responsável por:
     • Verificar autenticação (sessão ativa do barbeiro)
     • Buscar agendamentos do dia selecionado no banco
     • Renderizar os cards com dados reais
     • Atualizar em tempo real via Supabase Realtime
   ============================================================ */

// ─── Cliente Supabase ────────────────────────────────────────
// "supabase" é o objeto global injetado pelo CDN no agenda.html.
// Mesmo padrão utilizado no servicos.js.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

const db = supabase.createClient(supabaseUrl, supabaseKey);

// ─── Mapeamento de serviço → ícone Bootstrap Icons ──────────
/**
 * Retorna a classe de ícone correspondente ao nome do serviço.
 * @param {string} servico
 * @returns {string}
 */
function iconeDoServico(servico) {
  const nome = servico.toLowerCase();
  if (nome.includes("barba")) return "bi-brush";
  if (nome.includes("pele") || nome.includes("limpeza"))
    return "bi-emoji-sunglasses";
  return "bi-scissors"; // padrão para cortes
}

// ─── Helpers de data ─────────────────────────────────────────

/**
 * Retorna a data de hoje + offsetDias no formato "YYYY-MM-DD".
 * @param {number} offsetDias
 * @returns {string}
 */
function getDataFormatada(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata "YYYY-MM-DD" para exibição humana, ex.: "28 ABR 2026".
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

// ─── Slider de dias ──────────────────────────────────────────

const NOMES_DIA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

/**
 * Gera os botões de dias (hoje + 6 dias) no slider.
 * @param {string} dataAtiva - "YYYY-MM-DD" do dia selecionado
 */
function renderizarSliderDias(dataAtiva) {
  const slider = document.querySelector(".days-slider");
  slider.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const dataISO = getDataFormatada(i);
    const dataObj = new Date(dataISO + "T00:00:00");

    const nomeDia = i === 0 ? "HOJE" : NOMES_DIA[dataObj.getDay()];
    const numeroDia = dataObj.getDate();
    const ativo = dataISO === dataAtiva ? "active" : "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `day-card ${ativo}`.trim();
    btn.dataset.data = dataISO;
    btn.setAttribute("aria-label", `${nomeDia} dia ${numeroDia}`);
    btn.innerHTML = `
      <span class="day-name">${nomeDia}</span>
      <span class="day-number">${numeroDia}</span>
    `;

    slider.appendChild(btn);
  }
}

// ─── Busca no banco ──────────────────────────────────────────

/**
 * Consulta o Supabase buscando todos os agendamentos da data.
 * A coluna de data no banco se chama "dados" (definida no schema).
 * @param {string} dataISO - "YYYY-MM-DD"
 * @returns {Promise<Array>}
 */
async function buscarAgendamentos(dataISO) {
  // Log de diagnóstico: mostra exatamente o que está sendo consultado
  console.log("[agenda] buscando agendamentos para a data:", dataISO);

  const { data, error } = await db
    .from("agendamentos")
    .select("*")
    .eq("dados", dataISO) // "dados" é o nome da coluna de data no banco
    .order("hora", { ascending: true }); // ordena por horário crescente

  // Log de diagnóstico: mostra o retorno bruto do Supabase
  console.log("[agenda] resultado do Supabase →", { data, error });

  if (error) {
    console.error("Erro ao buscar agendamentos:", error.message);
    return { registros: [], erro: error.message };
  }

  return { registros: data ?? [], erro: null };
}

// ─── Renderização dos cards ──────────────────────────────────

/**
 * Cria o HTML de um card de agendamento a partir de um registro do banco.
 * @param {Object} registro - Linha da tabela agendamentos
 * @returns {string}
 */
function criarCardAgendamento(registro) {
  const dataExibicao = formatarDataExibicao(registro.dados);
  const icone = iconeDoServico(registro.servico);

  // Sem URL de foto no banco: usa sempre o ícone placeholder
  return `
    <article class="appointment-card">
      <div class="client-avatar placeholder">
        <i class="bi bi-person-fill"></i>
      </div>

      <div class="appointment-info">
        <h2>${registro.cliente}</h2>
        <p class="service">
          <i class="bi ${icone}"></i>
          ${registro.servico}
        </p>
      </div>

      <div class="appointment-time">
        <strong>${registro.hora}</strong>
        <span>${dataExibicao}</span>
      </div>
    </article>
  `;
}

/** HTML exibido quando o dia não tem agendamentos */
function criarEstadoVazio() {
  return `
    <div class="empty-state" role="status" aria-live="polite">
      <i class="bi bi-calendar-x"></i>
      <p>Nenhum atendimento para este dia.</p>
    </div>
  `;
}

/** HTML exibido enquanto os dados estão sendo buscados */
function criarEstadoCarregando() {
  return `
    <div class="empty-state" role="status" aria-live="polite">
      <i class="bi bi-hourglass-split"></i>
      <p>Carregando agendamentos…</p>
    </div>
  `;
}

/**
 * HTML exibido quando ocorre um erro ao buscar os dados.
 * Mostra a mensagem de erro para facilitar o diagnóstico.
 * @param {string} mensagemErro
 */
function criarEstadoErro(mensagemErro) {
  return `
    <div class="empty-state" role="alert" aria-live="assertive">
      <i class="bi bi-exclamation-triangle"></i>
      <p>Erro ao carregar agendamentos.</p>
      <small style="color:#f87171;font-size:13px;margin-top:8px;display:block">${mensagemErro}</small>
    </div>
  `;
}

/**
 * Busca os agendamentos no Supabase e renderiza na tela.
 * Também atualiza o contador no subtítulo.
 * @param {string} dataISO
 */
async function renderizarAgendamentos(dataISO) {
  const lista = document.querySelector(".appointments-list");
  const contadorSpan = document.querySelector(".agenda-title-block span");

  // Mostra feedback de carregamento enquanto aguarda o banco
  lista.innerHTML = criarEstadoCarregando();

  const { registros, erro } = await buscarAgendamentos(dataISO);

  // Se houve erro na consulta, exibe mensagem visível na tela
  if (erro) {
    lista.innerHTML = criarEstadoErro(erro);
    contadorSpan.textContent = "0 atendimentos";
    return;
  }

  const total = registros.length;

  // Atualiza o contador no subtítulo "Você tem X atendimentos para hoje"
  contadorSpan.textContent = `${total} ${total === 1 ? "atendimento" : "atendimentos"}`;

  // Renderiza os cards ou o estado vazio
  if (total === 0) {
    lista.innerHTML = criarEstadoVazio();
  } else {
    lista.innerHTML = registros.map(criarCardAgendamento).join("");
  }
}

// ─── Delegação de eventos do slider ─────────────────────────

/**
 * Registra o clique no slider com delegação de eventos.
 * Ao trocar de dia, busca novos dados no banco.
 */
function inicializarSliderDias() {
  const slider = document.querySelector(".days-slider");

  slider.addEventListener("click", (evento) => {
    const card = evento.target.closest(".day-card");
    if (!card) return;

    const dataSelecionada = card.dataset.data;

    // Atualiza classe active
    slider.querySelectorAll(".day-card").forEach((btn) => {
      btn.classList.remove("active");
    });
    card.classList.add("active");

    // Scroll suave para manter o card visível
    card.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    renderizarAgendamentos(dataSelecionada);
  });
}

// ─── Drag-to-scroll no slider (desktop) ─────────────────────

/**
 * Permite arrastar o slider horizontalmente com o mouse no desktop.
 * No mobile o scroll nativo por toque já funciona via CSS.
 */
function inicializarDragScroll() {
  const slider = document.querySelector(".days-slider");

  let arrastando = false; // indica se o botão do mouse está pressionado
  let inicioX = 0; // posição X do mouse no momento do clique
  let scrollInicio = 0; // scrollLeft do slider no momento do clique

  // Inicia o arraste ao pressionar o botão do mouse
  slider.addEventListener("mousedown", (e) => {
    arrastando = true;
    inicioX = e.pageX - slider.offsetLeft;
    scrollInicio = slider.scrollLeft;
    slider.style.cursor = "grabbing"; // muda cursor para indicar arraste
    slider.style.userSelect = "none"; // evita seleção de texto durante arraste
  });

  // Encerra o arraste ao soltar ou sair do elemento
  const pararArraste = () => {
    arrastando = false;
    slider.style.cursor = "grab";
    slider.style.userSelect = "";
  };
  slider.addEventListener("mouseup", pararArraste);
  slider.addEventListener("mouseleave", pararArraste);

  // Move o scroll proporcional ao movimento do mouse
  slider.addEventListener("mousemove", (e) => {
    if (!arrastando) return;
    e.preventDefault(); // impede seleção de texto acidental
    const x = e.pageX - slider.offsetLeft;
    const distancia = (x - inicioX) * 1.5; // multiplicador para scroll mais ágil
    slider.scrollLeft = scrollInicio - distancia;
  });

  // Cursor grab padrão ao hover (indica que é arrastável)
  slider.style.cursor = "grab";
}

// ─── Logout ──────────────────────────────────────────────────

/**
 * Encerra a sessão do Supabase ao clicar no botão voltar.
 * Sem signOut(), o Supabase manteria a sessão mesmo após sair da página.
 */
function inicializarLogout() {
  const btnVoltar = document.querySelector(".back-button");
  if (!btnVoltar) return;

  btnVoltar.addEventListener("click", async (evento) => {
    evento.preventDefault(); // impede navegação imediata
    await db.auth.signOut(); // encerra a sessão no Supabase
    window.location.replace("login.html");
  });
}

// ─── Realtime: atualização automática ────────────────────────

/**
 * Escuta novos INSERTs na tabela e re-renderiza a lista
 * automaticamente se o dia ativo for o afetado.
 */
function inicializarRealtime() {
  db.channel("agenda-realtime")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "agendamentos" },
      () => {
        // Pega o dia atualmente ativo na tela e re-busca os dados
        const cardAtivo = document.querySelector(".day-card.active");
        if (cardAtivo) {
          renderizarAgendamentos(cardAtivo.dataset.data);
        }
      },
    )
    .subscribe();
}

// ─── Inicialização ───────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  // ── Verificação de sessão ─────────────────────────────────
  // Se o barbeiro não estiver logado, redireciona para o login.
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }

  const dataHoje = getDataFormatada(0);

  renderizarSliderDias(dataHoje);         // monta os botões de dias
  await renderizarAgendamentos(dataHoje); // busca dados reais do banco
  inicializarSliderDias();                // ativa navegação por dia
  inicializarDragScroll();                // habilita arraste com mouse no desktop
  inicializarLogout();                    // conecta o botão voltar ao signOut
  inicializarRealtime();                  // escuta novos agendamentos ao vivo
});
