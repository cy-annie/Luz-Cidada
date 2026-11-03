let managerAccount = null;
try { managerAccount = JSON.parse(localStorage.getItem("usuarioLogado") || "null"); } catch { managerAccount = null; }
if (!managerAccount) location.replace("index.html");
else if (managerAccount.perfil === "tecnico") location.replace("perfil-tecnico.html");
else if (managerAccount.perfil === "morador") location.replace("perfil.html");
else if (managerAccount.perfil !== "gestor") location.replace("index.html");

const managerDefaultFunction = "Gestor de iluminação pública";
const setManagerValue = (id, value) => { const field = document.getElementById(id); if (field) field.value = value || ""; };

if (managerAccount?.perfil === "gestor") {
  const name = managerAccount.nome || "Gestor";
  const initial = name.trim().charAt(0).toUpperCase() || "G";
  document.getElementById("nomeUsuario").textContent = name;
  document.getElementById("avatar").textContent = initial;
  document.getElementById("staffNameHeading").textContent = name;
  document.getElementById("staffRoleHeading").textContent = managerAccount.funcao || managerDefaultFunction;
  document.getElementById("staffInitial").textContent = initial;
  setManagerValue("staffName", managerAccount.nome);
  setManagerValue("staffEmail", managerAccount.email);
  setManagerValue("staffPhone", managerAccount.telefone);
  setManagerValue("staffFunction", managerAccount.funcao || managerDefaultFunction);
  setManagerValue("staffRegistration", managerAccount.matricula);
  setManagerValue("staffMunicipality", managerAccount.municipio);

  const photoKey = `fotoPerfil:${managerAccount.email}`;
  const photo = localStorage.getItem(photoKey);
  if (photo) showManagerPhoto(photo);
  const photoInput = document.getElementById("staffPhotoInput");
  document.getElementById("chooseStaffPhoto").addEventListener("click", () => photoInput.click());
  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { alert("Escolha uma imagem de até 2 MB."); photoInput.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { localStorage.setItem(photoKey, reader.result); showManagerPhoto(reader.result); };
    reader.readAsDataURL(file);
  });

  document.getElementById("staffPhone").addEventListener("input", event => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
    event.target.value = digits.length > 10 ? digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3") : digits.length > 6 ? digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3") : digits.length > 2 ? digits.replace(/^(\d{2})(\d*)/, "($1) $2") : digits;
  });

  document.getElementById("managerProfileForm").addEventListener("submit", event => {
    event.preventDefault();
    const updated = { ...managerAccount, nome: document.getElementById("staffName").value.trim(), telefone: document.getElementById("staffPhone").value.trim(), funcao: document.getElementById("staffFunction").value.trim(), matricula: document.getElementById("staffRegistration").value.trim(), municipio: document.getElementById("staffMunicipality").value.trim() };
    let users;
    try { const saved = JSON.parse(localStorage.getItem("usuarios") || "[]"); users = Array.isArray(saved) ? saved : []; }
    catch { alert("Não foi possível acessar os dados da conta neste navegador."); return; }
    const index = users.findIndex(user => user.email === managerAccount.email);
    if (index >= 0) users[index] = { ...users[index], ...updated };
    else users.push({ ...updated, authProvider: managerAccount.authProvider || "local" });
    localStorage.setItem("usuarios", JSON.stringify(users));
    localStorage.setItem("usuarioLogado", JSON.stringify(updated));
    Object.assign(managerAccount, updated);
    document.getElementById("staffNameHeading").textContent = updated.nome || "Gestor";
    document.getElementById("staffRoleHeading").textContent = updated.funcao || managerDefaultFunction;
    document.getElementById("nomeUsuario").textContent = updated.nome || "Gestor";
    document.getElementById("avatar").textContent = (updated.nome || "G").trim().charAt(0).toUpperCase();
    document.getElementById("staffInitial").textContent = (updated.nome || "G").trim().charAt(0).toUpperCase();
    alert("Perfil de gestão atualizado neste navegador.");
  });
  document.getElementById("cancelProfile").addEventListener("click", () => location.reload());
  document.getElementById("changeStaffPassword").addEventListener("click", () => {
    if (managerAccount.authProvider && managerAccount.authProvider !== "local") { alert("A senha desta conta é administrada pelo provedor de acesso."); return; }
    const current = prompt("Digite a senha atual:");
    if (current === null) return;
    if (current !== managerAccount.senha) { alert("A senha atual não confere."); return; }
    const next = prompt("Digite uma nova senha com pelo menos 8 caracteres:") || "";
    if (next.length < 8) { alert("A senha precisa ter pelo menos 8 caracteres."); return; }
    let users;
    try { const saved = JSON.parse(localStorage.getItem("usuarios") || "[]"); users = Array.isArray(saved) ? saved : []; }
    catch { alert("Não foi possível acessar os dados da conta neste navegador."); return; }
    let account = users.find(user => user.email === managerAccount.email);
    if (!account) { account = { ...managerAccount, authProvider: "local" }; users.push(account); }
    account.senha = next;
    managerAccount.senha = next;
    localStorage.setItem("usuarios", JSON.stringify(users));
    localStorage.setItem("usuarioLogado", JSON.stringify(managerAccount));
    alert("Senha alterada neste navegador.");
  });
}

function showManagerPhoto(src) {
  const target = document.getElementById("staffPhoto");
  target.querySelector("img")?.remove();
  const image = document.createElement("img");
  image.src = src;
  image.alt = "Foto de perfil do gestor";
  target.prepend(image);
}

document.getElementById("logout").addEventListener("click", () => { localStorage.removeItem("usuarioLogado"); location.href = "index.html"; });
