"use client";

import { useId } from "react";
import type { MetodoPagamento } from "@/lib/payments/provider";

const OPTIONS: ReadonlyArray<{
  value: MetodoPagamento;
  label: string;
  desc: string;
  disabled?: boolean;
}> = [
  { value: "pix", label: "Pix", desc: "Aprovação na hora" },
  { value: "cartao", label: "Cartão", desc: "Crédito ou débito" },
  { value: "boleto", label: "Boleto", desc: "Em breve", disabled: true },
];

/** Pix vem em destaque (é o método padrão do checkout no Brasil). Boleto já
 * tem espaço reservado no layout mas fica desabilitado até haver gateway. */
export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: MetodoPagamento;
  onChange: (metodo: MetodoPagamento) => void;
}) {
  const groupLabelId = useId();
  const groupName = useId();

  return (
    <div className="flex flex-col gap-2">
      <span id={groupLabelId} className="font-sans text-fg-dim text-sm">
        Forma de pagamento
      </span>
      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className="grid grid-cols-3 gap-2"
      >
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`rounded-lg border p-2.5 text-center transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-flame ${
                opt.disabled
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
                  : "cursor-pointer border-white/10 bg-white/[0.03] hover:border-flame/40"
              } ${
                selected && !opt.disabled
                  ? "border-flame bg-white/[0.06] ring-2 ring-flame"
                  : ""
              } ${opt.value === "pix" && !selected ? "border-flame/30" : ""}`}
            >
              <input
                type="radio"
                name={groupName}
                value={opt.value}
                checked={selected}
                disabled={opt.disabled}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span className="block font-display text-fg text-sm uppercase">
                {opt.label}
              </span>
              <span className="block text-[10px] text-fg-mute">{opt.desc}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
