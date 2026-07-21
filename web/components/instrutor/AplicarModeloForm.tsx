"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { type ActionResult, aplicarModelo } from "@/app/actions/treinos";
import { MODELOS } from "@/lib/treinos/modelos";

/**
 * Deixa o instrutor escolher um dos modelos prontos (`MODELOS`) e aplicá-lo
 * ao aluno de um clique — cria as divisões todas com os exercícios já
 * preenchidos. Séries/repetições ficam com um valor provisório (o instrutor
 * ajusta depois), por isso pede confirmação antes de criar várias linhas.
 *
 * São só 4 opções ricas (nome + descrição + divisões) — um `<select>` nativo
 * escondia a maior parte dessa informação, por isso usa um radiogroup de
 * cartões (inputs `radio` reais, só visualmente escondidos) que dá a mesma
 * navegação por teclado nativa dos radios.
 */
export function AplicarModeloForm({ alunoId }: { alunoId: string }) {
  const groupLabelId = useId();
  const groupName = useId();
  const [modeloId, setModeloId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState<
    ActionResult | null,
    FormData
  >(aplicarModelo, null);

  const modelo = MODELOS.find((m) => m.id === modeloId);

  // Depois de aplicar com sucesso, fecha a confirmação e limpa a escolha —
  // as novas divisões já aparecem na lista abaixo (revalidatePath).
  useEffect(() => {
    if (state?.ok) {
      setConfirming(false);
      setModeloId("");
    }
  }, [state]);

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-col gap-2">
        <span id={groupLabelId} className="text-fg-dim text-sm">
          Aplicar modelo de treino
        </span>
        <div
          role="radiogroup"
          aria-labelledby={groupLabelId}
          className="grid gap-2 sm:grid-cols-2"
        >
          {MODELOS.map((m) => {
            const selected = modeloId === m.id;
            return (
              <label
                key={m.id}
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-flame ${
                  selected
                    ? "border-flame bg-white/[0.06] ring-2 ring-flame"
                    : "border-white/10 bg-white/[0.03] hover:border-flame/40"
                }`}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={m.id}
                  checked={selected}
                  onChange={() => {
                    setModeloId(m.id);
                    setConfirming(false);
                  }}
                  className="sr-only"
                />
                <span className="font-semibold text-fg">{m.nome}</span>
                <span className="text-fg-dim text-xs">{m.descricao}</span>
                <span className="text-fg-mute text-xs">
                  {m.divisoes.map((d) => d.nome).join(" · ")}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {modelo && (
        <div className="rounded-lg border border-flame/25 bg-white/[0.03] p-3">
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg bg-flame px-3 py-2 font-semibold text-ink text-sm transition hover:brightness-110"
            >
              Aplicar modelo
            </button>
          ) : (
            <form action={action} className="space-y-2">
              <input type="hidden" name="alunoId" value={alunoId} />
              <input type="hidden" name="modeloId" value={modelo.id} />
              <p className="text-fg text-sm">
                Isto vai criar{" "}
                {modelo.divisoes.length === 1
                  ? "1 divisão nova"
                  : `${modelo.divisoes.length} divisões novas`}{" "}
                com os exercícios do modelo já preenchidos. Séries e repetições
                ficam com um valor provisório — ajusta depois para este aluno.
                Confirmas?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-flame px-3 py-2 font-semibold text-ink text-sm transition hover:brightness-110 disabled:opacity-60"
                >
                  {pending ? "A aplicar…" : "Sim, aplicar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="rounded-lg border border-white/20 px-3 py-2 text-fg text-sm transition hover:border-flame disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {state && !state.ok && (
        <p role="alert" className="text-err text-sm">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-flame text-sm">
          Modelo aplicado. Já podes ajustar séries, repetições e carga em cada
          exercício.
        </p>
      )}
    </div>
  );
}
