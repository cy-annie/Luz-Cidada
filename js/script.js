// Usuários de teste do sistema
const usuariosTeste = [
    {
        nome: "Morador Teste",
        email: "morador@luzcidada.com",
        senha: "123456",
        perfil: "morador"
    },
    {
        nome: "Técnico Teste",
        email: "tecnico@luzcidada.com",
        senha: "123456",
        perfil: "tecnico"
    },
    {
        nome: "Gestor Teste",
        email: "gestor@luzcidada.com",
        senha: "123456",
        perfil: "gestor"
    }
];

const formLogin = document.getElementById("loginForm");
const emailLogin = document.getElementById("email");
const lembrar = document.getElementById("lembrar");

if (emailLogin && localStorage.getItem("emailLembrado")) {
    emailLogin.value = localStorage.getItem("emailLembrado");
    if (lembrar) lembrar.checked = true;
}

if (formLogin) {

    formLogin.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

        const senha = document
            .getElementById("senha")
            .value;

        const perfil = document
            .getElementById("tipoUsuario")
            .value;

        // Busca os moradores cadastrados
        const usuariosCadastrados =
            JSON.parse(localStorage.getItem("usuarios")) || [];

        // Junta usuários de teste + usuários cadastrados
        const emailsCadastrados = new Set(usuariosCadastrados.map(usuario => usuario.email));
        const todosUsuarios = [
            ...usuariosCadastrados,
            ...usuariosTeste.filter(usuario => !emailsCadastrados.has(usuario.email))
        ];

        // Procura usuário pelo e-mail, senha e perfil
        const usuarioEncontrado = todosUsuarios.find(usuario =>
            usuario.email === email &&
            usuario.senha === senha &&
            usuario.perfil === perfil
        );

        if (!usuarioEncontrado) {
            alert("Login ou senha inválidos.");
            return;
        }

        if (lembrar && lembrar.checked) localStorage.setItem("emailLembrado", email);
        else localStorage.removeItem("emailLembrado");

        // Salva o usuário que realizou o login
        localStorage.setItem(
            "usuarioLogado",
            JSON.stringify(usuarioEncontrado)
        );

        // Redireciona de acordo com o perfil
        if (usuarioEncontrado.perfil === "morador") {
            window.location.href = "dashboard.html";

        } else if (usuarioEncontrado.perfil === "tecnico") {
            window.location.href = "dashboard-tecnico.html";

        } else if (usuarioEncontrado.perfil === "gestor") {
            window.location.href = "dashboard-gestor.html";
        }

    });
}

const esqueciSenha = document.getElementById("esqueciSenha");
if (esqueciSenha) {
    esqueciSenha.addEventListener("click", () => {
        const email = (prompt("Informe o e-mail da conta local:") || "").trim().toLowerCase();
        if (!email) return;
        const users = JSON.parse(localStorage.getItem("usuarios") || "[]");
        let user = users.find(item => item.email === email && (!item.authProvider || item.authProvider === "local"));
        if (!user) {
            const demoUser = usuariosTeste.find(item => item.email === email);
            if (demoUser) { user = { ...demoUser, authProvider: "local" }; users.push(user); }
        }
        if (!user) {
            alert("Não encontramos uma conta local com esse e-mail. Contas de demonstração Google/Apple usam o botão correspondente.");
            return;
        }
        const newPassword = prompt("Digite a nova senha (mínimo de 8 caracteres):") || "";
        if (newPassword.length < 8) {
            alert("A senha precisa ter pelo menos 8 caracteres.");
            return;
        }
        user.senha = newPassword;
        localStorage.setItem("usuarios", JSON.stringify(users));
        alert("Senha atualizada neste navegador.");
    });
}


// Mostrar / ocultar senha
const btnSenha = document.getElementById("mostrarSenha");
const campoSenha = document.getElementById("senha");

if (btnSenha && campoSenha) {

    btnSenha.addEventListener("click", function () {

        if (campoSenha.type === "password") {
            campoSenha.type = "text";
        } else {
            campoSenha.type = "password";
        }

    });
}


// Botão "Criar sua conta"
const btnCriarConta = document.getElementById("criarConta");

if (btnCriarConta) {

    btnCriarConta.addEventListener("click", function () {
        window.location.href = "cadastro.html";
    });

}

// =========================================================
// FOTO DO PERFIL
// =========================================================

const alterarFoto =
    document.getElementById("alterarFoto");

const fotoPerfil =
    document.getElementById("fotoPerfil");

const profilePhoto =
    document.getElementById("profilePhoto");


// =========================================================
// ABRIR SELEÇÃO DE FOTO
// =========================================================

if (alterarFoto && fotoPerfil) {

    alterarFoto.addEventListener(
        "click",
        function () {

            fotoPerfil.click();

        }
    );
}


// =========================================================
// SELECIONAR FOTO
// =========================================================

if (fotoPerfil) {

    fotoPerfil.addEventListener(
        "change",
        function () {

            const arquivo =
                fotoPerfil.files[0];

            if (!arquivo) {
                return;
            }


            const leitor =
                new FileReader();


            leitor.onload =
                function (event) {

                    const foto =
                        event.target.result;


                    localStorage.setItem(
                        "fotoPerfil",
                        foto
                    );


                    mostrarFoto(foto);

                };


            leitor.readAsDataURL(
                arquivo
            );

        }
    );
}


// =========================================================
// CARREGAR FOTO SALVA
// =========================================================

const fotoSalva =
    localStorage.getItem(
        "fotoPerfil"
    );

if (fotoSalva) {

    mostrarFoto(
        fotoSalva
    );
}


// =========================================================
// MOSTRAR FOTO
// =========================================================

function mostrarFoto(foto) {

    if (!profilePhoto) {
        return;
    }


    profilePhoto.innerHTML = `

        <img
            src="${foto}"
            alt="Foto de perfil"
        >

    `;
}
