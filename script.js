// ==========================================================================
// Pit Burguer — lógica do cardápio, personalização, carrinho e checkout
// Depende de data.js já carregado (MENU_DATA, ADDONS, COMBO_DRINK_OPTIONS,
// WHATSAPP_NUMBER, PAYMENT_METHODS).
// ==========================================================================

let cart = [];          // array de "linhas" de pedido
let lineCounter = 0;

function nextLineId(){ return "line_" + (++lineCounter); }
function formatBRL(v){ return "R$ " + v.toFixed(2).replace(".", ","); }

function findItem(id){
  for (const cat of Object.values(MENU_DATA)){
    const found = cat.items.find(i => i.id === id);
    if (found) return found;
  }
  return null;
}
function findItemCategory(id){
  for (const [key, cat] of Object.entries(MENU_DATA)){
    if (cat.items.some(i => i.id === id)) return key;
  }
  return null;
}

// Categorias cujos itens abrem o modal de personalização.
function itemNeedsModal(categoryKey){
  return categoryKey === "lanches" || categoryKey === "combos" || categoryKey === "bebidas";
}

// ---------- Renderização do cardápio ----------
function renderCatNav(){
  const nav = document.getElementById("catNav");
  nav.innerHTML = "";
  Object.entries(MENU_DATA).forEach(([key, cat], idx) => {
    const btn = document.createElement("button");
    btn.className = "cat-pill" + (idx === 0 ? " active" : "");
    btn.dataset.cat = key;
    btn.textContent = `${cat.icon} ${cat.label.replace(/^\S+\s/, "")}`;
    nav.appendChild(btn);
  });
}

function renderImageBlock(item, icon){
  if (item.image){
    return `<div class="item-img-wrap"><img class="item-img" src="${item.image}" alt="${item.name}" loading="lazy"></div>`;
  }
  return `<div class="item-img-wrap"><div class="item-img placeholder" aria-hidden="true">${icon}</div></div>`;
}

function renderMenu(){
  const main = document.getElementById("menu");
  main.innerHTML = "";
  Object.entries(MENU_DATA).forEach(([catKey, cat]) => {
    const section = document.createElement("section");
    section.className = "category-section";
    section.id = "cat-" + catKey;

    section.innerHTML = `
      <div class="category-head"><h2>${cat.label}</h2></div>
      ${cat.note ? `<p class="category-note">${cat.note}</p>` : ""}
      <div class="grill-divider"></div>
    `;

    cat.items.forEach(item => {
      section.appendChild(renderItemCard(item, catKey, cat.icon));
    });

    main.appendChild(section);
  });
}

function renderItemCard(item, catKey, icon){
  const card = document.createElement("div");
  card.className = "item-card" + (item.available ? "" : " unavailable");
  card.id = "item-" + item.id;

  const priceLabel = item.flavors || item.id === "bev_agua"
    ? `a partir de ${formatBRL(item.price)}`
    : formatBRL(item.price);

  let sideHTML;
  if (!item.available){
    sideHTML = `<div class="item-side"><span class="unavailable-badge">Indisponível</span></div>`;
  } else if (itemNeedsModal(catKey)){
    sideHTML = `
      <div class="item-side">
        <button class="add-btn" data-modal-id="${item.id}" data-cat="${catKey}" aria-label="Adicionar ${item.name}">+</button>
        <span class="in-cart-badge" data-badge-for="${item.id}"></span>
      </div>`;
  } else {
    sideHTML = `
      <div class="item-side">
        <button class="add-btn" data-simple-id="${item.id}" data-cat="${catKey}" aria-label="Adicionar ${item.name}">+</button>
        <div class="qty-stepper" data-simple-id="${item.id}">
          <button class="qty-minus" data-simple-id="${item.id}" aria-label="Diminuir">−</button>
          <span class="qty-value">0</span>
          <button class="qty-plus" data-simple-id="${item.id}" aria-label="Aumentar">+</button>
        </div>
      </div>`;
  }

  card.innerHTML = `
    ${renderImageBlock(item, icon)}
    <div class="item-info">
      <h3>${item.name}</h3>
      ${item.desc ? `<p>${item.desc}</p>` : ""}
      <span class="item-price">${priceLabel}</span>
    </div>
    ${sideHTML}
  `;
  return card;
}

