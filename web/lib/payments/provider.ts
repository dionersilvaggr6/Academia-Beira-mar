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
};

export type CheckoutResult =
  | { status: "redirect"; url: string }
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
 * Escolhe o provider a partir da env `PAYMENT_PROVIDER`. Hoje só existe o
 * `NotConfiguredProvider` (sem gateway ligado).
 *
 * Para ligar o Mercado Pago (Pix — o gateway por defeito para o Brasil)
 * quando a academia tiver a conta pronta:
 *   1. Implementar uma `MercadoPagoProvider` aqui (chamando a API deles com
 *      `MERCADOPAGO_ACCESS_TOKEN`, nunca hardcoded — só via env).
 *   2. Adicionar `case "mercadopago": return new MercadoPagoProvider();`
 *      abaixo.
 *   3. Definir `PAYMENT_PROVIDER=mercadopago` no `.env` de produção.
 * Nenhum outro ficheiro precisa de mudar — `app/actions/checkout.ts` já
 * chama `getPaymentProvider()` de forma agnóstica ao gateway.
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER;
  switch (provider) {
    default:
      return new NotConfiguredProvider();
  }
}
