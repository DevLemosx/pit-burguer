// ==========================================================================
// DADOS DO CARDÁPIO — Pit Burguer
// ==========================================================================
// Este arquivo é a "fonte da verdade" do cardápio. Pode ser editado à mão
// (com cuidado para manter a formatação) ou através do painel do
// proprietário (admin.html), que gera uma versão nova deste arquivo pra
// você baixar e subir no lugar deste.
//
// Campos de cada item:
//   id          identificador único (não repita entre itens)
//   name        nome exibido
//   desc        descrição (pode ficar "" vazio)
//   price       preço em número, com ponto decimal
//   image       URL de uma foto do produto, ou "" para usar o ícone padrão
//   available   true = aparece no site / false = fica marcado como indisponível
// ==========================================================================

let WHATSAPP_NUMBER = "5591982386167";

let PAYMENT_METHODS = ["Dinheiro", "Cartão", "Pix"];

// Adicionais: usados tanto como categoria própria (compra avulsa) quanto
// como opções dentro da personalização de Lanches e Combos.
const ADDONS = [
  { id: "ad1", name: "Blend bovino 150g", desc: "Carne extra.", price: 12.00, image: "", available: true },
  { id: "ad2", name: "Molho caseiro", desc: "", price: 4.00, image: "", available: true },
  { id: "ad3", name: "Queijo cheddar", desc: "", price: 5.00, image: "", available: true },
  { id: "ad4", name: "Geleia apimentada de abacaxi", desc: "", price: 4.00, image: "", available: true },
  { id: "ad5", name: "Ovo", desc: "", price: 4.00, image: "", available: true },
  { id: "ad6", name: "Bacon", desc: "", price: 6.00, image: "", available: true },
  { id: "ad7", name: "Macaxeira palha", desc: "", price: 4.00, image: "", available: true },
  { id: "ad8", name: "Calabresa", desc: "", price: 6.00, image: "", available: true },
];

// Opções de bebida inclusa nos combos (sem custo extra).
const COMBO_DRINK_OPTIONS = {
  refrigerante: { name: "Refrigerante Lata", flavors: ["Guaraná Antarctica"] },
  suco: { name: "Suco 300ml", flavors: ["Acerola", "Maracujá"] }
};