// ---------- Modal de personalização ----------
let modalState = null;

function openItemModal(itemId, catKey){
  const item = findItem(itemId);
  if (!item || !item.available) return;

  modalState = {
    item, catKey, qty: 1,
    addonIds: new Set(),
    comboDrinkType: null,
    comboDrinkFlavor: null,
    flavor: null,
    gas: false
  };

  document.getElementById("modalItemName").textContent = item.name;
  document.getElementById("modalBody").innerHTML = buildModalBodyHTML(item, catKey);
  document.getElementById("modalQtyValue").textContent = "1";

  wireModalBodyEvents();
  updateModalFoot();

  document.getElementById("itemModalOverlay").classList.add("show");
  document.getElementById("itemModal").classList.add("show");
}

function closeItemModal(){
  document.getElementById("itemModalOverlay").classList.remove("show");
  document.getElementById("itemModal").classList.remove("show");
  modalState = null;
}

function buildModalBodyHTML(item, catKey){
  let html = "";

  if (catKey === "lanches" || catKey === "combos"){
    const available = ADDONS.filter(a => a.available);
    if (available.length){
      html += `<h3>Adicionais <span class="muted">(opcional)</span></h3><div class="addon-list">`;
      available.forEach(a => {
        html += `
          <label class="addon-row">
            <span class="addon-check"><input type="checkbox" data-addon-id="${a.id}"></span>
            <span class="addon-name">${a.name}</span>
            <span class="addon-price">+ ${formatBRL(a.price)}</span>
          </label>`;
      });
      html += `</div>`;
    }
  }

  if (catKey === "combos"){
    const opts = COMBO_DRINK_OPTIONS;
    html += `<h3>Bebida inclusa <span class="muted">(escolha uma)</span></h3><div class="radio-group vertical" id="comboDrinkTypeGroup">`;
    html += `
      <label class="radio-pill"><input type="radio" name="comboDrinkType" value="refrigerante"><span>🥤 ${opts.refrigerante.name} (${opts.refrigerante.flavors[0]})</span></label>
      <label class="radio-pill"><input type="radio" name="comboDrinkType" value="suco"><span>🧃 ${opts.suco.name}</span></label>
    `;
    html += `</div>`;
    html += `<div class="field-group" id="comboSucoFlavorField" style="display:none;">
      <label>Sabor do suco</label>
      <div class="radio-group vertical" id="comboSucoFlavorGroup">
        ${opts.suco.flavors.map(f => `<label class="radio-pill"><input type="radio" name="comboSucoFlavor" value="${f}"><span>${f}</span></label>`).join("")}
      </div>
    </div>`;
  }

  if (catKey === "bebidas"){
    if (item.flavors){
      html += `<h3>Escolha o sabor</h3><div class="radio-group vertical" id="bevFlavorGroup">`;
      html += item.flavors.map(f => `<label class="radio-pill"><input type="radio" name="bevFlavor" value="${f}"><span>${f}</span></label>`).join("");
      html += `</div>`;
    }
    if (item.gasOption){
      html += `<h3>Tipo</h3><div class="radio-group vertical" id="bevGasGroup">
        <label class="radio-pill"><input type="radio" name="bevGas" value="sem" checked><span>Sem gás</span></label>
        <label class="radio-pill"><input type="radio" name="bevGas" value="com"><span>Com gás (+ ${formatBRL(item.gasPrice)})</span></label>
      </div>`;
    }
  }

  if (!html){
    html = `<p class="muted">Sem opções adicionais para este item.</p>`;
  }

  return html;
}

