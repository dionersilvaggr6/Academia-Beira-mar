"use client";

import { useActionState } from "react";
import { type ActionResult, criarExercicio } from "@/app/actions/treinos";
import { ExercicioNomeSelect } from "@/components/instrutor/ExercicioNomeSelect";

const input =
  "rounded-lg border border-white/10 bg-white/5 p-2 text-fg text-sm placeholder:text-fg-dim focus:border-flame focus:outline-none";

export function CriarExercicioForm({
  treinoId,
  alunoId,
}: {
  treinoId: string;
  alunoId: string;
}) {
  const [state, action, pending] = useActionState<
    ActionResult | null,
    FormData
  >(criarExercicio, null);

  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="treinoId" value={treinoId} />
      <input type="hidden" name="alunoId" value={alunoId} />
      <ExercicioNomeSelect />
      <input
        name="series"
        type="number"
        min="1"
        required
        placeholder="Séries"
        className={`${input} w-20`}
        aria-label="Séries"
      />
      <input
        name="repeticoes"
        required
        placeholder="Reps"
        className={`${input} w-24`}
        aria-label="Repetições"
      />
      <input
        name="carga"
        placeholder="Carga"
        className={`${input} w-24`}
        aria-label="Carga"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-flame px-3 py-2 font-semibold text-ink text-sm transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "…" : "+ Exercício"}
      </button>
      {state && !state.ok && (
        <p role="alert" className="w-full text-err text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
