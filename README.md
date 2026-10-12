# Pit Burguer – Cardápio Digital

Cardápio digital mobile-first da Pit Burguer, com personalização de lanches e
combos, carrinho, checkout de entrega ou retirada e finalização pelo WhatsApp.
O painel permite atualizar preços, fotos e disponibilidade.

Leia [CONCEITO.md](CONCEITO.md) para a proposta refinada e a direção de produto/visual.

## Arquivos

- `index.html` — estrutura da página principal (cardápio + carrinho)
- `style.css` — visual do site (cores, fontes, layout)
- `data.js` — cópia local inicial do cardápio e fallback para abrir a loja sem conexão
- `script.js` — lógica do cardápio, personalização, carrinho e checkout
- `admin.html` / `admin.js` / `admin.css` — painel do proprietário
- `appwrite-config.js` / `appwrite-client.js` — conexão do navegador com o Appwrite
- `assets/logo.png` — logo da Pit Burguer

## Como funciona pro cliente

1. Toca em **+** num lanche ou combo → escolhe adicionais (e, no combo, a bebida inclusa) → adiciona ao carrinho.
2. Toca em **+** numa bebida → escolhe o sabor (ou, na água, com/sem gás) → adiciona.
3. Caldos e porções são adicionados direto, sem tela extra. Adicionais ficam na
   personalização de lanches e combos, sem uma categoria separada.
4. No carrinho, toca em **Continuar** → pode informar o nome, escolhe entrega
   (com endereço) ou retirada, e a forma de pagamento (dinheiro pede troco;
   cartão pede crédito ou débito) →
   **Enviar pedido no WhatsApp**.
5. Abre o WhatsApp com a mensagem pronta: itens, adicionais, observações, sabores,
   endereço e pagamento.

## Configurar o Appwrite

O painel usa Appwrite Auth para o login, TablesDB para o cardápio e Storage
para as fotos. A loja pode ler o cardápio publicamente; só o usuário proprietário
deve conseguir alterar a configuração e enviar imagens.

O projeto Appwrite `Pit Burguer` já foi criado no plano gratuito, na região Toronto (`tor`). O banco `pit_burguer`, a tabela `site_config`, o bucket `product_images`, a linha inicial `main` e a plataforma Web `localhost` também já estão configurados. O endpoint e o Project ID já foram preenchidos em `appwrite-config.js`.

1. No Appwrite Console, em **Auth → Users**, crie o usuário do proprietário e copie o ID. O site não oferece cadastro para clientes; novas contas ainda não recebem permissão para editar o cardápio.
2. Nas permissões da tabela `site_config`, mantenha **Read** para `Any` e permita **Create** somente ao usuário proprietário. A linha `main` já permite leitura pública; conceda nela **Update** e **Delete** somente ao usuário proprietário.
3. Nas permissões do bucket `product_images`, mantenha **Read** para `Any` e conceda **Create**, **Update** e **Delete** somente ao proprietário.
4. Preencha o ID do usuário em `adminUserId` no `appwrite-config.js`. Os demais identificadores já estão definidos.
5. Abra o site por um servidor HTTP local (veja abaixo), entre em `admin.html` e atualize o cardápio. As alterações serão salvas no Appwrite.

O Appwrite Web SDK usa o endpoint público e o Project ID no navegador; não coloque uma API key nesse projeto. As permissões do Appwrite protegem a tabela e o bucket. O ID do administrador permanece vazio em `appwrite-config.js` até o proprietário ser criado. Enquanto isso, o cardápio continua usando os dados locais de `data.js` e o login do painel permanece desativado. O acesso via `file://` pode bloquear chamadas externas; use `http://localhost:8000`.

O painel altera preços, fotos (por URL ou envio de arquivo), disponibilidade,
sabores, WhatsApp e pagamentos. Depois do primeiro carregamento, novas visitas
recebem essas mudanças sem trocar `data.js` nem publicar de novo. Quem já estiver
com a página aberta precisa recarregá-la. Os pedidos continuam indo para o
WhatsApp; eles não são salvos no banco.

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
- Lanches e combos aceitam uma observação opcional por unidade (ex.: retirar um ingrediente).
- Os adicionais são definidos no array `ADDONS` e usados dentro de Lanches e Combos.

## Como trocar o número do WhatsApp ou formas de pagamento

Depois da configuração, use a seção **Configurações gerais** do painel e clique
em **Salvar alterações**. O arquivo `data.js` continua servindo como cópia inicial
e fallback local.

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
- Confirmar horário de atendimento, taxa e bairros de entrega e prazo estimado.
- Salvar e acompanhar pedidos no painel, se quiser receber e organizar pedidos
  sem depender somente do histórico do WhatsApp.