function wireModalBodyEvents(){
  const body = document.getElementById("modalBody");

  body.querySelectorAll("[data-addon-id]").forEach(cb => {
    cb.addEventListener("change", () => {
      if (cb.checked) modalState.addonIds.add(cb.dataset.addonId);
      else modalState.addonIds.delete(cb.dataset.addonId);
      updateModalFoot();
    });
  });

  const comboDrinkGroup = body.querySelector("#comboDrinkTypeGroup");
  if (comboDrinkGroup){
    comboDrinkGroup.querySelectorAll('input[name="comboDrinkType"]').forEach(radio => {
      radio.addEventListener("change", () => {
        modalState.comboDrinkType = radio.value;
        const sucoField = document.getElementById("comboSucoFlavorField");
        if (radio.value === "suco"){
          sucoField.style.display = "";
          modalState.comboDrinkFlavor = null;
        } else {
          sucoField.style.display = "none";
          modalState.comboDrinkFlavor = COMBO_DRINK_OPTIONS.refrigerante.flavors[0];
        }
        updateModalFoot();
      });
    });
  }
  const sucoFlavorGroup = body.querySelector("#comboSucoFlavorGroup");
  if (sucoFlavorGroup){
    sucoFlavorGroup.querySelectorAll('input[name="comboSucoFlavor"]').forEach(radio => {
      radio.addEventListener("change", () => {
        modalState.comboDrinkFlavor = radio.value;
        updateModalFoot();
      });
    });
  }

  const bevFlavorGroup = body.querySelector("#bevFlavorGroup");
  if (bevFlavorGroup){
    bevFlavorGroup.querySelectorAll('input[name="bevFlavor"]').forEach(radio => {
      radio.addEventListener("change", () => {
        modalState.flavor = radio.value;
        updateModalFoot();
      });
    });
  }
  const bevGasGroup = body.querySelector("#bevGasGroup");
  if (bevGasGroup){
    bevGasGroup.querySelectorAll('input[name="bevGas"]').forEach(radio => {
      radio.addEventListener("change", () => {
        modalState.gas = radio.value === "com";
        updateModalFoot();
      });
    });
  }

  document.getElementById("modalQtyMinus").onclick = () => {
    modalState.qty = Math.max(1, modalState.qty - 1);
    document.getElementById("modalQtyValue").textContent = modalState.qty;
    updateModalFoot();
  };
  document.getElementById("modalQtyPlus").onclick = () => {
    modalState.qty += 1;
    document.getElementById("modalQtyValue").textContent = modalState.qty;
    updateModalFoot();
  };
}

function computeModalUnitPrice(){
  const { item, catKey, addonIds, gas } = modalState;
  let price = item.price;
  if (catKey === "lanches" || catKey === "combos"){
    addonIds.forEach(id => {
      const a = ADDONS.find(x => x.id === id);
      if (a) price += a.price;
    });
  }
  if (catKey === "bebidas" && item.gasOption && gas){
    price += item.gasPrice;
  }
  return price;
}

function isModalValid(){
  const { item, catKey, comboDrinkType, comboDrinkFlavor, flavor } = modalState;
  if (catKey === "combos"){
    if (!comboDrinkType) return false;
    if (comboDrinkType === "suco" && !comboDrinkFlavor) return false;
  }
  if (catKey === "bebidas" && item.flavors && !flavor) return false;
  return true;
}

function updateModalFoot(){
  const btn = document.getElementById("modalAddBtn");
  const valid = isModalValid();
  btn.disabled = !valid;
  btn.textContent = valid
    ? `Adicionar — ${formatBRL(computeModalUnitPrice() * modalState.qty)}`
    : "Escolha as opções acima";
}

