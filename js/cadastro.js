const cadastroForm = document.getElementById("cadastroForm");

function destinoDoPerfil(perfil) {
    if (perfil === "gestor") return "dashboard-gestor.html";
    if (perfil === "tecnico") return "dashboard-tecnico.html";
    return "dashboard.html";
}

if (cadastroForm) {
    cadastroForm.addEventListener("submit", event => {
        event.preventDefault();
        const nome = document.getElementById("nome").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;
        const perfil = document.getElementById("perfilCadastro")?.value || "morador";
        if (nome.length < 2) { alert("Informe seu nome completo."); return; }
        if (senha.length < 8) { alert("Crie uma senha com pelo menos 8 caracteres."); return; }
        if (senha !== confirmarSenha) { alert("As senhas não são iguais."); return; }
        if (!document.getElementById("aceiteTermos")?.checked) { alert("Aceite os Termos de Uso e a Política de Privacidade para continuar."); return; }
        let usuarios;
        try { const raw = JSON.parse(localStorage.getItem("usuarios") || "[]"); usuarios = Array.isArray(raw) ? raw : []; }
        catch { alert("Não foi possível acessar os cadastros deste navegador."); return; }
        if (usuarios.some(usuario => (usuario.email || "").toLowerCase() === email)) { alert("Este e-mail já está cadastrado."); return; }
        const novoUsuario = { id: Date.now(), nome, telefone, email, senha, perfil, authProvider: "local", criadoEm: new Date().toISOString() };
        usuarios.push(novoUsuario);
        try { localStorage.setItem("usuarios", JSON.stringify(usuarios)); localStorage.setItem("usuarioLogado", JSON.stringify(novoUsuario)); }
        catch { alert("Não foi possível salvar a conta. O armazenamento deste navegador pode estar cheio."); return; }
        alert(`Cadastro de ${perfil === "gestor" ? "gestor" : perfil === "tecnico" ? "técnico" : "morador"} realizado com sucesso.`);
        window.location.href = destinoDoPerfil(perfil);
    });
    document.getElementById("telefone")?.addEventListener("input", event => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
        event.target.value = digits.length > 10 ? digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3") : digits.length > 6 ? digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3") : digits.length > 2 ? digits.replace(/^(\d{2})(\d*)/, "($1) $2") : digits;
    });
}
