# Pit Burguer – Cardápio Digital

Site simples (HTML/CSS/JS puro) com personalização de pedido (adicionais, sabores),
carrinho, checkout com entrega/retirada e forma de pagamento, e painel do
proprietário para editar preço, foto e disponibilidade dos itens.

## Arquivos

- `index.html` — estrutura da página principal (cardápio + carrinho)
- `style.css` — visual do site (cores, fontes, layout)
- `data.js` — **todos os dados do cardápio** (itens, preços, sabores, fotos, WhatsApp, formas de pagamento)
- `script.js` — lógica do cardápio, personalização, carrinho e checkout
- `admin.html` / `admin.js` / `admin.css` — painel do proprietário
- `assets/logo.png` — logo da Pit Burguer

## Como funciona pro cliente

1. Toca em **+** num lanche ou combo → escolhe adicionais (e, no combo, a bebida inclusa) → adiciona ao carrinho.
2. Toca em **+** numa bebida → escolhe o sabor (ou, na água, com/sem gás) → adiciona.
3. Adicionais avulsos, caldos e porções são adicionados direto, sem tela extra.
4. No carrinho, toca em **Continuar** → escolhe entrega (com endereço) ou retirada, e a forma de pagamento (dinheiro pede o troco) → **Enviar pedido no WhatsApp**.
5. Abre o WhatsApp com a mensagem toda pronta: itens, adicionais, sabores, endereço e pagamento.

## Painel do proprietário (admin.html)

Abra `admin.html` no navegador. A senha padrão é:

```
pitburguer2026
```

**Troque essa senha antes de publicar o site.** Ela fica no arquivo `admin.js`, na linha:

```js
const ADMIN_PASSWORD = "pitburguer2026";
```

⚠️ **Importante sobre segurança**: como o site é estático (sem servidor nem banco
de dados), essa senha só afasta curiosos casuais — qualquer pessoa que abrir o
código-fonte da página consegue encontrá-la. Não é proteção de verdade. Não
divulgue o link do `admin.html` publicamente.

No painel dá pra mudar, por item: **preço**, **foto** (cole a URL de uma imagem),
**disponibilidade** (desmarcar tira o item do site) e, nas bebidas, os **sabores**.
Também dá pra mudar o número do WhatsApp e as formas de pagamento aceitas.

### Como as alterações do painel chegam ao site

O site é estático — não existe um banco de dados compartilhado. Então o fluxo é:

1. Edite o que quiser no painel.
2. Clique em **"Baixar data.js atualizado"** — isso baixa um novo arquivo `data.js`.
3. Substitua o arquivo `data.js` da pasta do site por esse novo.
4. Reenvie a pasta pro Netlify (arrastando de novo, ou fazendo push se usar Git).

Só depois desse passo 4 as mudanças aparecem pra quem visita o site. Não é uma
edição "ao vivo" instantânea — é assim porque o site não tem servidor próprio.

## Como editar o cardápio direto no código

Tudo fica no `data.js`. Cada item segue este formato:

```js
{ id: "l1", name: "X-Pit", desc: "Descrição.", price: 20.00, image: "", available: true }
```

- `id` precisa ser único em todo o cardápio.
- `image` pode ficar `""` (usa um ícone no lugar) ou uma URL de foto.
- `available: false` esconde o botão de compra e marca "Indisponível".
- Itens de bebida (exceto água) têm `flavors: [...]` com a lista de sabores.
- A água tem `gasOption: true` e `gasPrice` (quanto soma se escolher "com gás").
- Os adicionais usados dentro de Lanches/Combos são os mesmos da categoria
  `adicionais` (array `ADDONS`, reaproveitado).

## Como trocar o número do WhatsApp ou formas de pagamento

Pelo painel (`admin.html`, seção "Configurações gerais") ou direto no `data.js`:

```js
let WHATSAPP_NUMBER = "5591982386167";
let PAYMENT_METHODS = ["Dinheiro", "Cartão", "Pix"];
```

## Como testar localmente

```bash
python3 -m http.server 8000
```

E acesse `http://localhost:8000`.

## Como publicar (Netlify)

1. Crie uma conta gratuita em [netlify.com](https://netlify.com).
2. Arraste a pasta inteira do projeto para a área de deploy (drag and drop), ou conecte um repositório Git.
3. Pronto — o Netlify dá um link público na hora.

## Próximos passos possíveis

- Fotos reais dos lanches (hoje aparece um ícone no lugar até você adicionar via painel).
- Campo de observações no pedido (ex: "sem cebola").
- Se o volume de pedidos crescer bastante, migrar pra uma solução com banco de
  dados de verdade, pra edições do painel ficarem "ao vivo" sem precisar redeploy.