function confirmModalAdd(){
  if (!modalState || !isModalValid()) return;
  const { item, catKey, qty, addonIds, comboDrinkType, comboDrinkFlavor, flavor, gas } = modalState;

  const addons = Array.from(addonIds).map(id => ADDONS.find(a => a.id === id)).filter(Boolean)
    .map(a => ({ id: a.id, name: a.name, price: a.price }));

  let comboDrink = null;
  if (catKey === "combos"){
    const optName = COMBO_DRINK_OPTIONS[comboDrinkType].name;
    comboDrink = { type: comboDrinkType, name: optName, flavor: comboDrinkFlavor };
  }

  const configKey = JSON.stringify({
    id: item.id,
    addons: addons.map(a => a.id).sort(),
    flavor: flavor || null,
    gas: !!gas,
    comboDrink: comboDrink ? comboDrink.type + ":" + comboDrink.flavor : null
  });

  const unitPrice = computeModalUnitPrice();
  const existing = cart.find(l => l.configKey === configKey);
  if (existing){
    existing.qty += qty;
  } else {
    cart.push({
      lineId: nextLineId(),
      itemId: item.id,
      catKey,
      name: item.name,
      qty,
      addons,
      flavor: flavor || null,
      gas: !!gas,
      comboDrink,
      unitPrice,
      configKey
    });
  }

  closeItemModal();
  pulseCartBar();
  updateAll();
}

// ---------- Itens simples (sem modal): adicionais avulsos, caldos, porções ----------
function simpleLineId(itemId){ return "simple_" + itemId; }

function addSimpleItem(itemId, catKey){
  const item = findItem(itemId);
  if (!item || !item.available) return;
  const lineId = simpleLineId(itemId);
  let line = cart.find(l => l.lineId === lineId);
  if (line){
    line.qty += 1;
  } else {
    cart.push({
      lineId, itemId, catKey, name: item.name, qty: 1,
      addons: [], flavor: null, gas: false, comboDrink: null,
      unitPrice: item.price, configKey: lineId
    });
  }
  pulseCartBar();
  updateAll();
}
function removeOneSimpleItem(itemId){
  const lineId = simpleLineId(itemId);
  const line = cart.find(l => l.lineId === lineId);
  if (!line) return;
  line.qty -= 1;
  if (line.qty <= 0) cart = cart.filter(l => l.lineId !== lineId);
  updateAll();
}

// ---------- Carrinho: totais ----------
function cartTotal(){
  return cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
}
function cartCount(){
  return cart.reduce((sum, l) => sum + l.qty, 0);
}
function itemTotalQtyInCart(itemId){
  return cart.filter(l => l.itemId === itemId).reduce((s, l) => s + l.qty, 0);
}

function changeLineQty(lineId, delta){
  const line = cart.find(l => l.lineId === lineId);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(l => l.lineId !== lineId);
  updateAll();
}

// ---------- Atualização de UI ----------
function updateAll(){
  updateSimpleItemCardsUI();
  updateModalTriggerBadges();
  updateCartBar();
  renderCartDrawer();
}

function updateSimpleItemCardsUI(){
  document.querySelectorAll(".qty-stepper[data-simple-id]").forEach(stepper => {
    const id = stepper.dataset.simpleId;
    const line = cart.find(l => l.lineId === simpleLineId(id));
    const qty = line ? line.qty : 0;
    const addBtn = document.querySelector(`.add-btn[data-simple-id="${id}"]`);
    if (qty > 0){
      addBtn.classList.add("hide");
      stepper.classList.add("show");
      stepper.querySelector(".qty-value").textContent = qty;
    } else {
      addBtn.classList.remove("hide");
      stepper.classList.remove("show");
    }
  });
}

function updateModalTriggerBadges(){
  document.querySelectorAll(".in-cart-badge").forEach(badge => {
    const id = badge.dataset.badgeFor;
    const qty = itemTotalQtyInCart(id);
    badge.textContent = qty > 0 ? `${qty} no carrinho` : "";
  });
}

function pulseCartBar(){
  const bar = document.getElementById("cartBar");
  bar.classList.remove("pulse");
  void bar.offsetWidth;
  bar.classList.add("pulse");
}

function updateCartBar(){
  const bar = document.getElementById("cartBar");
  const count = cartCount();
  document.getElementById("cartCount").textContent = count === 1 ? "1 item" : `${count} itens`;
  document.getElementById("cartTotal").textContent = formatBRL(cartTotal());
  bar.classList.toggle("show", count > 0);
}

