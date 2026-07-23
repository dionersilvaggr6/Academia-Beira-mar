import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";

export type WebhookVerification =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Verifica a assinatura de uma notificação de webhook do Mercado Pago
 * (headers `x-signature` + `x-request-id`, e `data.id` da query string).
 *
 * Usa o validador oficial do SDK (`WebhookSignatureValidator`), que
 * implementa exatamente o esquema documentado pelo Mercado Pago: manifest
 * `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`, HMAC-SHA256 com o
 * segredo do webhook, comparação em tempo constante. Preferido a
 * reimplementar a HMAC à mão — é o mesmo algoritmo, mantido pelo próprio
 * Mercado Pago, com tratamento já coberto de casos limite (headers em
 * array, versões de assinatura futuras, etc.).
 *
 * Nunca lança: converte o `InvalidWebhookSignatureError` do SDK num
 * resultado tipado, para a rota decidir o código HTTP sem try/catch.
 */
export function verifyMercadoPagoWebhook(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string | undefined;
}): WebhookVerification {
  const { xSignature, xRequestId, dataId, secret } = params;

  if (!secret) {
    return { valid: false, reason: "MP_WEBHOOK_SECRET não configurado" };
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret,
    });
    return { valid: true };
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      return { valid: false, reason: err.reason };
    }
    return { valid: false, reason: "erro inesperado ao validar assinatura" };
  }
}
