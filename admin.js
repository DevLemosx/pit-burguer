// Painel do proprietário — Appwrite Auth + permissões de tabela e linha.
let adminEditorBound = false;

function setAdminStatus(target, message = "", state = ""){
  const element = document.getElementById(target);
  element.textContent = message;
  element.dataset.state = state;
}

function setLoginBusy(busy){
  const button = document.getElementById("adminLoginBtn");
  button.disabled = busy;
  button.setAttribute("aria-busy", String(busy));
  button.textContent = busy ? "Entrando…" : "Entrar";
}

function showLogin(message = "", state = "error"){
  document.getElementById("adminApp").hidden = true;
  document.getElementById("adminGate").hidden = false;
  setAdminStatus("adminLoginStatus", message, state);
}

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[char]);
}

function safeImageUrl(value){
  try {
    const url = new URL(value, window.location.href);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

async function enterAdmin(user){
  if (!user){
    showLogin();
    return;
  }

  setAdminStatus("adminLoginStatus", "Conferindo acesso…", "pending");
  if (!window.PIT_APPWRITE_CONFIG?.adminUserId || user.$id !== window.PIT_APPWRITE_CONFIG.adminUserId){
    try { await window.pitAppwriteAccount.deleteSession({ sessionId: "current" }); } catch { /* mantém a mensagem de erro visível */ }
    showLogin("Este usuário não tem permissão para administrar o cardápio.", "error");
    return;
  }

  const gate = document.getElementById("adminGate");
  gate.hidden = true;
  document.getElementById("adminApp").hidden = false;
  setAdminStatus("adminLoginStatus");

  try {
    await loadAdminMenu();
    renderAdminCategories();
    bindAdminEditor();
  } catch (error) {
    try { await window.pitAppwriteAccount.deleteSession({ sessionId: "current" }); } catch { /* mantém a mensagem de erro visível */ }
    showLogin(`Não foi possível carregar o cardápio: ${error.message}`, "error");
  }
}

async function loadAdminMenu(){
  const config = window.PIT_APPWRITE_CONFIG;
  const tables = window.pitAppwriteTables;
  try {
    const row = await tables.getRow({
      databaseId: config.databaseId,
      tableId: config.tableId,
      rowId: "main"
    });
    window.applyPitMenuConfig(JSON.parse(row.config_json));
    setAdminStatus("adminSaveStatus", "Cardápio carregado.", "success");
    return;
  } catch (error) {
    if (Number(error?.code) !== 404) throw error;
  }

  // No primeiro acesso autorizado, salva a versão local atual como ponto de partida.
  if (!config.adminUserId) throw new Error("Configure o ID do usuário administrador no appwrite-config.js.");
  const { Permission, Role } = window.pitAppwriteSdk;
  await tables.createRow({
    databaseId: config.databaseId,
    tableId: config.tableId,
    rowId: "main",
    data: { config_json: JSON.stringify(window.getPitMenuConfig()) },
    permissions: [
      Permission.read(Role.any()),
      Permission.update(Role.user(config.adminUserId)),
      Permission.delete(Role.user(config.adminUserId))
    ]
  });
  setAdminStatus("adminSaveStatus", "Cardápio inicial preparado. Revise e salve suas alterações.", "success");
}

function bindAdminEditor(){
  document.getElementById("cfgWhatsapp").value = WHATSAPP_NUMBER;
  document.getElementById("cfgPayments").value = PAYMENT_METHODS.join(", ");

  if (adminEditorBound) return;
  adminEditorBound = true;

  document.getElementById("cfgWhatsapp").addEventListener("input", event => {
    WHATSAPP_NUMBER = event.target.value.replace(/\D/g, "");
  });
  document.getElementById("cfgPayments").addEventListener("input", event => {
    PAYMENT_METHODS = event.target.value.split(",").map(value => value.trim()).filter(Boolean);
  });

  document.getElementById("saveMenuBtn").addEventListener("click", saveAdminMenu);
}

function renderAdminCategories(){
  const wrap = document.getElementById("adminCategories");
  wrap.replaceChildren();

  const addonsBlock = document.createElement("details");
  addonsBlock.className = "admin-cat-block";
  const addonsSummary = document.createElement("summary");
  addonsSummary.textContent = `Adicionais (${ADDONS.length} itens)`;
  addonsBlock.appendChild(addonsSummary);
  ADDONS.forEach(item => addonsBlock.appendChild(renderAdminItemRow(item)));
  wrap.appendChild(addonsBlock);

  Object.entries(MENU_DATA).forEach(([catKey, category]) => {
    const block = document.createElement("details");
    block.className = "admin-cat-block";
    block.open = catKey === "lanches";
    const summary = document.createElement("summary");
    summary.textContent = `${category.label} (${category.items.length} itens)`;
    block.appendChild(summary);
    category.items.forEach(item => block.appendChild(renderAdminItemRow(item)));
    wrap.appendChild(block);
  });
}

function renderAdminItemRow(item){
  const row = document.createElement("div");
  row.className = "admin-item-row";

  const hasFlavors = Array.isArray(item.flavors);
  const hasGas = Boolean(item.gasOption);
  const image = safeImageUrl(item.image || "");
  const fieldId = String(item.id || item.name).replace(/[^a-zA-Z0-9_-]/g, "-");

  row.innerHTML = `
    <img class="admin-item-thumb" src="${escapeHTML(image)}" alt="" ${image ? "" : "hidden"}>
    <div class="admin-item-fields">
      <div class="admin-item-name">${escapeHTML(item.name)}</div>
      <div class="admin-inline-fields">
        <div>
          <label for="${fieldId}-price">Preço (R$)</label>
          <input id="${fieldId}-price" type="number" step="0.01" min="0" data-field="price" value="${escapeHTML(item.price)}">
        </div>
        ${hasGas ? `
        <div>
          <label for="${fieldId}-gas-price">Acréscimo com gás (R$)</label>
          <input id="${fieldId}-gas-price" type="number" step="0.01" min="0" data-field="gasPrice" value="${escapeHTML(item.gasPrice)}">
        </div>` : ""}
        <div class="admin-avail-toggle">
          <input id="${fieldId}-available" type="checkbox" data-field="available" ${item.available ? "checked" : ""}>
          <label for="${fieldId}-available">Disponível</label>
        </div>
      </div>
      <div>
        <label class="admin-sub-label" for="${fieldId}-image">URL da foto</label>
        <input id="${fieldId}-image" type="url" data-field="image" value="${escapeHTML(item.image || "")}" placeholder="https://...">
      </div>
      <div>
        <label class="admin-sub-label" for="${fieldId}-file">Ou envie uma foto</label>
        <input id="${fieldId}-file" type="file" data-field="imageFile" accept="image/jpeg,image/png,image/webp">
        <span class="admin-file-hint">JPG, PNG ou WebP · até 5 MB</span>
      </div>
      ${hasFlavors ? `
      <div>
        <label class="admin-sub-label" for="${fieldId}-flavors">Sabores (separados por vírgula)</label>
        <input id="${fieldId}-flavors" type="text" data-field="flavors" value="${escapeHTML(item.flavors.join(", "))}">
      </div>` : ""}
    </div>
  `;

  row.querySelector('[data-field="price"]').addEventListener("input", event => {
    const price = Number(event.target.value);
    item.price = Number.isFinite(price) ? price : 0;
  });
  if (hasGas){
    row.querySelector('[data-field="gasPrice"]').addEventListener("input", event => {
      const price = Number(event.target.value);
      item.gasPrice = Number.isFinite(price) ? price : 0;
    });
  }
  row.querySelector('[data-field="available"]').addEventListener("change", event => {
    item.available = event.target.checked;
  });
  const imageInput = row.querySelector('[data-field="image"]');
  imageInput.addEventListener("input", event => {
    item.image = event.target.value.trim();
    const preview = row.querySelector(".admin-item-thumb");
    const safeUrl = safeImageUrl(item.image);
    preview.hidden = !safeUrl;
    if (safeUrl) preview.src = safeUrl;
    else preview.removeAttribute("src");
  });
  const fileInput = row.querySelector('[data-field="imageFile"]');
  fileInput.addEventListener("change", () => uploadProductImage(item, row, fileInput));
  if (hasFlavors){
    row.querySelector('[data-field="flavors"]').addEventListener("input", event => {
      item.flavors = event.target.value.split(",").map(value => value.trim()).filter(Boolean);
    });
  }
  return row;
}

async function uploadProductImage(item, row, input){
  const file = input.files?.[0];
  if (!file) return;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024){
    setAdminStatus("adminSaveStatus", "Escolha uma imagem JPG, PNG ou WebP de até 5 MB.", "error");
    input.value = "";
    return;
  }

  input.disabled = true;
  setAdminStatus("adminSaveStatus", `Enviando a foto de ${item.name}…`, "pending");
  try {
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
    const itemId = String(item.id || "produto").replace(/[^a-zA-Z0-9_-]/g, "-");
    const uniqueId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${itemId}-${uniqueId}.${extension}`;
    const uploaded = await window.pitAppwriteStorage.createFile({
      bucketId: window.PIT_APPWRITE_CONFIG.bucketId,
      fileId: window.pitAppwriteSdk.ID.unique(),
      file
    });
    item.image = window.pitAppwriteStorage.getFileView({
      bucketId: window.PIT_APPWRITE_CONFIG.bucketId,
      fileId: uploaded.$id
    }).toString();
    const imageInput = row.querySelector('[data-field="image"]');
    imageInput.value = item.image;
    const preview = row.querySelector(".admin-item-thumb");
    preview.src = item.image;
    preview.hidden = false;
    setAdminStatus("adminSaveStatus", "Foto enviada. Clique em Salvar alterações para publicar o cardápio.", "success");
  } catch (error) {
    setAdminStatus("adminSaveStatus", `Não foi possível enviar a foto: ${error.message}`, "error");
  } finally {
    input.disabled = false;
    input.value = "";
  }
}

async function saveAdminMenu(){
  const button = document.getElementById("saveMenuBtn");
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = "Salvando…";
  setAdminStatus("adminSaveStatus", "Enviando alterações…", "pending");

  try {
    await window.pitAppwriteTables.updateRow({
      databaseId: window.PIT_APPWRITE_CONFIG.databaseId,
      tableId: window.PIT_APPWRITE_CONFIG.tableId,
      rowId: "main",
      data: { config_json: JSON.stringify(window.getPitMenuConfig()) }
    });
    setAdminStatus("adminSaveStatus", "Alterações salvas. Novas visitas já recebem o cardápio atualizado.", "success");
  } catch (error) {
    setAdminStatus("adminSaveStatus", `Não foi possível salvar: ${error.message}`, "error");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent = "Salvar alterações";
  }
}

async function handleAdminLogin(event){
  event.preventDefault();
  if (!window.pitAppwriteConfigured || !window.pitAppwriteAdminConfigured){
    setAdminStatus("adminLoginStatus", "Configure o Appwrite e o ID do usuário administrador antes de entrar.", "error");
    return;
  }
  if (window.location.protocol === "file:"){
    setAdminStatus("adminLoginStatus", "Abra o painel por http://localhost:8000/admin.html para conectar ao Appwrite.", "error");
    return;
  }

  setLoginBusy(true);
  setAdminStatus("adminLoginStatus", "Validando acesso…", "pending");
  const email = document.getElementById("adminEmailInput").value.trim();
  const password = document.getElementById("adminPasswordInput").value;
  let user;
  let error;
  try {
    await window.pitAppwriteAccount.createEmailPasswordSession({ email, password });
    user = await window.pitAppwriteAccount.get();
  } catch (requestError) {
    error = requestError;
  }

  setLoginBusy(false);
  if (error){
    console.error("Falha no login do Appwrite", error);
    if (Number(error?.code) === 401){
      setAdminStatus("adminLoginStatus", "E-mail ou senha não correspondem à conta criada no projeto Pit Burguer.", "error");
    } else {
      setAdminStatus("adminLoginStatus", `Não foi possível validar o login com o Appwrite${error?.message ? `: ${error.message}` : "."}`, "error");
    }
    return;
  }
  await enterAdmin(user);
}

async function logoutAdmin(){
  let error;
  try {
    await window.pitAppwriteAccount.deleteSession({ sessionId: "current" });
  } catch (requestError) {
    error = requestError;
  }
  if (error){
    setAdminStatus("adminSaveStatus", `Não foi possível sair: ${error.message}`, "error");
    return;
  }
  document.getElementById("adminLoginForm").reset();
  showLogin("Você saiu do painel.", "success");
}

document.addEventListener("DOMContentLoaded", async () => {
  const configured = Boolean(window.pitAppwriteConfigured && window.pitAppwriteAdminConfigured);
  document.getElementById("adminSetupNote").hidden = configured;
  document.getElementById("adminLoginForm").addEventListener("submit", handleAdminLogin);
  document.getElementById("adminLogoutBtn").addEventListener("click", logoutAdmin);

  if (!configured){
    document.getElementById("adminEmailInput").disabled = true;
    document.getElementById("adminPasswordInput").disabled = true;
    document.getElementById("adminLoginBtn").disabled = true;
    return;
  }

  try {
    const user = await window.pitAppwriteAccount.get();
    await enterAdmin(user);
  } catch {
    // Sem sessão ativa: o formulário de login continua disponível.
  }
});
