"use server";

import { getDb } from "@/db/client";
import { leads } from "@/db/schema";
import { checkoutSchema } from "@/lib/checkout.schema";
import {
  getPaymentProvider,
  type MetodoPagamento,
} from "@/lib/payments/provider";
import { findPlano } from "@/lib/plans";
import { waLink } from "@/lib/whatsapp";

export type CheckoutActionResult =
  | { ok: true; kind: "redirect"; url: string }
  | { ok: true; kind: "pendente"; mensagem: string; whatsapp: string }
  | { ok: false; error: string };

const METODO_LABEL: Record<MetodoPagamento, string> = {
  pix: "Pix",
  cartao: "Cartão",
  boleto: "Boleto",
};

/**
 * Inicia o pagamento de um plano. Regista o pedido como lead SEMPRE — antes
 * de sequer tentar o gateway — para a academia nunca perder o contato,
 * mesmo que o gateway ainda não esteja configurado ou falhe. Nunca regista
 * PII em logs (só mensagens genéricas em caso de erro).
 */
export async function iniciarPagamento(
  _prev: CheckoutActionResult | null,
  formData: FormData,
): Promise<CheckoutActionResult> {
  const parsed = checkoutSchema.safeParse({
    planoId: formData.get("planoId"),
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    metodo: formData.get("metodo"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { planoId, nome, email, telefone, metodo } = parsed.data;
  const plano = findPlano(planoId);
  if (!plano) {
    return { ok: false, error: "Plano inválido. Escolha um plano na lista." };
  }

  const metodoLabel = METODO_LABEL[metodo];

  try {
    await getDb()
      .insert(leads)
      .values({
        nome,
        telefone,
        interesse: `Checkout: ${plano.nome} (${metodoLabel})`,
        origem: "checkout",
      });
  } catch (err) {
    console.error("[iniciarPagamento] falha ao gravar lead:", err);
    return {
      ok: false,
      error:
        "Não foi possível registrar seu pedido agora. Tenta pelo WhatsApp.",
    };
  }

  const resultado = await getPaymentProvider().createCheckout({
    plano,
    metodo,
    cliente: { nome, email, telefone },
  });

  const whatsapp = waLink({ plano: plano.nome });

  if (resultado.status === "redirect") {
    return { ok: true, kind: "redirect", url: resultado.url };
  }

  if (resultado.status === "pending") {
    return { ok: true, kind: "pendente", mensagem: resultado.info, whatsapp };
  }

  return {
    ok: true,
    kind: "pendente",
    mensagem: `Recebemos seu pedido do plano ${plano.nome}. Nossa equipe vai confirmar o pagamento com você.`,
    whatsapp,
  };
}
