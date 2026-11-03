const staffSession = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
if (!staffSession) location.replace("index.html");
else if (staffSession.perfil === "morador") location.replace("dashboard.html");

const isManager = staffSession?.perfil === "gestor";
const triageMode = isManager && new URLSearchParams(location.search).get("visao") === "triagem";
const role = isManager ? "Gestor" : "Técnico";
const dashboardLink = document.querySelector('[data-staff-link="dashboard"]');
if (dashboardLink) dashboardLink.href = isManager ? "dashboard-gestor.html" : "dashboard-tecnico.html";
const profileLink = document.querySelector('.staff-menu a[href="perfil-tecnico.html"]');
if (profileLink) profileLink.href = isManager ? "perfil-gestor.html" : "perfil-tecnico.html";
document.querySelectorAll(".manager-only").forEach(link => { link.hidden = !isManager; });
document.getElementById("nomeUsuario").textContent = staffSession?.nome || role;
document.getElementById("avatar").textContent = (staffSession?.nome || role).trim().charAt(0).toUpperCase();
document.querySelectorAll(".user-info span,#roleLabel").forEach(node => { node.textContent = node.id === "roleLabel" ? role.toLocaleUpperCase("pt-BR") : role; });
const listHeading = document.getElementById("listHeading");
if (triageMode && listHeading) { listHeading.textContent = "Triagem e distribuição"; document.querySelector(".panel-heading p").textContent = "Revise os chamados sem técnico responsável e distribua o atendimento."; }
const triageLink = document.querySelector("[data-triage-link]");
if (triageMode && triageLink) { triageLink.classList.add("active"); document.querySelector(".staff-menu a[href=\"ocorrencias-tecnico.html\"]")?.classList.remove("active"); }

const storedCases = JSON.parse(localStorage.getItem("ocorrencias") || "[]");
const roleCases = isManager ? storedCases : storedCases.filter(item => item.tecnicoEmail === staffSession?.email);
const allCases = triageMode ? roleCases.filter(item => !item.tecnicoEmail) : roleCases;
const search = document.getElementById("caseSearch");
const priority = document.getElementById("priorityFilter");
const status = document.getElementById("statusFilter");
const tbody = document.getElementById("staffCases");

function normalizedPriority(item) {
    const raw = (item.prioridade || "Média").toString().toLowerCase();
    if (raw.includes("urgente")) return "Urgente";
    if (raw.includes("alta")) return "Alta";
    if (raw.includes("baixa")) return "Baixa";
    return "Média";
}
function stateClass(value) { return value === "Concluída" ? "status-concluida" : value === "Em andamento" ? "status-em-andamento" : "status-aberta"; }
function renderCases() {
    const phrase = (search.value || "").trim().toLocaleLowerCase("pt-BR");
    const items = allCases.filter(item => {
        const address = [item.endereco,item.numero,item.bairro,item.cidade,item.estado].join(" ").toLocaleLowerCase("pt-BR");
        return (!phrase || [item.numeroChamado,item.tipoProblema,address].join(" ").toLocaleLowerCase("pt-BR").includes(phrase))
            && (!priority.value || normalizedPriority(item) === priority.value)
            && (!status.value || (item.status || "Aberta") === status.value);
    });
    tbody.replaceChildren();
    document.getElementById("resultCount").textContent = `${items.length} ${items.length === 1 ? "chamado" : "chamados"}`;
    document.getElementById("tableSummary").textContent = `Exibindo ${items.length} de ${allCases.length} ocorrências`;
    if (!items.length) { const row = tbody.insertRow(); const cell = row.insertCell(); cell.colSpan = 7; cell.className = "empty-state"; cell.textContent = "Nenhuma ocorrência corresponde aos filtros."; return; }
    items.forEach((item,index) => {
        const row = tbody.insertRow();
        [item.numeroChamado ? `ILU-${new Date().getFullYear()}-${String(item.numeroChamado).padStart(4,"0")}` : `ILU-${String(index+1).padStart(4,"0")}`, item.tipoProblema || "Problema de iluminação", `${item.endereco || "—"}, ${item.numero || "—"} ${item.bairro || ""}`.trim()].forEach(value => { row.insertCell().textContent=value; });
        const priorityCell=row.insertCell(); const priorityBadge=document.createElement("span"); const priorityValue=normalizedPriority(item); priorityBadge.className=`priority-badge priority-${priorityValue.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"")}`; priorityBadge.textContent=priorityValue; priorityCell.appendChild(priorityBadge);
        const statusCell=row.insertCell(); const badge=document.createElement("span"); badge.className=`status-badge ${stateClass(item.status || "Aberta")}`; badge.textContent=item.status === "Em andamento" ? "Em atendimento" : item.status === "Concluída" ? "Concluído" : "Aberto"; statusCell.appendChild(badge);
        row.insertCell().textContent=item.data || "—";
        const actionCell=row.insertCell(); const button=document.createElement("button"); button.type="button"; button.className="table-view"; button.textContent="Ver"; button.addEventListener("click",()=>{localStorage.setItem("chamadoSelecionado",String(item.id));location.href="atender-chamado.html";}); actionCell.appendChild(button);
    });
}
search.addEventListener("input",renderCases);
document.getElementById("applyCaseFilters").addEventListener("click",renderCases);
priority.addEventListener("change",renderCases); status.addEventListener("change",renderCases);
document.getElementById("logout").addEventListener("click",()=>{localStorage.removeItem("usuarioLogado");location.href="index.html";});
renderCases();





