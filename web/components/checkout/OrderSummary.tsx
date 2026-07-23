"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { precoLabel } from "@/lib/plans";
import type { Plano } from "@/lib/plans.schema";

/** Resumo do pedido — plano, preço (via `precoLabel`, mesma fonte do card
 * de planos) e forma de pagamento do plano. */
export function OrderSummary({
  plano,
  onTrocarPlano,
}: {
  plano: Plano;
  onTrocarPlano: () => void;
}) {
  return (
    <GlassCard
      padding="p-4"
      className="flex items-center justify-between gap-3"
    >
      <div>
        <p className="font-sans text-fg-dim text-xs uppercase">
          Plano selecionado
        </p>
        <p className="font-display text-fg text-lg uppercase">{plano.nome}</p>
        <p className="font-display text-flame text-xl">{precoLabel(plano)}</p>
        <p className="text-fg-dim text-xs">{plano.forma}</p>
      </div>
      <button
        type="button"
        onClick={onTrocarPlano}
        className="shrink-0 font-sans text-flame text-sm underline-offset-4 hover:underline"
      >
        Trocar
      </button>
    </GlassCard>
  );
}
