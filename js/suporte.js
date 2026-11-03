const supportForm = document.getElementById("supportForm");
if (supportForm) {
    supportForm.addEventListener("submit", event => {
        event.preventDefault();
        const chamados = JSON.parse(localStorage.getItem("solicitacoesSuporte") || "[]");
        chamados.push({
            id: Date.now(),
            nome: document.getElementById("supportName").value.trim(),
            email: document.getElementById("supportEmail").value.trim().toLowerCase(),
            assunto: document.getElementById("supportTopic").value,
            mensagem: document.getElementById("supportMessage").value.trim(),
            data: new Date().toLocaleDateString("pt-BR")
        });
        localStorage.setItem("solicitacoesSuporte", JSON.stringify(chamados));
        alert("Solicitação salva neste navegador. Como esta é uma demonstração, ela não foi enviada para uma equipe de atendimento.");
        supportForm.reset();
    });
}
