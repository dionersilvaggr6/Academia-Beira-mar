"use client";

import { useId } from "react";
import { PLANS, precoLabel } from "@/lib/plans";
import type { Plano } from "@/lib/plans.schema";

/**
 * Seletor compacto de plano — mesmo padrão de radiogroup acessível usado em
 * `AplicarModeloForm` (inputs `radio` reais, só visualmente escondidos, com
 * navegação por teclado nativa e foco visível via `has-[:focus-visible]`).
 */
export function PlanSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (plano: Plano) => void;
}) {
  const groupLabelId = useId();
  const groupName = useId();

  return (
    <div className="flex flex-col gap-2">
      <span id={groupLabelId} className="font-sans text-fg-dim text-sm">
        Escolha o plano
      </span>
      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {PLANS.map((plano) => {
          const selected = plano.id === selectedId;
          return (
            <label
              key={plano.id}
              className={`cursor-pointer rounded-lg border p-2.5 text-left transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-flame ${
                selected
                  ? "border-flame bg-white/[0.06] ring-2 ring-flame"
                  : "border-white/10 bg-white/[0.03] hover:border-flame/40"
              }`}
            >
              <input
                type="radio"
                name={groupName}
                value={plano.id}
                checked={selected}
                onChange={() => onSelect(plano)}
                className="sr-only"
              />
              <span className="block font-display text-fg text-xs uppercase leading-tight">
                {plano.nome}
              </span>
              <span className="block font-display text-flame text-sm">
                {precoLabel(plano)}
              </span>
              <span className="block text-[10px] text-fg-mute">
                {plano.forma}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
