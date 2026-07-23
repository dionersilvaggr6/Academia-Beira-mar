import { MercadoPagoProvider } from "@/lib/payments/mercadopago";
import type { Plano } from "@/lib/plans.schema";

/**
 * Formas de pagamento aceites no checkout. Fonte única — o schema de
 * validação (`lib/checkout.schema.ts`) deriva o enum a partir desta lista.
 */
export const METODOS_PAGAMENTO = ["pix", "cartao", "boleto"] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

export type OrderInput = {
  plano: Plano;
  metodo: MetodoPagamento;
  cliente: { nome: string; email: string; telefone: string };
  /**
   * Origin absoluta (protocolo+host) do pedido atual — necessária para
   * montar `back_urls` de providers redirect-based (ex.: Checkout Pro do
   * Mercado Pago). Calculada uma única vez em `iniciarPagamento` via
   * `resolveOrigin`, para os providers nunca chamarem `next/headers`
   * diretamente (mantém-nos puros e testáveis sem mocks do Next.js).
   */
  origin: string;
};

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | {
      status: "pix";
      qrCodeBase64: string;
      copiaECola: string;
      paymentId: string;
      ticketUrl?: string;
      expiresAt?: string;
    }
  | { status: "pending"; info: string }
  | { status: "unavailable" };

/**
 * Contrato que qualquer gateway de pagamento (Mercado Pago, Stripe, etc.)
 * tem de implementar para plugar no checkout. `createCheckout` nunca deve
 * lançar por dados inválidos — a validação acontece antes, em
 * `app/actions/checkout.ts` (Zod) — só por falha de comunicação com o
 * gateway, e mesmo assim o chamador tem de tratar isso (o pedido já foi
 * registado como lead antes deste passo correr).
 */
export interface PaymentProvider {
  readonly name: string;
  createCheckout(order: OrderInput): Promise<CheckoutResult>;
}

/**
 * Nenhum gateway está configurado ainda (a academia ainda não tem conta —
 * precisa do CNPJ primeiro). Devolve sempre "unavailable" para o checkout
 * cair no fluxo de lead: o pedido fica registado e a equipa confirma o
 * pagamento manualmente. Nunca inventa/aceita credenciais.
 */
export class NotConfiguredProvider implements PaymentProvider {
  readonly name = "not-configured";

  async createCheckout(_order: OrderInput): Promise<CheckoutResult> {
    return { status: "unavailable" };
  }
}

/**
 * Escolhe o provider a partir da env `PAYMENT_PROVIDER`.
 *
 * `mercadopago` liga o `MercadoPagoProvider` (modo TEST — ver
 * `docs/mercadopago-teste.md`), mas só se `MP_ACCESS_TOKEN` estiver
 * definido; sem o token, cai sempre para `NotConfiguredProvider` — nunca
 * lança, nunca inventa/aceita credenciais. Qualquer outro valor (ou a env
 * por definir) também cai no `NotConfiguredProvider`.
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER;
  switch (provider) {
    case "mercadopago": {
      const accessToken = process.env.MP_ACCESS_TOKEN;
      if (!accessToken) return new NotConfiguredProvider();
      return new MercadoPagoProvider(accessToken);
    }
    default:
      return new NotConfiguredProvider();
  }
}
