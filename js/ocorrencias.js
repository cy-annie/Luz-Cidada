const account = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
if (!account) window.location.replace("index.html");

const staff = account && ["tecnico", "gestor"].includes(account.perfil);
const roleText = staff ? (account.perfil === "gestor" ? "Gestor" : "Técnico") : "Morador";
const nameNode = document.getElementById("nomeUsuario");
const avatarNode = document.getElementById("avatar");
if (nameNode) nameNode.textContent = account?.nome || roleText;
if (avatarNode) avatarNode.textContent = (account?.nome || roleText).trim().charAt(0).toUpperCase();
document.querySelectorAll(".user-info span").forEach(node => { node.textContent = roleText; });
const overviewLink = document.querySelector('.menu-item[href="dashboard.html"]');
if (staff && overviewLink) overviewLink.href = account.perfil === "gestor" ? "dashboard-gestor.html" : "dashboard-tecnico.html";
const newOccurrenceLink = document.querySelector('.menu-item[href="nova-ocorrencia.html"]');
if (staff && newOccurrenceLink) newOccurrenceLink.hidden = true;
const pageTitle = document.querySelector(".welcome h2");
if (pageTitle) pageTitle.textContent = staff ? "Todos os chamados" : "Minhas ocorrências";
const pageDescription = document.querySelector(".welcome p");
if (pageDescription) pageDescription.textContent = staff ? "Consulte as ocorrências registradas no sistema." : "Consulte o status e o histórico das suas solicitações.";
const createButton = document.querySelector(".new-occurrence");
if (staff && createButton) createButton.hidden = true;

const source = JSON.parse(localStorage.getItem("ocorrencias") || "[]");
const items = account?.perfil === "gestor" ? source : account?.perfil === "tecnico" ? source.filter(item => item.tecnicoEmail === account.email) : source.filter(item => !item.userEmail || item.userEmail === account?.email);
const table = document.getElementById("tabelaOcorrencias");
const friendlyStatus = status => status === "Em andamento" ? "Em atendimento" : status === "Concluída" ? "Concluído" : "Aberta";
const statusClass = status => status === "Concluída" ? "status-concluida" : status === "Em andamento" ? "status-em-andamento" : "status-aberta";

if (table) {
    table.replaceChildren();
    if (!items.length) {
        const row = table.insertRow(); const cell = row.insertCell(); cell.colSpan = 6; cell.className = "empty-state";
        cell.textContent = staff
            ? "Ainda não há ocorrências para exibir."
            : "Você ainda não registrou ocorrências. Quando abrir uma, poderá acompanhar as atualizações por aqui.";
    } else items.forEach((item, index) => {
        const row = table.insertRow();
        [item.numeroChamado ? `#${item.numeroChamado}` : `#${index + 1}`, item.tipoProblema || "—", `${item.endereco || "—"}, ${item.numero || "—"}`, item.data || "—"].forEach(value => { row.insertCell().textContent = value; });
        const statusCell = row.insertCell(); const badge = document.createElement("span");
        badge.className = `status-badge ${statusClass(item.status)}`; badge.textContent = friendlyStatus(item.status || "Aberta"); statusCell.appendChild(badge);
        const actionCell = row.insertCell(); const button = document.createElement("button");
        button.type = "button"; button.className = "respond-button"; button.textContent = "Acompanhar"; button.setAttribute("aria-expanded", "false");
        const detailsRow = table.insertRow(); detailsRow.hidden = true; const detailsCell = detailsRow.insertCell(); detailsCell.colSpan = 6;
        const details = document.createElement("div"); details.className = "occurrence-followup";
        const description = document.createElement("p"); description.textContent = item.descricao || "Sem descrição adicional."; details.appendChild(description);
        const assigned = document.createElement("p"); assigned.textContent = `Técnico responsável: ${item.tecnicoNome || "Aguardando triagem"}`; details.appendChild(assigned);
        const timeline = document.createElement("ol"); timeline.className = "occurrence-timeline";
        const events = Array.isArray(item.historico) ? item.historico : [];
        if (!events.length) { const empty = document.createElement("li"); empty.textContent = "Sem alterações registradas até o momento."; timeline.appendChild(empty); }
        else events.forEach(event => {
            const entry = document.createElement("li"); const title = document.createElement("strong"); title.textContent = event.acao || "Atualização";
            const meta = document.createElement("span"); const date = new Date(event.dataISO || Date.now());
            meta.textContent = `${event.usuario || "Usuário"} · ${date.toLocaleString("pt-BR")}`; entry.append(title, meta);
            if (event.detalhes) { const note = document.createElement("p"); note.textContent = event.detalhes; entry.appendChild(note); }
            timeline.appendChild(entry);
        });
        details.appendChild(timeline); detailsCell.appendChild(details);
        button.addEventListener("click", () => { detailsRow.hidden = !detailsRow.hidden; button.setAttribute("aria-expanded", String(!detailsRow.hidden)); button.textContent = detailsRow.hidden ? "Acompanhar" : "Fechar histórico"; });
        actionCell.appendChild(button);
    });
}

document.getElementById("logout")?.addEventListener("click", () => {
    if (!confirm("Deseja realmente sair?")) return;
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
});

