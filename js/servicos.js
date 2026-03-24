/*==MOSTRAR NOME DO CLIENTE==*/
const nomeCliente = localStorage.getItem("nomeCliente")

if(nomeCliente){
    document.getElementById("boasVindas").innerHTML =
    `Olá, <span class="nome-cliente">${nomeCliente}</span>! Seja bem vindo.<br><br>Escolha seu serviço, data e horário:`
}


/*==BLOQUEAR HORÁRIOS AGENDADOS==*/
//Conectar o JavaScript com o banco de dados.

//Quando for feito o deploy (na Vercel ou Netlify), existe uma aba chamada "Environment Variables". Lá, será cadastrado manualmente as chaves que estão no arquivo .env que se encontra na raiz da pasta do projeto.

const { createClient } = supabase

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

const db = supabase.createClient(supabaseUrl, supabaseKey)

//Salvar o agendamento no banco de dados
async function salvarAgendamento(servico, data, hora, cliente){

//Verificar se o horário já foi agendado
const { data: existente } = await db
.from("agendamentos")
.select("*")
.eq("data", data)
.eq("hora", hora)

//Se já existir um agendamento no mesmo horário
if(existente.length > 0){
    alert("Este horário já foi agendado")
    return false
}

//Salvar no banco
const { error } = await db
.from("agendamentos")
.insert([
{
servico: servico,
data: data,
hora: hora,
cliente: cliente
}
])

if(error){
    alert("Este horário acabou de ser reservado por outro cliente.")
    return false
}

return true
}


/*== BUSCAR HORÁRIOS OCUPADOS NO BANCO ==*/
/* ==========================================
Essa função consulta no Supabase todos os
agendamentos da data selecionada.
========================================== */
async function carregarHorariosOcupados(dataSelecionada){

    //Busca no banco todos os agendamentos da data escolhida
    const { data, error } = await db
    .from("agendamentos")
    .select("hora")
    .eq("data", dataSelecionada)

    //Se ocorrer erro na consulta
    if(error){
        console.log("Erro ao buscar horários:", error)
        return
    }

    //Remove bloqueio antigo antes de aplicar novos
    horarios.forEach(h => {
        h.classList.remove("desabilitado")
    })

    //Percorre todos os horários retornados do banco
    data.forEach(agendamento => {

        const horaAgendada = agendamento.hora

        //Comparar com os botões da tela
        horarios.forEach(botao => {

            if(botao.textContent === horaAgendada){
                botao.classList.add("desabilitado")
            }

        })

    })

}


/*== OBTER DATA SELECIONADA ==*/
/* ========================================== 
Transforma o dia clicado na régua em uma
data no formato YYYY-MM-DD
========================================== */
function obterDataSelecionada(){

    const diaAtivo = document.querySelector(".dia.ativo")

    if(!diaAtivo) return null

    const hoje = new Date()
    const diaNumero = diaAtivo.querySelector("strong").textContent

    const data = new Date(hoje.getFullYear(), hoje.getMonth(), diaNumero)

    return data.toISOString().split("T")[0]

}


//abrir o whatsapp
function enviarWhatsApp(servico, data, hora, cliente){
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
const regua = document.getElementById("reguaDatas")

const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

function gerarDias(){
    const hoje = new Date()

    for(let i = 0; i < 7; i++){
        const data = new Date();
        data.setDate(hoje.getDate() + i);

        const diaNumero = data.getDate();
        const diaSemana = diasSemana[data.getDay()];

        const botao = document.createElement("button");
        botao.classList.add("dia");

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
            document.querySelectorAll(".dia").forEach(d => d.classList.remove("ativo"));
            botao.classList.add("ativo");

            atualizarResumo()

            //Busca horários ocupados
            const dataSelecionada = obterDataSelecionada()

            carregarHorariosOcupados(dataSelecionada);
        });

        

        regua.insertBefore(
            botao,
            document.getElementById("abrirCalendario")
        );

    }

}

//Executar a função de gerar os dias
gerarDias();


