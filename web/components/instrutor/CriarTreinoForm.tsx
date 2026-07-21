"use client";

import { useActionState } from "react";
import { type ActionResult, criarTreino } from "@/app/actions/treinos";

const input =
  "rounded-lg border border-white/10 bg-white/5 p-2 text-fg text-sm placeholder:text-fg-dim focus:border-flame focus:outline-none";

export function CriarTreinoForm({ alunoId }: { alunoId: string }) {
  const [state, action, pending] = useActionState<
    ActionResult | null,
    FormData
  >(criarTreino, null);

  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="alunoId" value={alunoId} />
      <input
        name="nome"
        required
        placeholder="Divisão (ex.: Treino A)"
        className={input}
        aria-label="Nome da divisão"
      />
      <input
        name="foco"
        placeholder="Foco (ex.: Peito/Tríceps)"
        className={input}
        aria-label="Foco"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-flame px-3 py-2 font-semibold text-ink text-sm transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "…" : "Adicionar divisão"}
      </button>
      {state && !state.ok && (
        <p role="alert" className="w-full text-err text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