function lineDetailLines(line){
  const details = [];
  line.addons.forEach(a => details.push(`+ ${a.name}`));
  if (line.comboDrink) details.push(`Bebida: ${line.comboDrink.name} (${line.comboDrink.flavor})`);
  if (line.flavor) details.push(`Sabor: ${line.flavor}`);
  if (line.gas) details.push(`Com gás`);
  return details;
}

function renderCartDrawer(){
  const itemsWrap = document.getElementById("cartItems");
  const emptyWrap = document.getElementById("cartEmpty");
  const goCheckoutBtn = document.getElementById("goCheckoutBtn");

  itemsWrap.innerHTML = "";
  if (cart.length === 0){
    emptyWrap.classList.add("show");
    goCheckoutBtn.disabled = true;
  } else {
    emptyWrap.classList.remove("show");
    goCheckoutBtn.disabled = false;
    cart.forEach(line => {
      const details = lineDetailLines(line);
      const div = document.createElement("div");
      div.className = "cart-line";
      div.innerHTML = `
        <div class="cart-line-info">
          <h4>${line.name}</h4>
          ${details.length ? `<span class="cart-line-details">${details.join(" · ")}</span>` : ""}
          <span class="cart-line-unit">${formatBRL(line.unitPrice)} cada</span>
        </div>
        <div class="cart-line-controls">
          <button class="line-minus" data-line-id="${line.lineId}" aria-label="Diminuir">−</button>
          <span>${line.qty}</span>
          <button class="line-plus" data-line-id="${line.lineId}" aria-label="Aumentar">+</button>
        </div>
        <div class="cart-line-price">${formatBRL(line.unitPrice * line.qty)}</div>
      `;
      itemsWrap.appendChild(div);
    });
  }
  document.getElementById("drawerTotal").textContent = formatBRL(cartTotal());
  document.getElementById("checkoutTotal").textContent = formatBRL(cartTotal());
}

// ---------- Checkout: entrega, pagamento, mensagem final ----------
function renderPaymentOptions(){
  const group = document.getElementById("paymentGroup");
  group.innerHTML = PAYMENT_METHODS.map((m, i) => `
    <label class="radio-pill"><input type="radio" name="payment" value="${m}" ${i === 0 ? "checked" : ""}><span>${m}</span></label>
  `).join("");
  group.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener("change", () => {
      document.getElementById("changeField").style.display = radio.value === "Dinheiro" ? "" : "none";
    });
  });
}

function setupDeliveryToggle(){
  document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
    radio.addEventListener("change", () => {
      const isEntrega = radio.value === "entrega";
      document.getElementById("addressField").style.display = isEntrega ? "" : "none";
      document.getElementById("addressError").classList.remove("show");
    });
  });
}

function buildOrderMessage(){
  const lines = ["Olá! Gostaria de fazer o seguinte pedido:", ""];
  cart.forEach(line => {
    lines.push(`• ${line.qty}x ${line.name}`);
    lineDetailLines(line).forEach(d => lines.push(`   ${d}`));
    lines.push(`   Subtotal: ${formatBRL(line.unitPrice * line.qty)}`);
    lines.push("");
  });
  lines.push(`Total: ${formatBRL(cartTotal())}`);
  lines.push("");

  const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
  if (deliveryType === "entrega"){
    lines.push("Entrega: Sim");
    lines.push(`Endereço: ${document.getElementById("addressInput").value.trim()}`);
  } else {
    lines.push("Entrega: Retirada no local");
  }
  lines.push("");

  const payment = document.querySelector('input[name="payment"]:checked').value;
  lines.push(`Pagamento: ${payment}`);
  if (payment === "Dinheiro"){
    const change = document.getElementById("changeInput").value.trim();
    lines.push(change ? `Troco para: ${change}` : "Troco: não precisa");
  }

  return lines.join("\n");
}

