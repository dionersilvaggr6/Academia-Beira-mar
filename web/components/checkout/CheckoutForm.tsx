"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  type CheckoutActionResult,
  iniciarPagamento,
} from "@/app/actions/checkout";
import { CheckoutPendingMessage } from "@/components/checkout/CheckoutPendingMessage";
import { CheckoutPixPayment } from "@/components/checkout/CheckoutPixPayment";
import { CustomerFields } from "@/components/checkout/CustomerFields";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { PlanSelector } from "@/components/checkout/PlanSelector";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/content/site";
import type { MetodoPagamento } from "@/lib/payments/provider";
import { findPlano } from "@/lib/plans";
import type { Plano } from "@/lib/plans.schema";
import { waLink } from "@/lib/whatsapp";

export function CheckoutForm({
  planoIdInicial,
}: {
  planoIdInicial: string | null;
}) {
  const planoInicial = planoIdInicial
    ? (findPlano(planoIdInicial) ?? null)
    : null;
  const [plano, setPlano] = useState<Plano | null>(planoInicial);
  const [selectorOpen, setSelectorOpen] = useState(planoInicial === null);
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [state, action, pending] = useActionState<
    CheckoutActionResult | null,
    FormData
  >(iniciarPagamento, null);
  const router = useRouter();

  // Só o resultado "redirect" navega — o "pendente" fica na própria página
  // mostrando a confirmação (ver render abaixo).
  useEffect(() => {
    if (state?.ok && state.kind === "redirect") router.push(state.url);
  }, [state, router]);

  // Pix fica inline na própria página (sem redirect) — só mostra se ainda
  // tivermos o plano em memória (garantido: só existe resultado depois de
  // submeter, e o botão de submeter só fica ativo com `plano` escolhido).
  if (state?.ok && state.kind === "pix" && plano) {
    return (
      <CheckoutPixPayment
        plano={plano}
        qrCodeBase64={state.qrCodeBase64}
        copiaECola={state.copiaECola}
        expiresAt={state.expiresAt}
      />
    );
  }

  if (state?.ok && state.kind === "pendente") {
    return (
      <CheckoutPendingMessage
        mensagem={state.mensagem}
        whatsapp={state.whatsapp}
      />
    );
  }

  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="planoId" value={plano?.id ?? ""} />
      <input type="hidden" name="metodo" value={metodo} />

      {plano && !selectorOpen ? (
        <OrderSummary
          plano={plano}
          onTrocarPlano={() => setSelectorOpen(true)}
        />
      ) : (
        <PlanSelector
          selectedId={plano?.id ?? null}
          onSelect={(p) => {
            setPlano(p);
            setSelectorOpen(false);
          }}
        />
      )}

      <CustomerFields />

      <PaymentMethodSelector value={metodo} onChange={setMetodo} />

      {state && !state.ok && (
        <p
          role="alert"
          aria-live="assertive"
          className="font-sans text-err text-sm"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || !plano} className="w-full">
        {pending ? "Processando…" : "Confirmar pedido"}
      </Button>

      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center font-sans text-flame text-sm"
      >
        Dúvidas? Fale conosco no WhatsApp {SITE.whatsappDisplay}
      </a>
    </form>
  );
}
