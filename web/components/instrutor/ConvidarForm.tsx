"use client";

import { useActionState } from "react";
import { type ActionResult, convidarPessoa } from "@/app/actions/pessoas";

const input =
  "w-full rounded-lg border border-white/10 bg-white/5 p-2 text-fg text-sm placeholder:text-fg-dim focus:border-flame focus:outline-none";

export function ConvidarForm({
  role,
  label,
}: {
  role: "aluno" | "instrutor";
  label: string;
}) {
  const [state, action, pending] = useActionState<
    ActionResult | null,
    FormData
  >(convidarPessoa, null);

  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="role" value={role} />
      <input
        name="nome"
        required
        placeholder="Nome"
        className={input}
        aria-label="Nome"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className={input}
        aria-label="Email"
      />
      {state?.ok && (
        <p role="status" aria-live="polite" className="text-green-400 text-sm">
          Convite enviado! ✅
        </p>
      )}
      {state && !state.ok && (
        <p role="alert" aria-live="assertive" className="text-err text-sm">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-flame p-2 font-semibold text-ink text-sm transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Convidando…" : label}
      </button>
    </form>
  );
}
