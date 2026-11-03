const form = document.getElementById("ocorrenciaForm");
const savedSession = localStorage.getItem("usuarioLogado");
const sessionUser = savedSession ? JSON.parse(savedSession) : null;

if (!sessionUser) window.location.replace("index.html");
else if (["tecnico", "gestor"].includes(sessionUser.perfil)) window.location.replace(sessionUser.perfil === "gestor" ? "dashboard-gestor.html" : "dashboard-tecnico.html");
else {
    const displayName = document.getElementById("nomeUsuario");
    const avatar = document.getElementById("avatar");
    if (displayName) displayName.textContent = sessionUser.nome || "Usuário";
    if (avatar) avatar.textContent = (sessionUser.nome || "U").trim().charAt(0).toUpperCase();
}

const photoField = document.getElementById("foto");
const fileName = document.getElementById("file-name");
if (photoField && fileName) photoField.addEventListener("change", () => {
    const file = photoField.files?.[0];
    if (!file) { fileName.textContent = ""; return; }
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
        alert("Escolha uma imagem de até 2 MB.");
        photoField.value = "";
        fileName.textContent = "";
        return;
    }
    fileName.textContent = file.name;
});

const cepField = document.getElementById("cep");
if (cepField) cepField.addEventListener("input", () => {
    const digits = cepField.value.replace(/\D/g, "").slice(0, 8);
    cepField.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
});

const stateField = document.getElementById("estado");
if (stateField) stateField.addEventListener("input", () => { stateField.value = stateField.value.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase(); });

const cancelButton = document.getElementById("cancelar");
if (cancelButton) cancelButton.addEventListener("click", () => {
    const destination = sessionUser?.perfil === "tecnico" || sessionUser?.perfil === "gestor" ? "dashboard-tecnico.html" : "dashboard.html";
    window.location.href = destination;
});

const logout = document.getElementById("logout");
if (logout) logout.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
});

if (form) form.addEventListener("submit", event => {
    event.preventDefault();
    if (!sessionUser) return;

    let photoData = "";
    const storeOccurrence = () => {
        try {
            const items = JSON.parse(localStorage.getItem("ocorrencias") || "[]");
            const now = new Date();
            items.push({
                id: Date.now(),
                numeroChamado: items.reduce((max, item) => Math.max(max, Number(item.numeroChamado) || 0), 0) + 1,
                userEmail: sessionUser.email,
                cep: document.getElementById("cep").value.trim(),
                cidade: document.getElementById("cidade").value.trim(),
                estado: document.getElementById("estado").value.trim().toUpperCase(),
                numero: document.getElementById("numero").value.trim(),
                endereco: document.getElementById("endereco").value.trim(),
                bairro: document.getElementById("bairro").value.trim(),
                referencia: document.getElementById("referencia").value.trim(),
                tipoProblema: document.getElementById("tipoProblema").selectedOptions[0].textContent.trim(),
                tipoProblemaValor: document.getElementById("tipoProblema").value,
                prioridade: document.getElementById("prioridade").value || "Média",
                descricao: document.getElementById("descricao").value.trim(),
                foto: photoData,
                status: "Aberta",
                data: now.toLocaleDateString("pt-BR"),
                dataISO: now.toISOString(),
                criadoPor: sessionUser.nome || sessionUser.email,
                historico: [{ dataISO: now.toISOString(), usuario: sessionUser.nome || sessionUser.email, perfil: "Morador", acao: "Ocorrência registrada", detalhes: "Solicitação enviada para triagem." }]
            });
            localStorage.setItem("ocorrencias", JSON.stringify(items));
            alert("Ocorrência registrada com sucesso!");
            window.location.href = "dashboard.html";
        } catch {
            alert("Não foi possível salvar. Remova a imagem ou limpe espaço no armazenamento deste navegador e tente novamente.");
        }
    };

    const image = photoField?.files?.[0];
    if (image) {
        const reader = new FileReader();
        reader.onload = () => { photoData = reader.result; storeOccurrence(); };
        reader.onerror = () => alert("Não foi possível ler a imagem selecionada.");
        reader.readAsDataURL(image);
    } else storeOccurrence();
});