function trySendWhatsApp(){
  const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
  if (deliveryType === "entrega" && !document.getElementById("addressInput").value.trim()){
    document.getElementById("addressError").classList.add("show");
    document.getElementById("addressInput").focus();
    return;
  }
  const message = encodeURIComponent(buildOrderMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");

  cart = [];
  updateAll();
  closeCartDrawer();
  document.getElementById("addressInput").value = "";
  document.getElementById("changeInput").value = "";
  showCartView();
}

// ---------- Navegação por categoria ----------
function setupCatNav(){
  const pills = document.querySelectorAll(".cat-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      document.getElementById("cat-" + pill.dataset.cat).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  const sections = document.querySelectorAll(".category-section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const cat = entry.target.id.replace("cat-", "");
        pills.forEach(p => p.classList.toggle("active", p.dataset.cat === cat));
      }
    });
  }, { rootMargin: "-160px 0px -70% 0px", threshold: 0 });
  sections.forEach(s => observer.observe(s));
}

// ---------- Drawer: abrir/fechar/trocar view ----------
function openCartDrawer(){
  document.getElementById("cartDrawer").classList.add("show");
  document.getElementById("cartOverlay").classList.add("show");
}
function closeCartDrawer(){
  document.getElementById("cartDrawer").classList.remove("show");
  document.getElementById("cartOverlay").classList.remove("show");
}
function showCheckoutView(){
  if (cart.length === 0) return;
  document.getElementById("cartMainView").classList.remove("show");
  document.getElementById("checkoutView").classList.add("show");
}
function showCartView(){
  document.getElementById("checkoutView").classList.remove("show");
  document.getElementById("cartMainView").classList.add("show");
}

function setupCartDrawer(){
  document.getElementById("cartBar").addEventListener("click", openCartDrawer);
  document.getElementById("cartClose").addEventListener("click", closeCartDrawer);
  document.getElementById("checkoutClose").addEventListener("click", closeCartDrawer);
  document.getElementById("cartOverlay").addEventListener("click", closeCartDrawer);
  document.getElementById("goCheckoutBtn").addEventListener("click", showCheckoutView);
  document.getElementById("checkoutBack").addEventListener("click", showCartView);
  document.getElementById("sendWhatsAppBtn").addEventListener("click", trySendWhatsApp);

  document.getElementById("cartItems").addEventListener("click", (e) => {
    const minus = e.target.closest(".line-minus");
    const plus = e.target.closest(".line-plus");
    if (minus) changeLineQty(minus.dataset.lineId, -1);
    if (plus) changeLineQty(plus.dataset.lineId, 1);
  });
}

// ---------- Eventos de clique no cardápio ----------
function setupItemEvents(){
  document.getElementById("menu").addEventListener("click", (e) => {
    const modalTrigger = e.target.closest("[data-modal-id]");
    if (modalTrigger){
      openItemModal(modalTrigger.dataset.modalId, modalTrigger.dataset.cat);
      return;
    }
    const simpleAdd = e.target.closest(".add-btn[data-simple-id]");
    if (simpleAdd){ addSimpleItem(simpleAdd.dataset.simpleId, simpleAdd.dataset.cat); return; }
    const simplePlus = e.target.closest(".qty-plus[data-simple-id]");
    if (simplePlus){ addSimpleItem(simplePlus.dataset.simpleId); return; }
    const simpleMinus = e.target.closest(".qty-minus[data-simple-id]");
    if (simpleMinus){ removeOneSimpleItem(simpleMinus.dataset.simpleId); return; }
  });

  document.getElementById("modalClose").addEventListener("click", closeItemModal);
  document.getElementById("itemModalOverlay").addEventListener("click", closeItemModal);
  document.getElementById("modalAddBtn").addEventListener("click", confirmModalAdd);
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderCatNav();
  renderMenu();
  renderPaymentOptions();
  setupDeliveryToggle();
  setupCatNav();
  setupCartDrawer();
  setupItemEvents();
  updateAll();
});
