"use client";

import { useActionState } from "react";
import { type LoginResult, login } from "@/app/actions/auth";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 p-3 text-fg placeholder:text-fg-dim focus:border-flame focus:outline-none";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginResult | null, FormData>(
    login,
    null,
  );

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
      <div>
        <label htmlFor="password" className="sr-only">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Senha"
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
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
