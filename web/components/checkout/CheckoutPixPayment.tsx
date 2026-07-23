"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { precoLabel } from "@/lib/plans";
import type { Plano } from "@/lib/plans.schema";

type CopyStatus = "idle" | "copiado" | "erro";

/**
 * Pagamento Pix inline (sem redirect): QR code + copia-e-cola + valor +
 * instrução. Mostrado no lugar do formulário quando `iniciarPagamento`
 * devolve `kind: "pix"` (ver `CheckoutForm`).
 */
export function CheckoutPixPayment({
  plano,
  qrCodeBase64,
  copiaECola,
  expiresAt,
}: {
  plano: Plano;
  qrCodeBase64: string;
  copiaECola: string;
  expiresAt?: string;
}) {
  const campoId = useId();
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(copiaECola);
      setStatus("copiado");
    } catch {
      setStatus("erro");
    }
  }

  return (
    <GlassCard className="mt-8 space-y-4 text-center">
      <div>
        <p className="font-sans text-fg-dim text-xs uppercase">
          Pagamento via Pix
        </p>
        <p className="font-display text-flame text-2xl">{precoLabel(plano)}</p>
      </div>

      <img
        src={`data:image/png;base64,${qrCodeBase64}`}
        alt="QR code Pix para pagamento"
        width={224}
        height={224}
        className="mx-auto h-auto w-56 rounded-lg border border-white/10 bg-white p-2"
      />

      <p className="font-sans text-fg-dim text-sm">
        Abra o app do banco, escolha Pix › Ler QR code.
      </p>

      {expiresAt && (
        <p className="text-fg-mute text-xs">
          Código válido até{" "}
          {new Date(expiresAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      <div className="text-left">
        <label
          htmlFor={campoId}
          className="mb-1 block font-sans text-fg-dim text-xs"
        >
          Pix copia e cola
        </label>
        <textarea
          id={campoId}
          readOnly
          value={copiaECola}
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-fg text-xs"
        />
      </div>

      <Button type="button" onClick={copiar} className="w-full">
        {status === "copiado" ? "Copiado!" : "Copiar código"}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copiado" &&
          "Código Pix copiado para a área de transferência"}
        {status === "erro" &&
          "Não foi possível copiar automaticamente — selecione o código acima"}
      </span>
    </GlassCard>
  );
}
