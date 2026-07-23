import { type NextRequest, NextResponse } from "next/server";
import { getPaymentById } from "@/lib/payments/mercadopago";
import { verifyMercadoPagoWebhook } from "@/lib/payments/mercadopago-webhook";

/**
 * Recebe notificações de webhook do Mercado Pago (eventos `payment`).
 *
 * SEGURANÇA: a assinatura (`x-signature` + `x-request-id`, contra o
 * `data.id` da query string) é sempre verificada primeiro — um pedido sem
 * assinatura válida é sempre rejeitado (401) e nunca processado. Depois de
 * validado, o status do pagamento vem sempre de uma consulta à API do
 * Mercado Pago (`getPaymentById`), nunca do corpo da notificação em si —
 * o corpo só avisa "algo mudou", não é prova do que mudou.
 *
 * Devolve 200 rapidamente para qualquer notificação validamente assinada
 * mas não tratada (tópicos que não `payment`, ou falha ao consultar a
 * API), para o Mercado Pago parar de reenviar — só a assinatura inválida
 * gera 401.
 */
export async function POST(request: NextRequest) {
  const dataId = request.nextUrl.searchParams.get("data.id");
  const type = request.nextUrl.searchParams.get("type");

  const verification = verifyMercadoPagoWebhook({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
    secret: process.env.MP_WEBHOOK_SECRET,
  });

  if (!verification.valid) {
    console.error(
      "[webhook mercadopago] assinatura rejeitada:",
      verification.reason,
    );
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error(
      "[webhook mercadopago] MP_ACCESS_TOKEN não configurado — não é possível confirmar o pagamento",
    );
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const payment = await getPaymentById(dataId, accessToken);
    // Log seguro: só id + status — nunca payer/cartão/valores associados a PII.
    console.log(
      `[webhook mercadopago] payment ${payment.id ?? dataId} status=${payment.status ?? "desconhecido"}`,
    );

    // TODO: persistir pedido pago — ainda não existe tabela `orders`
    // (web/db/schema.ts só tem leads/profiles/treinos/exercicios). Forma
    // prevista quando existir:
    //   await getDb().insert(orders).values({
    //     paymentId: String(payment.id),
    //     status: payment.status ?? "unknown",
    //     externalReference: payment.external_reference, // = plano.id
    //     transactionAmount: payment.transaction_amount,
    //     createdAt: new Date(),
    //   });
  } catch (err) {
    console.error(
      "[webhook mercadopago] falha ao consultar o pagamento na API:",
      err instanceof Error ? err.message : "erro desconhecido",
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
