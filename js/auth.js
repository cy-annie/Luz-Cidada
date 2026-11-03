(() => {
    const dialog = document.getElementById("socialSignupDialog");
    const dashboardFor = user => user.perfil === "gestor" ? "dashboard-gestor.html" : user.perfil === "tecnico" ? "dashboard-tecnico.html" : "dashboard.html";
    const socialForm = document.getElementById("socialSignupForm");
    let selectedProvider = "Google";

    document.querySelectorAll("[data-social-signup]").forEach(button => {
        button.addEventListener("click", () => {
            selectedProvider = button.dataset.provider || "Google";
            document.getElementById("socialDialogTitle").textContent = `Continuar com ${selectedProvider}`;
            document.getElementById("socialFeedback").hidden = true;
            document.getElementById("socialName").value = document.getElementById("nome").value.trim();
            document.getElementById("socialEmail").value = document.getElementById("email").value.trim();
            const profileChoice = document.getElementById("perfilCadastro")?.value;
            if (profileChoice) document.getElementById("socialProfile").value = profileChoice;
            if (typeof dialog.showModal === "function") dialog.showModal();
            else window.alert("Seu navegador não suporta esta janela. Atualize o navegador para continuar.");
        });
    });

    document.getElementById("closeSocialDialog")?.addEventListener("click", () => dialog?.close());
    dialog?.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

    socialForm?.addEventListener("submit", event => {
        event.preventDefault();
        const feedback = document.getElementById("socialFeedback");
        const email = document.getElementById("socialEmail").value.trim().toLowerCase();
        const name = document.getElementById("socialName").value.trim();
        let users;
        try { const saved = JSON.parse(localStorage.getItem("usuarios") || "[]"); users = Array.isArray(saved) ? saved : []; }
        catch { showFeedback("O armazenamento deste navegador está indisponível. Abra o projeto pelo Live Server e tente novamente."); return; }

        const existing = users.find(user => user.email === email);
        if (existing) {
            if (existing.authProvider === selectedProvider) {
                localStorage.setItem("usuarioLogado", JSON.stringify(existing));
                dialog.close();
                window.location.href = dashboardFor(existing);
                return;
            }
            showFeedback("Este e-mail já foi cadastrado. Use o método de acesso original ou outro e-mail.");
            return;
        }

        const user = { id: Date.now(), nome: name, telefone: "", email, senha: "", perfil: document.getElementById("socialProfile")?.value || "morador", authProvider: selectedProvider };
        users.push(user);
        try {
            localStorage.setItem("usuarios", JSON.stringify(users));
            localStorage.setItem("usuarioLogado", JSON.stringify(user));
        } catch { showFeedback("Não foi possível salvar a conta neste navegador. Libere espaço e tente novamente."); return; }
        dialog.close();
        window.location.href = dashboardFor(user);
    });

    function showFeedback(message) {
        const feedback = document.getElementById("socialFeedback");
        if (feedback) { feedback.textContent = message; feedback.hidden = false; }
    }

    // No servidor OAuth configurado, os botões da tela de login usam uma conta local de demonstração.
    document.querySelectorAll("#googleLogin, #appleLogin").forEach(button => {
        button.addEventListener("click", () => {
            const provider = button.dataset.provider || (button.id === "appleLogin" ? "Apple" : "Google");
            const email = (window.prompt(`E-mail da conta demonstrativa ${provider}:`) || "").trim().toLowerCase();
            if (!email) return;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("Informe um e-mail válido."); return; }
            const users = JSON.parse(localStorage.getItem("usuarios") || "[]");
            let user = users.find(item => item.email === email && item.authProvider === provider);
            if (!user) {
                if (users.some(item => item.email === email)) { alert("Este e-mail já usa outro método de acesso."); return; }
                const name = (window.prompt("Como devemos chamar você?") || "").trim();
                if (!name) return;
                const accepted = window.confirm("Ao continuar, você confirma que leu e aceita os Termos de Uso e a Política de Privacidade do protótipo.");
                if (!accepted) return;
                user = { id: Date.now(), nome: name, telefone: "", email, senha: "", perfil: document.getElementById("tipoUsuario")?.value || "morador", authProvider: provider };
                users.push(user);
                localStorage.setItem("usuarios", JSON.stringify(users));
            }
            localStorage.setItem("usuarioLogado", JSON.stringify(user));
            window.location.href = dashboardFor(user);
        });
    });
})();




