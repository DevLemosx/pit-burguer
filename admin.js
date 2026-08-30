// ==========================================================================
// Painel do Proprietário — edita MENU_DATA / ADDONS / COMBO_DRINK_OPTIONS /
// WHATSAPP_NUMBER / PAYMENT_METHODS em memória e exporta um data.js novo.
// ==========================================================================

// Troque esta senha antes de publicar o site. Lembre-se: é só uma barreira
// simples, não é segurança de verdade (veja o aviso no painel).
const ADMIN_PASSWORD = "pitburguer2026";

function checkAdminPassword(){
  const input = document.getElementById("adminPasswordInput");
  const error = document.getElementById("adminLoginError");
  if (input.value === ADMIN_PASSWORD){
    document.getElementById("adminGate").style.display = "none";
    document.getElementById("adminApp").style.display = "block";
    initAdminApp();
  } else {
    error.style.display = "block";
  }
}

function initAdminApp(){
  document.getElementById("cfgWhatsapp").value = WHATSAPP_NUMBER;
  document.getElementById("cfgPayments").value = PAYMENT_METHODS.join(", ");

  document.getElementById("cfgWhatsapp").addEventListener("input", (e) => {
    WHATSAPP_NUMBER = e.target.value.trim();
  });
  document.getElementById("cfgPayments").addEventListener("input", (e) => {
    PAYMENT_METHODS = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
  });

  renderAdminCategories();
  document.getElementById("exportBtn").addEventListener("click", exportDataJS);
}

function renderAdminCategories(){
  const wrap = document.getElementById("adminCategories");
  wrap.innerHTML = "";
  Object.entries(MENU_DATA).forEach(([catKey, cat]) => {
    const block = document.createElement("details");
    block.className = "admin-cat-block";
    block.open = catKey === "lanches";
    const summary = document.createElement("summary");
    summary.textContent = `${cat.label} (${cat.items.length} itens)`;
    block.appendChild(summary);
    cat.items.forEach(item => block.appendChild(renderAdminItemRow(item)));
    wrap.appendChild(block);
  });
}

function renderAdminItemRow(item){
  const row = document.createElement("div");
  row.className = "admin-item-row";

  const hasFlavors = Array.isArray(item.flavors);
  const hasGas = !!item.gasOption;

  row.innerHTML = `
    <img class="admin-item-thumb" src="${item.image || ""}" alt="" onerror="this.style.visibility='hidden'">
    <div class="admin-item-fields">
      <div class="admin-item-name">${item.name}</div>
      <div class="admin-inline-fields">
        <div>
          <label>Preço (R$)</label>
          <input type="number" step="0.01" min="0" data-field="price" value="${item.price}">
        </div>
        ${hasGas ? `
        <div>
          <label>Acréscimo c/ gás (R$)</label>
          <input type="number" step="0.01" min="0" data-field="gasPrice" value="${item.gasPrice}">
        </div>` : ""}
        <div class="admin-avail-toggle" style="align-self:end;">
          <input type="checkbox" data-field="available" ${item.available ? "checked" : ""}>
          <label style="margin:0;">Disponível</label>
        </div>
      </div>
      <div>
        <label style="font-size:0.72rem;color:var(--muted);margin-bottom:3px;display:block;">URL da foto</label>
        <input type="text" data-field="image" value="${item.image || ""}" placeholder="https://...">
      </div>
      ${hasFlavors ? `
      <div>
        <label style="font-size:0.72rem;color:var(--muted);margin-bottom:3px;display:block;">Sabores (separados por vírgula)</label>
        <input type="text" data-field="flavors" value="${item.flavors.join(", ")}">
      </div>` : ""}
    </div>
  `;

  row.querySelector('[data-field="price"]').addEventListener("input", (e) => {
    item.price = parseFloat(e.target.value) || 0;
  });
  if (hasGas){
    row.querySelector('[data-field="gasPrice"]').addEventListener("input", (e) => {
      item.gasPrice = parseFloat(e.target.value) || 0;
    });
  }
  row.querySelector('[data-field="available"]').addEventListener("change", (e) => {
    item.available = e.target.checked;
  });
  const imageInput = row.querySelector('[data-field="image"]');
  imageInput.addEventListener("input", (e) => {
    item.image = e.target.value.trim();
    row.querySelector(".admin-item-thumb").src = item.image;
    row.querySelector(".admin-item-thumb").style.visibility = "visible";
  });
  if (hasFlavors){
    row.querySelector('[data-field="flavors"]').addEventListener("input", (e) => {
      item.flavors = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
    });
  }

  return row;
}

// ---------- Exportar data.js atualizado ----------
function exportDataJS(){
  const header = `// ==========================================================================
// DADOS DO CARDÁPIO — Pit Burguer
// ==========================================================================
// Este arquivo é a "fonte da verdade" do cardápio. Pode ser editado à mão
// (com cuidado para manter a formatação) ou através do painel do
// proprietário (admin.html), que gera uma versão nova deste arquivo pra
// você baixar e subir no lugar deste.
//
// Gerado pelo painel do proprietário em ${new Date().toLocaleString("pt-BR")}.
// ==========================================================================
`;

  let out = header + "\n";
  out += `let WHATSAPP_NUMBER = ${JSON.stringify(WHATSAPP_NUMBER)};\n\n`;
  out += `let PAYMENT_METHODS = ${JSON.stringify(PAYMENT_METHODS)};\n\n`;
  out += `const ADDONS = ${JSON.stringify(ADDONS, null, 2)};\n\n`;
  out += `const COMBO_DRINK_OPTIONS = ${JSON.stringify(COMBO_DRINK_OPTIONS, null, 2)};\n\n`;

  out += "const MENU_DATA = {\n";
  const catKeys = Object.keys(MENU_DATA);
  catKeys.forEach((catKey, idx) => {
    const cat = MENU_DATA[catKey];
    out += `  ${catKey}: {\n`;
    out += `    label: ${JSON.stringify(cat.label)},\n`;
    out += `    note: ${JSON.stringify(cat.note)},\n`;
    out += `    icon: ${JSON.stringify(cat.icon)},\n`;
    if (catKey === "adicionais"){
      out += `    items: ADDONS\n`;
    } else {
      const itemsText = JSON.stringify(cat.items, null, 2).split("\n").join("\n    ");
      out += `    items: ${itemsText}\n`;
    }
    out += `  }${idx < catKeys.length - 1 ? "," : ""}\n`;
  });
  out += "};\n";

  const blob = new Blob([out], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("adminLoginBtn").addEventListener("click", checkAdminPassword);
  document.getElementById("adminPasswordInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAdminPassword();
  });
});
