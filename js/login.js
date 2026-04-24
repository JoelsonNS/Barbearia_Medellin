// Seleciona o formulário para controlar o envio via JavaScript.
const form = document.getElementById("loginForm");

// Escuta o evento de envio para validar os campos antes de prosseguir.
form.addEventListener("submit", function (event) {
  // Impede o recarregamento padrão da página ao enviar o formulário.
  event.preventDefault();

  // Captura os valores digitados e remove espaços extras no início e no fim.
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Verifica se algum dos campos está vazio.
  if (email === "" || senha === "") {
    alert("Preencha e-mail e senha.");
    return;
  }

  // Mensagem de exemplo para indicar que a validação passou.
  alert("Login enviado com sucesso!");
});
