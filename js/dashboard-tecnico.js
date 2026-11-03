const staffUser = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
const onManagerDashboard = /dashboard-gestor\.html$/i.test(location.pathname);
if (!staffUser) location.replace("index.html");
else if (staffUser.perfil === "gestor" && !onManagerDashboard) location.replace("dashboard-gestor.html");
else if (onManagerDashboard && staffUser.perfil !== "gestor") location.replace("dashboard-tecnico.html");
else if (staffUser.perfil === "morador") location.replace("dashboard.html");

if (staffUser) {
    const roleLabel = staffUser.perfil === "gestor" ? "Gestor" : "Técnico";
    const name = staffUser.nome || roleLabel;
    document.getElementById("nomeUsuario").textContent = name;
    document.getElementById("avatar").textContent = name.trim().charAt(0).toUpperCase();
    const greeting = document.getElementById("nomeBoasVindas");
    if (greeting) greeting.textContent = name;
    document.querySelectorAll(".user-info span, .breadcrumb").forEach(node => { node.textContent = roleLabel.toLocaleUpperCase("pt-BR"); });
    document.querySelectorAll(".manager-only").forEach(node => { node.hidden = staffUser.perfil !== "gestor"; });
    const currentDashboard = staffUser.perfil === "gestor" ? "dashboard-gestor.html" : "dashboard-tecnico.html";
    document.querySelectorAll('.staff-menu a[href="dashboard-tecnico.html"]').forEach(link => { link.href = currentDashboard; });
}

const storedCases = JSON.parse(localStorage.getItem("ocorrencias") || "[]");
const cases = staffUser?.perfil === "gestor" ? storedCases : storedCases.filter(item => item.tecnicoEmail === staffUser?.email);
const table = document.getElementById("tabelaChamadosTecnico");
const searchInput = document.getElementById("pesquisaChamados");
const periodSelect = document.getElementById("periodoFiltro");

function caseDate(item) {
    if (item.dataISO) { const parsed = new Date(item.dataISO); if (!Number.isNaN(parsed.valueOf())) return parsed; }
    const parts = (item.data || "").split("/");
    return parts.length === 3 ? new Date(+parts[2], +parts[1] - 1, +parts[0]) : null;
}
function isInPeriod(item, period) {
    const date = caseDate(item); if (!date) return true;
    const now = new Date();
    if (period === "dia") return date.toDateString() === now.toDateString();
    if (period === "semana") { const from = new Date(now); from.setDate(now.getDate() - 7); return date >= from && date <= now; }
    if (period === "mes") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === "semestre") return date.getFullYear() === now.getFullYear() && Math.floor(date.getMonth() / 6) === Math.floor(now.getMonth() / 6);
    if (period === "ano") return date.getFullYear() === now.getFullYear();
    return true;
}
function put(id, value) { const node = document.getElementById(id); if (node) node.textContent = String(value); }
function statusClass(status) { return status === "Concluída" ? "status-concluida" : status === "Em andamento" ? "status-em-andamento" : "status-aberta"; }

function renderStaffDashboard() {
    const query = (searchInput?.value || "").trim().toLocaleLowerCase("pt-BR");
    const period = periodSelect?.value || "mes";
    const shown = cases.filter(item => isInPeriod(item, period) && [item.numeroChamado, item.tipoProblema, item.endereco, item.numero, item.bairro, item.cidade, item.estado].join(" ").toLocaleLowerCase("pt-BR").includes(query));
    const opened = shown.filter(item => !item.status || item.status === "Aberta").length;
    const active = shown.filter(item => item.status === "Em andamento").length;
    const closed = shown.filter(item => item.status === "Concluída").length;
    const risk = shown.filter(item => item.status !== "Concluída" && caseDate(item) && Date.now() - caseDate(item).getTime() >= 72 * 60 * 60 * 1000).length;
    put("chamadosAbertos", opened); put("chamadosAndamento", active); put("chamadosConcluidos", closed); put("chamadosSla", risk); put("totalChamados", shown.length);
    if (!table) return;
    table.replaceChildren();
    if (!shown.length) { const row = table.insertRow(); const cell = row.insertCell(); cell.colSpan = 6; cell.className = "empty-state"; cell.textContent = "Nenhum chamado encontrado para os filtros selecionados."; return; }
    shown.forEach((item, index) => {
        const row = table.insertRow();
        [item.numeroChamado ? `#${item.numeroChamado}` : `#${index + 1}`, item.tipoProblema || "—", `${item.endereco || "—"}, ${item.numero || "—"}`, item.data || "—"].forEach(value => { row.insertCell().textContent = value; });
        const statusCell = row.insertCell(); const badge = document.createElement("span"); badge.className = `status-badge ${statusClass(item.status)}`; badge.textContent = item.status || "Aberta"; statusCell.appendChild(badge);
        const actionCell = row.insertCell(); const action = document.createElement("button"); action.type = "button"; action.className = "table-view"; action.textContent = "Ver"; action.setAttribute("aria-label", `Ver chamado ${item.numeroChamado || index + 1}`); action.addEventListener("click", () => { localStorage.setItem("chamadoSelecionado", String(item.id)); location.href = "atender-chamado.html"; }); actionCell.appendChild(action);
    });
}

searchInput?.addEventListener("input", renderStaffDashboard);
periodSelect?.addEventListener("change", renderStaffDashboard);
document.getElementById("btnFiltrar")?.addEventListener("click", renderStaffDashboard);
document.getElementById("logout")?.addEventListener("click", () => { localStorage.removeItem("usuarioLogado"); location.href = "index.html"; });
renderStaffDashboard();


