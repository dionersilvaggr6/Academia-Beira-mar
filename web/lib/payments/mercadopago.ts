import { randomUUID } from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type {
  CheckoutResult,
  OrderInput,
  PaymentProvider,
} from "@/lib/payments/provider";

/**
 * Provider Mercado Pago — Pix (pagamento direto, QR code) para `metodo:
 * "pix"`; Checkout Pro (preference + redirect) para qualquer outro método
 * (`cartao`, `boleto` — o Checkout Pro trata a escolha real do meio de
 * pagamento na página hospedada do Mercado Pago).
 *
 * `accessToken` vem sempre da env (`MP_ACCESS_TOKEN`, lido só pela factory
 * `getPaymentProvider`) — nunca hardcoded. Em modo TEST o token começa por
 * `TEST-` e a API do Mercado Pago devolve dados de sandbox automaticamente
 * (ex.: `sandbox_init_point`).
 */
export class MercadoPagoProvider implements PaymentProvider {
  readonly name = "mercadopago";
  private readonly config: MercadoPagoConfig;

  constructor(accessToken: string) {
    this.config = new MercadoPagoConfig({ accessToken });
  }

  async createCheckout(order: OrderInput): Promise<CheckoutResult> {
    if (order.metodo === "pix") return createPixPayment(order, this.config);
    return createPreference(order, this.config);
  }
}

/**
 * Cria um pagamento Pix (`POST /v1/payments`) para o valor do plano e
 * devolve os dados do QR code para o checkout renderizar inline (sem
 * redirect).
 *
 * Valor cobrado: `plano.preco` — o número que o `precoLabel` mostra em
 * destaque (ex.: "3× de R$ 125,00" → cobra 125, não 375). Pix é sempre uma
 * cobrança única e instantânea, sem noção de parcelas; `preco` já é o valor
 * do ciclo/cobrança atual (o "×N" descreve a recorrência do plano, não um
 * total a antecipar). Cobrar o total do plano surpreenderia o cliente
 * relativamente ao que o resumo do pedido mostra no ecrã.
 */
export async function createPixPayment(
  order: OrderInput,
  config: MercadoPagoConfig,
): Promise<CheckoutResult> {
  const { firstName, lastName } = splitNome(order.cliente.nome);

  const response = await new Payment(config).create({
    body: {
      transaction_amount: toTransactionAmount(order.plano.preco),
      description: `Academia Beira Mar — ${order.plano.nome}`,
      payment_method_id: "pix",
      external_reference: order.plano.id,
      payer: {
        email: order.cliente.email,
        first_name: firstName,
        last_name: lastName,
      },
    },
    requestOptions: { idempotencyKey: randomUUID() },
  });

  const transactionData = response.point_of_interaction?.transaction_data;
  if (!transactionData?.qr_code_base64 || !transactionData?.qr_code) {
    throw new Error(
      "[mercadopago] resposta da API sem dados de QR code Pix (point_of_interaction.transaction_data ausente ou incompleto)",
    );
  }
  if (response.id === undefined) {
    throw new Error("[mercadopago] resposta da API sem id do pagamento Pix");
  }

  return {
    status: "pix",
    qrCodeBase64: transactionData.qr_code_base64,
    copiaECola: transactionData.qr_code,
    paymentId: String(response.id),
    ticketUrl: transactionData.ticket_url,
    expiresAt: response.date_of_expiration,
  };
}

/**
 * Cria uma preference do Checkout Pro (`POST /checkout/preferences`) e
 * devolve a URL para onde o browser deve navegar. Em modo TEST devolve
 * sempre `sandbox_init_point` (nunca `init_point` de produção) — é o URL
 * que aceita os cartões de teste do Mercado Pago.
 *
 * `unit_price`: mesma regra de `createPixPayment` — `plano.preco`, não
 * `preco × parcelas` (ver comentário acima).
 */
export async function createPreference(
  order: OrderInput,
  config: MercadoPagoConfig,
): Promise<CheckoutResult> {
  const { firstName, lastName } = splitNome(order.cliente.nome);

  const response = await new Preference(config).create({
    body: {
      items: [
        {
          id: order.plano.id,
          title: `Academia Beira Mar — ${order.plano.nome}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: toTransactionAmount(order.plano.preco),
        },
      ],
      payer: { name: firstName, surname: lastName, email: order.cliente.email },
      external_reference: order.plano.id,
      back_urls: {
        success: `${order.origin}/checkout/sucesso`,
        // Pendente não é erro — leva à mesma página de sucesso (que dá uma
        // mensagem neutra de "aguardando confirmação"). Só falha vai para erro.
        pending: `${order.origin}/checkout/sucesso`,
        failure: `${order.origin}/checkout/erro`,
      },
      auto_return: "approved",
    },
    requestOptions: { idempotencyKey: randomUUID() },
  });

  const url = response.sandbox_init_point ?? response.init_point;
  if (!url) {
    throw new Error(
      "[mercadopago] resposta da API sem init_point/sandbox_init_point na preference",
    );
  }

  return { status: "redirect", url };
}

/**
 * Consulta um pagamento pelo id (`GET /v1/payments/:id`). Usado pelo
 * webhook para confirmar o status junto da API — nunca confiamos no corpo
 * da notificação em si (só diz "algo mudou", não o quê); o status real vem
 * sempre desta consulta.
 */
export function getPaymentById(id: string, accessToken: string) {
  const config = new MercadoPagoConfig({ accessToken });
  return new Payment(config).get({ id });
}

/** Arredonda um preço a 2 casas decimais (protege contra imprecisão de float). */
export function toTransactionAmount(preco: number): number {
  return Math.round(preco * 100) / 100;
}

/**
 * Separa um nome completo em primeiro nome + apelido para os campos
 * `first_name`/`last_name` (Pix) e `name`/`surname` (Preference) do
 * Mercado Pago. Regra simples e documentada: primeira palavra = primeiro
 * nome, resto (se houver) = apelido. Nome de uma palavra só não inventa
 * apelido (fica `undefined`).
 */
export function splitNome(nome: string): {
  firstName: string;
  lastName: string | undefined;
} {
  const partes = nome.trim().split(/\s+/);
  const [firstName, ...resto] = partes;
  return {
    firstName: firstName ?? "",
    lastName: resto.length > 0 ? resto.join(" ") : undefined,
  };
}
