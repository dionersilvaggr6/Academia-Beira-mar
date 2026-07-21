"use client";

import { useActionState } from "react";
import { type RecuperarSenhaResult, recuperarSenha } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 p-3 text-fg placeholder:text-fg-dim focus:border-flame focus:outline-none";

/**
 * Formulário de "esqueci minha senha". Três estados: a enviar (`pending`),
 * erro de validação (email em formato inválido) e sucesso — que mostra
 * sempre a mesma mensagem neutra, exista ou não a conta (ver `recuperarSenha`).
 */
export function RecuperarSenhaForm() {
  const [state, action, pending] = useActionState<
    RecuperarSenhaResult | null,
    FormData
  >(recuperarSenha, null);

  if (state?.ok) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mt-8 text-center text-fg text-sm"
      >
        Se este email estiver cadastrado, enviamos um link para redefinir a
        senha.
      </p>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email"
          className={inputClass}
        />
      </div>

      {state && !state.ok && (
        <p role="alert" aria-live="assertive" className="text-err text-sm">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-flame p-3 font-bold text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar link de recuperação"}
      </button>
    </form>
  );
}
