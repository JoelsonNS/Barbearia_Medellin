const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const senhaInput = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");

toggleSenha.addEventListener("click", () => {
    const senhaVisivel = senhaInput.type === "text";
    senhaInput.type = senhaVisivel ? "password" : "text";
    toggleSenha.setAttribute("aria-label", senhaVisivel ? "Mostrar senha" : "Ocultar senha");
    toggleSenha.innerHTML = senhaVisivel
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = loginForm.email.value.trim();
    const senha = loginForm.senha.value.trim();

    if (!email || !senha) {
        loginMessage.textContent = "Preencha e-mail e senha para acessar a agenda.";
        loginMessage.classList.remove("success");
        return;
    }

    loginMessage.textContent = "Login validado. Redirecionando para a agenda...";
    loginMessage.classList.add("success");

    setTimeout(() => {
        window.location.href = "agenda.html";
    }, 700);
});
