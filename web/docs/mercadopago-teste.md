# Mercado Pago — modo TESTE

Guia rápido para ligar o checkout ao Mercado Pago em modo **sandbox**
(nenhum valor real é cobrado). Nada disto usa a conta real da academia —
usa uma aplicação de teste separada, criada dentro da mesma conta MP.

## 1. Criar a aplicação de teste no dashboard

1. Entra em https://www.mercadopago.com.br/developers/panel/app com a conta
   Mercado Pago da academia (ou cria uma conta se ainda não existir — não
   precisa de CNPJ para o modo teste).
2. **Criar aplicação** → escolhe qualquer nome (ex.: "Beira Mar — Teste") →
   modelo de integração **Pagamentos online** (Checkout Pro + Payments API).
3. Dentro da aplicação criada, no menu lateral **Credenciais de teste**:
   - Copia o **Access Token** de teste (começa por `TEST-...`). É o
     `MP_ACCESS_TOKEN`.
   - Não precisas da Public Key para esta integração (o checkout é todo
     feito no servidor).

## 2. Configurar o webhook (notificações)

Ainda na aplicação, menu **Webhooks** → **Configurar notificações** →
modo **Teste**:

1. **URL do webhook:** `https://<seu-domínio-ou-preview>/api/webhooks/mercadopago`
   - Em desenvolvimento local o Mercado Pago não consegue chamar
     `localhost` diretamente — usa um túnel (ex.: `ngrok http 3000`) e cola
     o URL público do túnel, ou testa via um preview da Vercel.
2. Eventos a marcar: **Pagamentos** (`payment`) — é o único que este
   projeto trata (`app/api/webhooks/mercadopago/route.ts`); outros tipos
   de evento são confirmados com 200 mas ignorados.
3. Depois de guardar, o dashboard mostra a **Chave secreta** dessa
   configuração de webhook — é o `MP_WEBHOOK_SECRET`. É usada para validar
   a assinatura (`x-signature`) de cada notificação recebida; sem ela (ou
   com ela errada) o endpoint responde sempre 401 e ignora o pedido.

## 3. Onde colar as variáveis

**Local (`web/.env.local`, nunca commitado):**
```
PAYMENT_PROVIDER=mercadopago
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxx
MP_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Produção/preview (Vercel):** Project Settings → Environment Variables →
adiciona as mesmas 3 chaves. Podes ligar o modo teste também num preview
(o Access Token de teste funciona em qualquer ambiente — só o dashboard
sabe que é sandbox). Para produção a sério, troca `MP_ACCESS_TOKEN` pelo
Access Token de produção (`APP_USR-...`) só depois de a conta ter CNPJ e
dados bancários validados — nessa altura relê este guia e repete os passos
1-2 na aba "Credenciais de produção" / webhook em modo "Produção".

Sem `MP_ACCESS_TOKEN` definido, o checkout cai automaticamente no fallback
atual ("recebemos seu pedido, a equipe confirma por WhatsApp") — nunca
quebra por falta de configuração.

## 4. Testar

- **Pix:** no checkout, escolhe um plano → Pix → confirma. Em modo teste o
  Mercado Pago devolve sempre um QR code válido, mas ele nunca é
  efetivamente pago por um banco real. Para simular a aprovação, usa o
  [simulador de pagamentos de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)
  ou aprova manualmente o pagamento no painel de teste do Mercado Pago
  (Testes → Pagamentos), que dispara o webhook como aconteceria de verdade.
- **Cartão (Checkout Pro):** escolhe Cartão → confirma → serás
  redirecionado para o `sandbox_init_point` do Mercado Pago. Usa um dos
  [cartões de teste oficiais](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)
  (número, nome `APRO` para aprovar / `OTHE` para recusar, qualquer CVV e
  validade futura).
- **Usuário comprador de teste:** cria um em **Contas de teste** no painel
  do desenvolvedor para simular o lado do comprador com um login MP
  separado (opcional — os cartões de teste já funcionam sem login).
- **Webhook:** depois de aprovar um pagamento de teste, confere os logs do
  servidor (`[webhook mercadopago] payment <id> status=<status>`) — nunca
  contêm dados do pagador, só id + status.

## Referência rápida

| Variável | Onde obter |
|---|---|
| `PAYMENT_PROVIDER` | fixo: `mercadopago` |
| `MP_ACCESS_TOKEN` | Dashboard → aplicação → Credenciais de teste |
| `MP_WEBHOOK_SECRET` | Dashboard → aplicação → Webhooks → Chave secreta |
| `NEXT_PUBLIC_SITE_URL` | opcional — só se o back_urls do Checkout Pro vier com o host errado atrás de um proxy |
