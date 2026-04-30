/* ================================
SELEÇÃO DOS ELEMENTOS DO DOM
================================ */

// botão agendamento
const botaoAgendar = document.getElementById("hero_agendar_Btn");

// botões redes sociais
const googleMaps = document.getElementById("social_btn_google_maps");
const paginaInstagram = document.getElementById("social_btn_instagram");
const paginaGoogle = document.getElementById("social_btn_Google_Empresa");
const paginaWhatsapp = document.getElementById("social_btn_whatsapp");

const btnGarantirCorte = document.getElementById("btn_garantir_corte");

// fotos da galeria
const fotosTrabalhos = document.querySelectorAll(".foto");

/* ================================
FUNÇÕES
================================ */

// verifica se a barbearia está aberta
function verificarStatusBarbearia() {
  const agora = new Date();
  const horaAtual = agora.getHours();
  const diaAtual = agora.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  const status = document.querySelector(".status");

  // Define como 'fechado' (false) por padrão, mudará para 'aberto' (true) se as condições forem atendidas
  let aberto = false;

  // Seg a Sex: 09:00 - 19:00
  if (diaAtual >= 1 && diaAtual <= 5) {
    if (horaAtual >= 9 && horaAtual < 19) aberto = true;
  } else if (diaAtual === 6)
    if (horaAtual >= 9 && horaAtual < 19) aberto = true;
    else {
      aberto = false;
    }

  if (aberto) {
    status.textContent = "ABERTO";
    status.style.backgroundColor = "#2563eb";
    status.style.color = "white";
  } else {
    status.textContent = "FECHADO";
    status.style.backgroundColor = "#ef4444"; //Fundo fica vermelho
    status.style.color = "white"; //letra fica branca
  }
}

// função de agendamento
botaoAgendar.addEventListener("click", () => {
  document.getElementById("popupNome").style.display = "flex";
});

//abrir google maps
googleMaps.addEventListener("click", () => {
  window.open(
    "https://www.google.com/maps/place/Medellin+Barbearia/@-8.2714918,-35.9955067,15z/data=!4m6!3m5!1s0x7a98bf659cee10d:0xbb7a92648c3df803!8m2!3d-8.2729682!4d-35.9795254!16s%2Fg%2F11rr2s0xc1?entry=ttu&g_ep=EgoyMDI2MDIyNS4wIKXMDSoASAFQAw%3D%3D",
  );
});

// abrir instagram
paginaInstagram.addEventListener("click", () => {
  window.open("https://instagram.com/barbeariamedellinoficial/", "_blank");
});

// abrir google empresa
paginaGoogle.addEventListener("click", () => {
  window.open(
    "https://www.google.com/search?sca_esv=7e158bf0b3da2f51&sxsrf=ANbL-n7buXgqg3jyd5mpMWEgA2Da2tv6cg:1772329262252&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOQYi3xbqZ-jCqk79ZEoHQHAUaOBGJpkWL5otzVjtVb6gSAr8Bz-X3sJaujJyu3UbP8zOqIyI0s4bQkADHXjgb4ADy1Vyl8Om4atoslvoAaLrd0xafQ%3D%3D&q=Medellin+Barbearia+Coment%C3%A1rios&sa=X&ved=2ahUKEwiD3ueAyf2SAxUtq5UCHQ22EsQQ0bkNegQILxAH&biw=1536&bih=695&dpr=1.25",
    "_blank",
  );
});

// abrir whatsapp
function abrirWhatsapp() {
  const numero = "81981222018";

  const mensagem = "Olá, gostaria de agendar um horário!";

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}

btnGarantirCorte.addEventListener("click", () => {
  document.getElementById("popupNome").style.display = "flex";
});

/* ================================
EVENTOS
================================ */
// redes sociais
paginaWhatsapp.addEventListener("click", abrirWhatsapp);

/* ================================
ZOOM DAS FOTOS
================================ */

fotosTrabalhos.forEach((foto) => {
  foto.addEventListener("click", () => {
    // remove zoom das outras imagens
    fotosTrabalhos.forEach((img) => img.classList.remove("zoom"));

    // adiciona zoom na clicada
    foto.classList.toggle("zoom");
  });
});

/* ================================
INICIALIZAÇÃO
================================ */

verificarStatusBarbearia();
//verifica automáticamente o status de aberto/fechado a cada minuto
setInterval(verificarStatusBarbearia, 60000);

/*== MODAL ==*/

const fotos = document.querySelectorAll(".foto");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const fechar = document.getElementById("fechar");
const proximo = document.getElementById("proximo");
const anterior = document.getElementById("anterior");

let indexAtual = 0;

// Abrir modal
fotos.forEach((foto, index) => {
  foto.addEventListener("click", () => {
    modal.style.display = "block";
    modalImg.src = foto.src;
    indexAtual = index;
  });
});

// Fechar no botão
fechar.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fechar clicando fora
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Próxima imagem
proximo.addEventListener("click", () => {
  indexAtual++;
  if (indexAtual >= fotos.length) {
    indexAtual = 0;
  }
  modalImg.src = fotos[indexAtual].src;
});

// Imagem anterior
anterior.addEventListener("click", () => {
  indexAtual--;
  if (indexAtual < 0) {
    indexAtual = fotos.length - 1;
  }
  modalImg.src = fotos[indexAtual].src;
});

/*== SALVAR NOME DO CLIENTE E IR PARA PÁGINA SERVIÇOS == */

const form = document.getElementById("formNome");

//deixar a primeira leat de cada nome Maiúscula
const inputNome = document.getElementById("inputNomeCliente");

inputNome.addEventListener("input", () => {
  let valor = inputNome.value;

  inputNome.value = valor.replace(/\b\w/g, (letra) => letra.toUpperCase());
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("inputNomeCliente").value;
  const telefone = document.getElementById("inputTelefone").value;

  if (!nome) {
    alert("Digite seu nome");
    return;
  }

  if (!telefone) {
    alert("Digite seu WhatsApp para receber o lembrete");
    return;
  }

  localStorage.setItem("nomeCliente", nome);
  localStorage.setItem("telefoneCliente", telefone);

  window.location.href = "servicos.html";
});

/*==FECHAR POPUP==*/
const fecharClickFora = document.getElementById("popupNome");
const fecharPopup = document.getElementById("fecharPopup");
const popupNome = document.getElementById("popupNome");

// Fechar no botão
fecharPopup.addEventListener("click", () => {
  popupNome.style.display = "none";
});

// Fechar clicando fora

fecharClickFora.addEventListener("click", (e) => {
  if (e.target === fecharClickFora) {
    fecharClickFora.style.display = "none";
  }
});
