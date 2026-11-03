let staffAccount = null;
try { staffAccount = JSON.parse(localStorage.getItem("usuarioLogado") || "null"); } catch { staffAccount = null; }

if (staffAccount?.perfil === "tecnico") {
    try {
        const savedUsers = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const savedAccount = Array.isArray(savedUsers) && savedUsers.find(user =>
            user.perfil === "tecnico" && (
                (staffAccount.id != null && user.id === staffAccount.id) ||
                (staffAccount.email && user.email?.toLowerCase() === staffAccount.email.toLowerCase())
            )
        );
        if (savedAccount) staffAccount = { ...staffAccount, ...savedAccount };
    } catch { /* Mantém a sessão atual se a lista salva estiver indisponível. */ }
}

if (!staffAccount) location.replace("index.html");
else if (staffAccount.perfil === "gestor") location.replace("perfil-gestor.html");
else if (staffAccount.perfil === "morador") location.replace("perfil.html");
else if (staffAccount.perfil !== "tecnico") location.replace("index.html");

const roleName = "Técnico";
const defaultFunction = "Técnico de iluminação pública";
const dashboardHref = "dashboard-tecnico.html";
const setValue = (id,value) => { const node=document.getElementById(id); if(node) node.value=value||""; };

if (staffAccount?.perfil === "tecnico") {
    const name=staffAccount.nome||roleName;
    document.getElementById("nomeUsuario").textContent=name;
    document.getElementById("avatar").textContent=name.trim().charAt(0).toUpperCase();
    document.getElementById("roleLabel").textContent=roleName.toLocaleUpperCase("pt-BR");
    document.querySelectorAll(".user-info span").forEach(node=>node.textContent=roleName);
    document.getElementById("staffNameHeading").textContent=name;
    document.getElementById("staffRoleHeading").textContent=staffAccount.funcao||defaultFunction;
    document.getElementById("staffInitial").textContent=name.trim().charAt(0).toUpperCase();
    document.getElementById("staffAccessRole").value=roleName;
    document.querySelector('[data-staff-link="dashboard"]').href=dashboardHref;
    setValue("staffName",staffAccount.nome);setValue("staffEmail",staffAccount.email);setValue("staffPhone",staffAccount.telefone);
    setValue("staffFunction",staffAccount.funcao||defaultFunction);setValue("staffRegistration",staffAccount.matricula);setValue("staffTeam",staffAccount.equipe);setValue("staffMunicipality",staffAccount.municipio);

    const photoKey=`fotoPerfil:${staffAccount.email}`;const storedPhoto=localStorage.getItem(photoKey);if(storedPhoto)showStaffPhoto(storedPhoto);
    const photoInput=document.getElementById("staffPhotoInput");
    document.getElementById("chooseStaffPhoto").addEventListener("click",()=>photoInput.click());
    photoInput.addEventListener("change",()=>{const file=photoInput.files?.[0];if(!file)return;if(!file.type.startsWith("image/")||file.size>2*1024*1024){alert("Escolha uma imagem de até 2 MB.");photoInput.value="";return;}const reader=new FileReader();reader.onload=()=>{localStorage.setItem(photoKey,reader.result);showStaffPhoto(reader.result);};reader.readAsDataURL(file);});

    document.getElementById("staffPhone").addEventListener("input",event=>{const digits=event.target.value.replace(/\D/g,"").slice(0,11);event.target.value=digits.length>10?digits.replace(/^(\d{2})(\d{5})(\d{4}).*/,"($1) $2-$3"):digits.length>6?digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,"($1) $2-$3"):digits.length>2?digits.replace(/^(\d{2})(\d*)/,"($1) $2"):digits;});

    document.getElementById("staffProfileForm").addEventListener("submit",event=>{event.preventDefault();const users=JSON.parse(localStorage.getItem("usuarios")||"[]");const updated={...staffAccount,nome:document.getElementById("staffName").value.trim(),telefone:document.getElementById("staffPhone").value.trim(),funcao:document.getElementById("staffFunction").value.trim(),matricula:document.getElementById("staffRegistration").value.trim(),equipe:document.getElementById("staffTeam").value.trim(),municipio:document.getElementById("staffMunicipality").value.trim()};const index=users.findIndex(user=>user.perfil==="tecnico"&&((staffAccount.id!=null&&user.id===staffAccount.id)||user.email?.toLowerCase()===staffAccount.email?.toLowerCase()));if(index>=0)users[index]={...users[index],...updated};else users.push({...updated,perfil:"tecnico",authProvider:staffAccount.authProvider||"local"});localStorage.setItem("usuarios",JSON.stringify(users));localStorage.setItem("usuarioLogado",JSON.stringify(updated));document.getElementById("staffNameHeading").textContent=updated.nome;document.getElementById("staffRoleHeading").textContent=updated.funcao||defaultFunction;document.getElementById("nomeUsuario").textContent=updated.nome;document.getElementById("avatar").textContent=updated.nome.charAt(0).toUpperCase();document.getElementById("staffInitial").textContent=updated.nome.charAt(0).toUpperCase();alert("Perfil profissional atualizado neste navegador.");});
    document.getElementById("cancelProfile").addEventListener("click",()=>location.reload());
    document.getElementById("changeStaffPassword").addEventListener("click",()=>{if(staffAccount.authProvider&&staffAccount.authProvider!=="local"){alert("A senha desta conta é administrada pelo provedor de acesso.");return;}const oldPassword=prompt("Digite a senha atual:");if(oldPassword===null)return;if(oldPassword!==staffAccount.senha){alert("A senha atual não confere.");return;}const next=prompt("Digite uma nova senha com pelo menos 8 caracteres:")||"";if(next.length<8){alert("A senha precisa ter pelo menos 8 caracteres.");return;}const users=JSON.parse(localStorage.getItem("usuarios")||"[]");let account=users.find(user=>user.perfil==="tecnico"&&((staffAccount.id!=null&&user.id===staffAccount.id)||user.email?.toLowerCase()===staffAccount.email?.toLowerCase()));if(!account){account={...staffAccount,perfil:"tecnico",authProvider:"local"};users.push(account);}account.senha=next;staffAccount.senha=next;localStorage.setItem("usuarios",JSON.stringify(users));localStorage.setItem("usuarioLogado",JSON.stringify(staffAccount));alert("Senha alterada neste navegador.");});
}

function showStaffPhoto(src){const target=document.getElementById("staffPhoto");target.querySelector("img")?.remove();const image=document.createElement("img");image.src=src;image.alt="Foto de perfil profissional";target.prepend(image);}
document.getElementById("logout").addEventListener("click",()=>{localStorage.removeItem("usuarioLogado");location.href="index.html";});
