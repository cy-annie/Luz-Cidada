const staffViewer = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
const records = JSON.parse(localStorage.getItem("ocorrencias") || "[]");
const selectedId = localStorage.getItem("chamadoSelecionado");
const record = records.find(item => String(item.id) === String(selectedId));
const isManager = staffViewer?.perfil === "gestor";
const isTechnician = staffViewer?.perfil === "tecnico";
const roleName = isManager ? "Gestor" : "Técnico";
const dashboardLink = document.querySelector('[data-staff-link="dashboard"]');
if (dashboardLink) dashboardLink.href = isManager ? "dashboard-gestor.html" : "dashboard-tecnico.html";
const profileLink = document.querySelector('.staff-menu a[href="perfil-tecnico.html"]');
if (profileLink) profileLink.href = isManager ? "perfil-gestor.html" : "perfil-tecnico.html";
document.querySelectorAll(".manager-only").forEach(node => { node.hidden = !isManager; });

if (!staffViewer) location.replace("index.html");
else if (!isManager && !isTechnician) location.replace("dashboard.html");
else if (!record) {
    alert("Chamado não encontrado. Selecione uma ocorrência na lista.");
    location.replace("ocorrencias-tecnico.html");
} else if (isTechnician && record.tecnicoEmail !== staffViewer.email) {
    alert("Este chamado ainda não foi atribuído a você. Aguarde a distribuição do gestor.");
    location.replace("ocorrencias-tecnico.html");
} else {
    const name = staffViewer.nome || roleName;
    document.getElementById("nomeUsuario").textContent = name;
    document.getElementById("avatar").textContent = name.trim().charAt(0).toUpperCase();
    document.querySelectorAll(".user-info span").forEach(node => { node.textContent = roleName; });
    document.querySelectorAll(".breadcrumb").forEach(node => { node.textContent = `${roleName.toLocaleUpperCase("pt-BR")} / OCORRÊNCIA`; });

    const protocol = `ILU-${new Date().getFullYear()}-${String(record.numeroChamado || "—").padStart(4, "0")}`;
    document.getElementById("tituloChamado").textContent = protocol;
    const statusNode = document.getElementById("statusChamado");
    const statusSelect = document.getElementById("statusAtendimento");
    const serviceCard = document.querySelector(".service-card");
    const triageCard = document.getElementById("triageCard");
    const statusOf = value => value === "Em andamento" ? "Em atendimento" : value === "Concluída" ? "Concluído" : "Aberto";
    const statusClass = value => value === "Concluída" ? "status-concluida" : value === "Em andamento" ? "status-em-andamento" : "status-aberta";
    const showStatus = value => { statusNode.textContent = statusOf(value); statusNode.className = `status-badge ${statusClass(value)}`; };

    showStatus(record.status || "Aberta");
    statusSelect.value = record.status || "Aberta";
    document.getElementById("tipoProblema").textContent = record.tipoProblema || "—";
    document.getElementById("prioridadeOcorrencia").textContent = record.prioridade || "Média";
    document.getElementById("dataOcorrencia").textContent = record.data || "—";
    document.getElementById("cepOcorrencia").textContent = record.cep || "—";
    document.getElementById("cidadeOcorrencia").textContent = record.cidade || "—";
    document.getElementById("estadoOcorrencia").textContent = record.estado || "—";
    document.getElementById("enderecoOcorrencia").textContent = `${record.endereco || "—"}, ${record.numero || "—"}`;
    document.getElementById("bairroOcorrencia").textContent = record.bairro || "—";
    document.getElementById("descricaoOcorrencia").textContent = record.descricao || "Nenhuma descrição informada.";
    document.getElementById("observacaoTecnica").value = record.observacaoTecnica || "";
    document.getElementById("registroManutencao").value = record.registroManutencao || record.respostaTecnico || "";
    if (record.referencia) { document.getElementById("referenciaOcorrencia").textContent = record.referencia; document.getElementById("referenciaItem").hidden = false; }
    if (record.foto) { const image = document.getElementById("fotoOcorrencia"); image.src = record.foto; image.hidden = false; }

    function history() { if (!Array.isArray(record.historico)) record.historico = []; return record.historico; }
    function addHistory(action, details) {
        history().unshift({ dataISO: new Date().toISOString(), usuario: name, perfil: roleName, acao: action, detalhes: details });
    }
    function saveRecords() {
        const index = records.findIndex(item => String(item.id) === String(record.id));
        if (index >= 0) records[index] = record;
        try { localStorage.setItem("ocorrencias", JSON.stringify(records)); return true; }
        catch { alert("Não foi possível salvar a atualização. O armazenamento do navegador pode estar cheio; tente remover fotos antigas ou liberar espaço."); return false; }
    }
    function renderHistory() {
        const timeline = document.getElementById("occurrenceTimeline");
        timeline.replaceChildren();
        const events = history();
        if (!events.length) {
            const empty = document.createElement("li");
            empty.className = "timeline-empty";
            empty.textContent = "Esta ocorrência ainda não possui histórico detalhado. As próximas alterações serão registradas aqui.";
            timeline.appendChild(empty);
            return;
        }
        events.forEach(event => {
            const item = document.createElement("li");
            const heading = document.createElement("strong"); heading.textContent = event.acao || "Atualização";
            const meta = document.createElement("span");
            const date = new Date(event.dataISO || Date.now());
            meta.textContent = `${event.usuario || "Usuário"} · ${event.perfil || "Conta"} · ${date.toLocaleString("pt-BR")}`;
            item.append(heading, meta);
            if (event.detalhes) { const details = document.createElement("p"); details.textContent = event.detalhes; item.appendChild(details); }
            timeline.appendChild(item);
        });
    }

    if (isManager) {
        triageCard.hidden = false;
        serviceCard.hidden = true;
        const technicianSelect = document.getElementById("tecnicoResponsavel");
        const savedUsers = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const technicians = savedUsers.filter(user => user.perfil === "tecnico");
        const fallbackDemo = { nome: "Técnico de demonstração", email: "tecnico@luzcidada.com", perfil: "tecnico" };
        if (!technicians.some(user => user.email === fallbackDemo.email)) technicians.push(fallbackDemo);
        technicians.forEach(technician => {
            const option = document.createElement("option"); option.value = technician.email; option.textContent = `${technician.nome} (${technician.email})`; technicianSelect.appendChild(option);
        });
        technicianSelect.value = record.tecnicoEmail || "";
        document.getElementById("prioridadeTriagem").value = ["Baixa", "Média", "Alta", "Urgente"].includes(record.prioridade) ? record.prioridade : "Média";
        document.getElementById("salvarTriagem").addEventListener("click", () => {
            const nextEmail = technicianSelect.value;
            const technician = technicians.find(user => user.email === nextEmail);
            const nextPriority = document.getElementById("prioridadeTriagem").value;
            const previousEmail = record.tecnicoEmail || "";
            const previousPriority = record.prioridade || "Média";
            const previousStatus = record.status || "Aberta";
            record.tecnicoEmail = nextEmail;
            record.tecnicoNome = technician?.nome || "";
            record.prioridade = nextPriority;
            if (!nextEmail && record.status === "Em andamento") record.status = "Aberta";
            record.atualizadoEm = new Date().toISOString();
            const changes = [];
            if (previousEmail !== nextEmail) changes.push(`Responsável: ${technician?.nome || "sem atribuição"}`);
            if (previousPriority !== nextPriority) changes.push(`Prioridade: ${nextPriority}`);
            if (previousStatus !== record.status) changes.push(`Status: ${statusOf(record.status)}`);
            if (changes.length) addHistory("Triagem atualizada", changes.join(" · "));
            if (!saveRecords()) return;
            alert(changes.length ? "Triagem salva e registrada no histórico." : "Nenhuma alteração na triagem.");
            location.href = "ocorrencias-tecnico.html";
        });
    } else {
        triageCard.hidden = true;
        document.getElementById("salvarAtendimento").addEventListener("click", () => {
            const nextStatus = statusSelect.value;
            const observation = document.getElementById("observacaoTecnica").value.trim();
            const maintenance = document.getElementById("registroManutencao").value.trim();
            if (nextStatus === "Concluída" && !maintenance) { alert("Registre o serviço realizado antes de concluir o chamado."); document.getElementById("registroManutencao").focus(); return; }
            if (!observation && !maintenance) { alert("Preencha uma observação técnica ou o registro da manutenção antes de salvar."); return; }
            const previousStatus = record.status || "Aberta";
            record.status = nextStatus;
            record.observacaoTecnica = observation;
            record.registroManutencao = maintenance;
            record.respostaTecnico = maintenance;
            record.responsavelAtendimento = name;
            record.atualizadoEm = new Date().toISOString();
            addHistory("Atendimento atualizado", `Status: ${statusOf(previousStatus)} → ${statusOf(nextStatus)}${observation ? ` · Observação: ${observation}` : ""}${maintenance ? ` · Manutenção: ${maintenance}` : ""}`);
            if (!saveRecords()) return;
            alert("Atendimento salvo e adicionado ao histórico.");
            location.href = "ocorrencias-tecnico.html";
        });
    }
    renderHistory();
}

function voltarChamados() { location.href = "ocorrencias-tecnico.html"; }
document.getElementById("logout")?.addEventListener("click", () => { localStorage.removeItem("usuarioLogado"); location.href = "index.html"; });



