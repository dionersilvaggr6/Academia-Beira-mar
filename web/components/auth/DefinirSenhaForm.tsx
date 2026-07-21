"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { type DefinirSenhaResult, definirSenha } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 p-3 text-fg placeholder:text-fg-dim focus:border-flame focus:outline-none";

export function DefinirSenhaForm() {
  const [state, action, pending] = useActionState<
    DefinirSenhaResult | null,
    FormData
  >(definirSenha, null);
  const router = useRouter();

  // Sucesso: o server action não usa redirect() para o form poder mostrar a
  // confirmação antes de navegar.
  useEffect(() => {
    if (state?.ok) router.push(state.redirectTo);
  }, [state, router]);

  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="senha" className="sr-only">
          Nova senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          placeholder="Nova senha"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="confirmarSenha" className="sr-only">
          Confirme a senha
        </label>
        <input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          required
          minLength={8}
          placeholder="Confirme a senha"
          className={inputClass}
        />
      </div>

      {state && !state.ok && (
        <p role="alert" aria-live="assertive" className="text-err text-sm">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" aria-live="polite" className="text-sm text-flame">
          Senha definida! Redirecionando…
        </p>
      )}

      <button
        type="submit"
        disabled={pending || state?.ok}
        className="w-full rounded-lg bg-flame p-3 font-bold text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar senha"}
      </button>
    </form>
  );
}
