const savedUser = localStorage.getItem("usuarioLogado");
let user = null;
try { user = savedUser ? JSON.parse(savedUser) : null; } catch { user = null; }

if (!savedUser) {
    window.location.replace("index.html");
} else if (user?.perfil === "tecnico") {
    window.location.replace("perfil-tecnico.html");
} else if (user?.perfil === "gestor") {
    window.location.replace("perfil-gestor.html");
} else if (user?.perfil !== "morador") {
    window.location.replace("index.html");
}

if (user?.perfil === "morador") {
    const initials = (user.nome || "U").trim().charAt(0).toUpperCase();
    document.getElementById("nomeUsuario").textContent = user.nome || "Usuário";
    document.getElementById("avatar").textContent = initials;
    document.getElementById("profileName").textContent = user.nome || "Usuário";
    document.getElementById("profileInitial").textContent = initials;
    document.getElementById("profileNome").textContent = user.nome || "-";
    document.getElementById("profileEmail").textContent = user.email || "-";
    document.getElementById("profileTelefone").textContent = user.telefone || "Não informado";
    document.getElementById("profilePerfil").textContent = ({ morador: "Morador", tecnico: "Técnico", gestor: "Gestor" })[user.perfil] || "Morador";
    document.querySelectorAll(".user-info span, .profile-header > div:last-child > span").forEach(el => { el.textContent = document.getElementById("profilePerfil").textContent; });

    const photo = localStorage.getItem(`fotoPerfil:${user.email}`) || localStorage.getItem("fotoPerfil");
    if (photo) showPhoto(photo);

    const fileInput = document.getElementById("fotoPerfil");
    document.getElementById("alterarFoto").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
            alert("Escolha uma imagem de até 2 MB.");
            fileInput.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            localStorage.setItem(`fotoPerfil:${user.email}`, reader.result);
            showPhoto(reader.result);
        };
        reader.readAsDataURL(file);
    });

    document.getElementById("alterarSenha").addEventListener("click", () => {
        if (user.authProvider && user.authProvider !== "local") {
            alert(`Esta conta de demonstração usa ${user.authProvider}; a senha deve ser alterada no provedor real. O protótipo não acessa essa conta.`);
            return;
        }
        const oldPassword = prompt("Digite sua senha atual:");
        if (oldPassword === null) return;
        if (oldPassword !== user.senha) { alert("A senha atual não confere."); return; }
        const newPassword = prompt("Digite a nova senha (mínimo de 8 caracteres):") || "";
        if (newPassword.length < 8) { alert("A nova senha precisa ter pelo menos 8 caracteres."); return; }
        const users = JSON.parse(localStorage.getItem("usuarios") || "[]");
        let account = users.find(item => item.email === user.email);
        if (!account) { account = { ...user, authProvider: "local" }; users.push(account); }
        account.senha = newPassword;
        user.senha = newPassword;
        localStorage.setItem("usuarios", JSON.stringify(users));
        localStorage.setItem("usuarioLogado", JSON.stringify(user));
        alert("Senha alterada neste navegador.");
    });
}

function showPhoto(dataUrl) {
    const container = document.getElementById("profilePhoto");
    if (container) container.innerHTML = `<img src="${dataUrl}" alt="Foto de perfil">`;
}

const logoutButton = document.getElementById("logout");
if (logoutButton) logoutButton.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
});
