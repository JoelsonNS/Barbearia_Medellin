/*==MOSTRAR NOME DO CLIENTE==*/
const nomeCliente = localStorage.getItem("nomeCliente");

if (nomeCliente) {
  document.getElementById("boasVindas").innerHTML =
    `Olá, <span class="nome-cliente">${nomeCliente}</span>! Seja bem vindo.<br><br>Escolha seu serviço, data e horário:`;
}

/*== SUPABASE ==*/
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

//Aqui liga o site ao banco de dados, usando a URL e a Chave.
const db = supabase.createClient(supabaseUrl, supabaseKey);

function formatarDataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function horarioJaPassou(dataISO, hora) {
  if (!dataISO || !hora) return true;

  const dataHorario = new Date(`${dataISO}T${hora}:00`);
  return dataHorario <= new Date();
}

//Verificar se o horario continua disponivel antes de ir para confirmacao
async function verificarHorarioDisponivel(data, hora) {
  try {
    if (horarioJaPassou(data, hora)) {
      alert("Este horario ja passou. Escolha outro horario disponivel.");
      return false;
    }

    //Verificar se o horário já foi agendado
    const { data: existente, error: erroBusca } = await db
      .from("agendamentos")
      .select("*")
      .eq("dados", data)
      .eq("hora", hora);

    if (erroBusca) {
      console.error("Erro ao consultar agendamento existente:", erroBusca);
      alert("Nao foi possivel verificar os horarios disponiveis.");
      return false;
    }

    //Se já existir um agendamento no mesmo horário
    if (existente && existente.length > 0) {
      alert("Este horario ja foi agendado por outra pessoa.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Falha de rede ao verificar horario:", error);
    alert(
      "Nao foi possivel conectar ao Supabase. Verifique sua internet, extensoes do navegador ou bloqueios de rede.",
    );
    return false;
  }
}

/*== BUSCAR HORÁRIOS OCUPADOS NO BANCO ==*/
/* ==========================================
Essa função consulta no Supabase todos os
agendamentos da data selecionada.
========================================== */
async function carregarHorariosOcupados(dataSelecionada) {
  try {
    //Busca no banco todos os agendamentos da data escolhida
    const { data, error } = await db
      .from("agendamentos")
      .select("hora")
      .eq("dados", dataSelecionada);

    //Se ocorrer erro na consulta
    if (error) {
      console.log("Erro ao buscar horarios:", error);
      atualizarDisponibilidadeHorarios(dataSelecionada);
      return;
    }

    const horariosOcupados = data.map((agendamento) => agendamento.hora);
    atualizarDisponibilidadeHorarios(dataSelecionada, horariosOcupados);
  } catch (error) {
    console.error("Falha de rede ao carregar horarios:", error);
    atualizarDisponibilidadeHorarios(dataSelecionada);
  }
}

/*== OBTER DATA SELECIONADA ==*/
/* ========================================== 
Transforma o dia clicado na régua em uma
data no formato YYYY-MM-DD
========================================== */
function obterDataSelecionada() {
  const diaAtivo = document.querySelector(".dia.ativo");

  if (!diaAtivo) return null;

  return diaAtivo.dataset.data;
}

//abrir o whatsapp
function enviarWhatsApp(servico, data, hora, cliente) {
  const telefone = "5581981222018";

  const mensagem = `
📅 NOVO AGENDAMENTO

👤 Cliente: ${cliente}
✂ Serviço: ${servico}
📆 Data: ${data}
⏰ Hora: ${hora}
`;

  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(url);
}

/*==DATAS E HORÁRIOS==*/
//Gerar os 7 dias da semana automáticamente.
const regua = document.getElementById("reguaDatas");

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function gerarDias() {
  const hoje = new Date();

  for (let i = 0; i < 7; i++) {
    const data = new Date();
    data.setDate(hoje.getDate() + i);

    const diaNumero = data.getDate();
    const diaSemana = diasSemana[data.getDay()];

    const botao = document.createElement("button");
    botao.classList.add("dia");
    botao.type = "button";
    botao.dataset.data = formatarDataLocal(data);

    // Destacar o dia atual automaticamente
    if (i === 0) {
      botao.classList.add("ativo");
    }

    botao.innerHTML = `
            <span>${diaSemana}</span>
            <strong>${diaNumero}</strong>
        `;

    //Evento de clique para trocar o dia ativo
    botao.addEventListener("click", () => {
      document
        .querySelectorAll(".dia")
        .forEach((d) => d.classList.remove("ativo"));
      botao.classList.add("ativo");

      atualizarResumo();

      //Busca horários ocupados
      const dataSelecionada = obterDataSelecionada();

      carregarHorariosOcupados(dataSelecionada);
    });

    regua.insertBefore(botao, document.getElementById("abrirCalendario"));
  }
}

//Executar a função de gerar os dias
gerarDias();

/* === LÓGICA DO CALENDÁRIO COMPLETO === */
//Abrir o calendário completo ao cicar no ícone calendário.
const abrirCalendario = document.getElementById("abrirCalendario");
const seletorData = document.getElementById("seletorData");

// impedir selecionar datas passadas
seletorData.min = formatarDataLocal(new Date());

abrirCalendario.addEventListener("click", () => {
  seletorData.showPicker();
});

/* === SELEÇÃO DE HORÁRIOS === */
const horarios = document.querySelectorAll(".hora");

function atualizarDisponibilidadeHorarios(dataSelecionada, horariosOcupados = []) {
  const ocupados = new Set(horariosOcupados);
  const horaAtiva = document.querySelector(".hora.ativo");

  horarios.forEach((botao) => {
    const hora = botao.textContent.trim();
    const passou = horarioJaPassou(dataSelecionada, hora);
    const ocupado = ocupados.has(hora);
    const desabilitado = passou || ocupado;

    botao.classList.toggle("desabilitado", desabilitado);
    botao.disabled = desabilitado;

    if (desabilitado) {
      botao.classList.remove("ativo");
      botao.title = "Horario indisponivel";
      botao.setAttribute("aria-disabled", "true");
      return;
    }

    botao.removeAttribute("title");
    botao.removeAttribute("aria-disabled");
  });

  if (horaAtiva?.classList.contains("desabilitado")) {
    resumoHorario.textContent = "";
  }
}

horarios.forEach((hora) => {
  hora.addEventListener("click", () => {
    if (hora.classList.contains("desabilitado") || hora.disabled) return;

    const ativo = document.querySelector(".hora.ativo");

    if (ativo) {
      ativo.classList.remove("ativo");
    }

    hora.classList.add("ativo");

    atualizarResumo();
  });
});

/*==== SELEÇÃO DE SERVIÇOS ====*/

const servicos = document.querySelectorAll(".card-servico");

servicos.forEach((servico) => {
  servico.addEventListener("click", () => {
    //remove a seleção de todos
    servicos.forEach((s) => s.classList.remove("ativo"));

    //adiciona no clicado
    servico.classList.add("ativo");
  });
});

/* === RESUMO DO HORÁRIO E VALOR ESCOLHIDO === */
const resumoHorario = document.getElementById("resumoHorario");

function atualizarResumo() {
  const diaAtivo = document.querySelector(".dia.ativo");
  const horaAtiva = document.querySelector(".hora.ativo");

  if (!diaAtivo || !horaAtiva) return;

  const diaSelecionado = diaAtivo.textContent;
  const horaSelecionada = horaAtiva.textContent;

  resumoHorario.textContent = `${diaSelecionado} • ${horaSelecionada}`;
}

/*== CARREGAR HORÁRIOS AO ABRIR A PÁGINA ==*/
/* ==========================================
Quando o site abrir ele já verifica se
existem horários ocupados no dia atual
========================================== */
window.addEventListener("DOMContentLoaded", () => {
  const dataSelecionada = obterDataSelecionada();

  if (dataSelecionada) {
    carregarHorariosOcupados(dataSelecionada);
  }
});

/*==BOTÃO CONFIRMAR AGENDAMENTO==*/
const confirmar = document.getElementById("confirmar");

//Buscam o nome atualizado do localStorage no momento do clique
const nomeAtual = localStorage.getItem("nomeCliente");
const telefoneAtual = localStorage.getItem("telefoneCliente");

confirmar.addEventListener("click", async () => {
  //Pegar serviço selecionado (exemplo: Corte, Barba etc)
  const servicoSelecionado = document.querySelector(
    ".card-servico.ativo h3",
  )?.textContent;

  //Pegar dia selecionado
  const diaAtivo = document.querySelector(".dia.ativo");

  //Pegar horário selecionado
  const horaAtiva = document.querySelector(".hora.ativo");

  //Verificação de segurança
  if (!servicoSelecionado || !diaAtivo || !horaAtiva || !nomeAtual) {
    alert(
      "Por favor, selecione o serviço, o dia e o horário antes de confirmar.",
    );
    return;
  }

  //Transformar o dia em data real
  const dataSelecionada = obterDataSelecionada();

  //Pegar hora
  const horaSelecionada = horaAtiva.textContent;

  if (horarioJaPassou(dataSelecionada, horaSelecionada)) {
    alert("Este horario ja passou. Escolha outro horario disponivel.");
    carregarHorariosOcupados(dataSelecionada);
    return;
  }

  const sucesso = await verificarHorarioDisponivel(
    dataSelecionada,
    horaSelecionada,
  );

  if (!sucesso) return;

  /* =============================
    SALVAR DADOS E IR PARA PAGAMENTO
    Guarda os dados no localStorage para
    a página de pagamento poder exibir
    o resumo e gerar o QR Code Pix.
    ============================= */

  localStorage.setItem(
    "agendamentoPendente",
    JSON.stringify({
      servico: servicoSelecionado,
      data: dataSelecionada,
      hora: horaSelecionada,
      cliente: nomeAtual,
      telefone: telefoneAtual,
    }),
  );

  // Redireciona para a página de pagamento/finalização
  window.location.href = "pagamento.html";
});

/* ==========================================
REALTIME SUPABASE
Escuta novos agendamentos acontecendo
e atualiza horários automaticamente
========================================== */

db.channel("agendamentos-realtime") // Cria um canal de comunicação

  .on(
    "postgres_changes", //Avisa se algo mudar no Postgres
    {
      event: "INSERT",
      schema: "public",
      table: "agendamentos",
    },

    (payload) => {
      const dataSelecionada = obterDataSelecionada();
      if (payload.new.dados !== dataSelecionada) return;

      // Pega o horário que acabou de ser ocupado e desabilita o botão na tela
      const novoHorario = payload.new.hora;

      horarios.forEach((botao) => {
        if (botao.textContent === novoHorario) {
          botao.classList.add("desabilitado");
          botao.disabled = true;
          botao.title = "Horario indisponivel";
        }
      });
    },
  )

  .subscribe();
