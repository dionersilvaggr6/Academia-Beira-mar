"use client";

import { useActionState } from "react";
import { type LeadResult, submitLead } from "@/app/actions/submit-lead";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 p-3 text-bm-cream placeholder:text-bm-cream/40 focus:border-bm-orange focus:outline-none";

export function Contacto() {
  const [state, action, pending] = useActionState<LeadResult | null, FormData>(
    submitLead,
    null,
  );

  return (
    <section id="contacto" className="mx-auto max-w-lg px-4 py-20">
      <SectionTitle>Fala connosco</SectionTitle>

      {state?.ok ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-8 rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-center text-bm-cream"
        >
          Recebemos o teu contacto! Em breve falamos contigo. 💪
        </p>
      ) : (
        <form action={action} className="mt-8 space-y-4">
          <div>
            <label htmlFor="nome" className="sr-only">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              required
              placeholder="O teu nome"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="telefone" className="sr-only">
              Telefone ou WhatsApp
            </label>
            <input
              id="telefone"
              name="telefone"
              required
              inputMode="tel"
              placeholder="Telefone / WhatsApp"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="interesse" className="sr-only">
              Plano ou modalidade de interesse
            </label>
            <input
              id="interesse"
              name="interesse"
              placeholder="Plano ou modalidade (opcional)"
              className={inputClass}
            />
          </div>

          {state && !state.ok && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-red-400 text-sm"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-bm-orange p-3 font-bold text-bm-black transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "A enviar…" : "Quero começar"}
          </button>

          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-bm-orange text-sm"
          >
            ou fala connosco no WhatsApp {SITE.whatsappDisplay}
          </a>
        </form>
      )}
    </section>
  );
}
