// =========================
// USUÁRIO LOGADO
// =========================

const usuarioSalvo = localStorage.getItem("usuarioLogado");

if (!usuarioSalvo) window.location.replace("index.html");

let usuario = null;

if (usuarioSalvo) {

    usuario = JSON.parse(usuarioSalvo);

    const nomeUsuario =
        document.getElementById("nomeUsuario");

    const nomeBoasVindas =
        document.getElementById("nomeBoasVindas");

    const avatar =
        document.getElementById("avatar");

    if (nomeUsuario) {
        nomeUsuario.textContent = usuario.nome;
    }

    if (nomeBoasVindas) {
        nomeBoasVindas.textContent = usuario.nome;
    }

    if (avatar) {
        avatar.textContent =
            usuario.nome.charAt(0).toUpperCase();
    }
    if (usuario.perfil === "gestor") window.location.replace("dashboard-gestor.html");
    else if (usuario.perfil === "tecnico") window.location.replace("dashboard-tecnico.html");
    document.querySelectorAll(".user-info span").forEach(node => { node.textContent = "Morador"; });
}


// =========================
// CARREGAR OCORRÊNCIAS
// =========================

const listaCompleta = JSON.parse(localStorage.getItem("ocorrencias") || "[]");
const ocorrencias = usuario
    ? listaCompleta.filter(item => !item.userEmail || item.userEmail === usuario.email)
    : [];


// =========================
// CONTADORES
// =========================

const abertas = ocorrencias.filter(
    ocorrencia => ocorrencia.status === "Aberta"
).length;

const andamento = ocorrencias.filter(
    ocorrencia => ocorrencia.status === "Em andamento"
).length;

const concluidas = ocorrencias.filter(
    ocorrencia => ocorrencia.status === "Concluída"
).length;


// =========================
// ATUALIZAR CARDS
// =========================

const cardAbertas =
    document.getElementById("ocorrenciasAbertas");

const cardAndamento =
    document.getElementById("ocorrenciasAndamento");

const cardConcluidas =
    document.getElementById("ocorrenciasConcluidas");

if (cardAbertas) {
    cardAbertas.textContent = abertas;
}

if (cardAndamento) {
    cardAndamento.textContent = andamento;
}

if (cardConcluidas) {
    cardConcluidas.textContent = concluidas;
}


// =========================
// TABELA DE OCORRÊNCIAS
// =========================

const tabela = document.getElementById("tabelaOcorrencias");
if (tabela) {
    tabela.replaceChildren();
    if (ocorrencias.length === 0) {
        const linha = tabela.insertRow();
        const celula = linha.insertCell();
        celula.colSpan = 5;
        celula.className = "empty-state";
        celula.textContent = "Nenhuma ocorrência registrada.";
    } else {
        ocorrencias.forEach((ocorrencia, index) => {
            const linha = tabela.insertRow();
            const numeroChamado = ocorrencia.numeroChamado || index + 1;
            [
                `#${numeroChamado}`,
                ocorrencia.tipoProblema || "—",
                `${ocorrencia.endereco || "—"}, ${ocorrencia.numero || "—"}`,
                ocorrencia.data || "—"
            ].forEach(valor => { linha.insertCell().textContent = valor; });
            const statusCelula = linha.insertCell();
            const badge = document.createElement("span");
            badge.className = `status-badge ${ocorrencia.status === "Concluída" ? "status-concluida" : ocorrencia.status === "Em andamento" ? "status-em-andamento" : "status-aberta"}`;
            badge.textContent = ocorrencia.status === "Em andamento" ? "Em atendimento" : ocorrencia.status || "Aberta";
            statusCelula.appendChild(badge);
        });
    }
}

// =========================
// BOTÃO SAIR
// =========================

const logout =
    document.getElementById("logout");

if (logout) {

    logout.addEventListener("click", function () {

        const confirmar =
            confirm("Deseja realmente sair?");

        if (!confirmar) {
            return;
        }

        localStorage.removeItem("usuarioLogado");

        window.location.href = "index.html";
    });
}