const MENU_DATA = {
  lanches: {
    label: "🍔 Lanches",
    note: "Todos os acompanhamentos vão dentro do lanche. Toque em + para escolher adicionais.",
    icon: "🍔",
    items: [
      { id: "l1", name: "X-Pit", desc: "Pão de brioche, blend bovino de 150g e queijo mozzarella.", price: 20.00, image: "", available: true },
      { id: "l2", name: "Pitizinho Burg", desc: "Pão de brioche, blend bovino de 150g, queijo cheddar, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha e salada.", price: 27.00, image: "", available: true },
      { id: "l3", name: "Pig Burg", desc: "Pão de brioche, blend suíno de 150g, queijo cheddar, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha e abacaxi grelhado.", price: 25.00, image: "", available: true },
      { id: "l4", name: "Pollos Burg", desc: "Pão de brioche, blend de frango de 150g, queijo cheddar, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha e abacaxi grelhado.", price: 25.00, image: "", available: true },
      { id: "l5", name: "Bull Burg", desc: "Pão de brioche, blend bovino de 150g, queijo cheddar, bacon, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha e abacaxi grelhado.", price: 31.00, image: "", available: true },
      { id: "l6", name: "Pit Burg", desc: "Pão de brioche, blend bovino de 150g, queijo cheddar, ovo, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha e abacaxi.", price: 29.00, image: "", available: true },
      { id: "l7", name: "Picanha Burg", desc: "Pão de brioche, blend bovino de picanha 150g, queijo cheddar, bacon, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha, abacaxi e geleia de abacaxi apimentada.", price: 37.00, image: "", available: true },
      { id: "l8", name: "Pitbull Burg", desc: "Pão de brioche, 2 blends bovino de 150g, 2 queijo cheddar, 2 bacon, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha, 2 abacaxi grelhado e geleia de abacaxi apimentada.", price: 39.00, image: "", available: true },
      { id: "l9", name: "Pit Love Burg", desc: "Pão de brioche, blend bovino de 150g, queijo cheddar, calabresa, maionese caseira, cebola caramelizada, molho barbecue, macaxeira palha e abacaxi grelhado.", price: 31.00, image: "", available: true },
    ]
  },
  combos: {
    label: "🍟 Combos",
    note: "Lanche + batata + bebida inclusa (refrigerante lata Guaraná ou suco, você escolhe o sabor).",
    icon: "🍟",
    items: [
      { id: "c1", name: "Combo X-Pit", desc: "X-Pit + batata e bebida inclusa.", price: 34.99, image: "", available: true },
      { id: "c2", name: "Combo Pollos Burg", desc: "Pollos Burg + batata e bebida inclusa.", price: 34.99, image: "", available: true },
      { id: "c3", name: "Combo Pig Burg", desc: "Pig Burg + batata e bebida inclusa.", price: 35.99, image: "", available: true },
      { id: "c4", name: "Combo Pitizinho Burg", desc: "Pitizinho Burg + batata e bebida inclusa.", price: 38.99, image: "", available: true },
      { id: "c5", name: "Combo Pit Burg", desc: "Pit Burg + batata e bebida inclusa.", price: 39.99, image: "", available: true },
      { id: "c6", name: "Combo Bull Burg", desc: "Bull Burg + batata e bebida inclusa.", price: 41.99, image: "", available: true },
      { id: "c7", name: "Combo Pit Love Burg", desc: "Pit Love Burg + batata e bebida inclusa.", price: 41.99, image: "", available: true },
      { id: "c8", name: "Combo Picanha Burg", desc: "Picanha Burg + batata e bebida inclusa.", price: 45.99, image: "", available: true },
      { id: "c9", name: "Combo Pitbull Burg", desc: "Pitbull Burg + batata e bebida inclusa.", price: 52.99, image: "", available: true },
    ]
  },
  adicionais: {
    label: "➕ Adicionais",
    note: "Complemente seu lanche, ou peça avulso.",
    icon: "➕",
    items: ADDONS
  },
  caldos: {
    label: "🍲 Caldos",
    note: "",
    icon: "🍲",
    items: [
      { id: "cd1", name: "Caldo de Frango", desc: "Ovo, azeitona, queijo, torrada e limão.", price: 20.00, image: "", available: true },
      { id: "cd2", name: "Caldo de Carne", desc: "Ovo, azeitona, queijo, calabresa, torrada e limão.", price: 20.00, image: "", available: true },
      { id: "cd3", name: "Caldo de Feijão", desc: "Ovo, azeitona, couve, queijo, calabresa, bacon, torrada e limão.", price: 20.00, image: "", available: true },
    ]
  },
  porcoes: {
    label: "🍟 Porções",
    note: "",
    icon: "🍟",
    items: [
      { id: "p1", name: "Batata Simples", desc: "Acompanha catchup.", price: 14.00, image: "", available: true },
      { id: "p2", name: "Batata Turbo", desc: "Acompanha queijo mozzarella, queijo cheddar e bacon.", price: 22.00, image: "", available: true },
    ]
  },
  bebidas: {
    label: "🥤 Bebidas",
    note: "Toque em + para escolher o sabor.",
    icon: "🥤",
    items: [
      { id: "bev_suco", name: "Suco 300ml", desc: "Escolha o sabor.", price: 6.00, image: "", available: true, flavors: ["Acerola", "Maracujá"] },
      { id: "bev_ref_lata", name: "Refrigerante Lata", desc: "Escolha o sabor.", price: 6.00, image: "", available: true, flavors: ["Coca-Cola", "Guaraná Antarctica", "Fanta Laranja", "Sprite"] },
      { id: "bev_ref_1l", name: "Refrigerante 1 Litro", desc: "Escolha o sabor.", price: 11.00, image: "", available: true, flavors: ["Coca-Cola", "Guaraná Antarctica", "Fanta Laranja", "Sprite"] },
      { id: "bev_ref_2l", name: "Refrigerante 2 Litros", desc: "Escolha o sabor.", price: 15.00, image: "", available: true, flavors: ["Coca-Cola", "Guaraná Antarctica", "Fanta Laranja", "Sprite"] },
      { id: "bev_agua", name: "Água", desc: "Com ou sem gás.", price: 3.00, image: "", available: true, gasOption: true, gasPrice: 1.00 },
    ]
  }
};
