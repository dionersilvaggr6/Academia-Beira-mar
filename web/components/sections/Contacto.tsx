"use client";

import { useActionState } from "react";
import { type LeadResult, submitLead } from "@/app/actions/submit-lead";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 p-3 font-sans text-fg placeholder:text-fg-mute focus:border-flame focus:outline-none";

export function Contacto() {
  const [state, action, pending] = useActionState<LeadResult | null, FormData>(
    submitLead,
    null,
  );

  return (
    <section id="contacto" className="py-20 md:py-28">
      <Container className="max-w-lg">
        <h2 className="text-center font-display text-3xl text-fg uppercase md:text-4xl">
          Fale conosco
        </h2>

        <GlassCard className="mt-10">
          {state?.ok ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-ok/40 bg-ok/10 p-4 text-center font-sans text-fg"
            >
              Recebemos o seu contato! Em breve falamos com você. 💪
            </p>
          ) : (
            <form action={action} className="space-y-4">
              <div>
                <label htmlFor="nome" className="sr-only">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  required
                  placeholder="Seu nome"
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
                  className="font-sans text-err text-sm"
                >
                  {state.error}
                </p>
              )}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Enviando…" : "Quero começar"}
              </Button>

              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center font-sans text-flame text-sm"
              >
                ou fale conosco no WhatsApp {SITE.whatsappDisplay}
              </a>
            </form>
          )}
        </GlassCard>
      </Container>
    </section>
  );
}