/* === LÓGICA DO CALENDÁRIO COMPLETO === */
//Abrir o calendário completo ao cicar no ícone calendário.
const abrirCalendario = document.getElementById("abrirCalendario");
const seletorData = document.getElementById("seletorData");

// impedir selecionar datas passadas
seletorData.min = new Date().toISOString().split("T")[0];

abrirCalendario.addEventListener("click", () => {
    seletorData.showPicker();
});


/* === SELEÇÃO DE HORÁRIOS === */
const horarios = document.querySelectorAll(".hora")

horarios.forEach(hora => {

    hora.addEventListener("click", () => {

        if(hora.classList.contains("desabilitado")) return

        const ativo = document.querySelector(".hora.ativo")

        if(ativo){
            ativo.classList.remove("ativo")
        }

        hora.classList.add("ativo")

        atualizarResumo()

    })

})



/* === RESUMO DO HORÁRIO E VALOR ESCOLHIDO === */ 
const resumoHorario = document.getElementById("resumoHorario")

function atualizarResumo(){

    const diaAtivo = document.querySelector(".dia.ativo")
    const horaAtiva = document.querySelector(".hora.ativo")

    if(!diaAtivo || !horaAtiva) return

    const diaSelecionado = diaAtivo.textContent
    const horaSelecionada = horaAtiva.textContent

    resumoHorario.textContent = `${diaSelecionado} • ${horaSelecionada}`

}


/*== CARREGAR HORÁRIOS AO ABRIR A PÁGINA ==*/
/* ==========================================
Quando o site abrir ele já verifica se
existem horários ocupados no dia atual
========================================== */
window.addEventListener("DOMContentLoaded", () => {

const dataSelecionada = obterDataSelecionada()

if(dataSelecionada){
carregarHorariosOcupados(dataSelecionada)
}

})


/*== CARREGAR NOME DO CLIENTE SALVO NO NAVEGADOR ==*/
window.addEventListener("DOMContentLoaded", () => {

const nomeSalvo = localStorage.getItem("nomeCliente")

if(nomeSalvo){
document.getElementById("nomeCliente").value = nomeSalvo
}

})


/*==BOTÃO CONFIRMAR AGENDAMENTO==*/
const confirmar = document.getElementById("confirmar")

confirmar.addEventListener("click", async () => {

    //Pegar serviço selecionado (exemplo: Corte, Barba etc)
    const servicoSelecionado = document.querySelector(".card-servico.ativo h3")?.textContent

    //Pegar dia selecionado
    const diaAtivo = document.querySelector(".dia.ativo")

    //Pegar horário selecionado
    const horaAtiva = document.querySelector(".hora.ativo")

    //Salvar nome no navegador
    localStorage.setItem("nomeCliente", nomeCliente)


    //Verificação de segurança
    if(!servicoSelecionado || !diaAtivo || !horaAtiva || !nomeCliente){
    alert("Preencha nome, serviço, dia e horário")
    return
}


    //Transformar o dia em data real
    const dataSelecionada = obterDataSelecionada()

    //Pegar hora
    const horaSelecionada = horaAtiva.textContent

    /* =============================
    SALVAR NO BANCO DE DADOS
    ============================= */

const sucesso = await salvarAgendamento(
    servicoSelecionado,
    dataSelecionada,
    horaSelecionada,
    nomeCliente
)

if(!sucesso) return

    horaAtiva.classList.add("desabilitado")
    horaAtiva.classList.remove("ativo")

    /* =============================
    ENVIAR PARA WHATSAPP
    ============================= */

   enviarWhatsApp(
    servicoSelecionado,
    dataSelecionada,
    horaSelecionada,
    nomeCliente
)

})


/* ==========================================
REALTIME SUPABASE
Escuta novos agendamentos acontecendo
e atualiza horários automaticamente
========================================== */

db.channel("agendamentos-realtime")

.on(
    "postgres_changes",
    {
        event: "INSERT",
        schema: "public",
        table: "agendamentos"
    },

    (payload) => {

        const novoHorario = payload.new.hora

        horarios.forEach(botao => {

            if(botao.textContent === novoHorario){
                botao.classList.add("desabilitado")
            }

        })

    }

)

.subscribe()