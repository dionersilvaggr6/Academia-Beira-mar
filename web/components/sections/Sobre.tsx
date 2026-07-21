import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";

export function Sobre() {
  return (
    <section id="sobre" className="py-20 md:py-28">
      <Container className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="font-display text-3xl text-fg uppercase md:text-4xl">
            Sobre nós
          </h2>
          <p className="mt-6 font-sans text-fg-dim text-lg leading-relaxed">
            {SITE.tagline}
          </p>
          <p className="mt-4 font-sans text-fg-mute leading-relaxed">
            Nova academia em Capão da Canoa, com atendimento humanizado,
            estrutura completa e aparelhos novos — um ambiente familiar e
            acolhedor para cuidar da saúde e do bem-estar de toda a comunidade.
          </p>
        </div>

        <GlassCard className="grid grid-cols-2 gap-3">
          {SITE.diferenciais.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-flame">
                ✓
              </span>
              <span className="font-sans text-fg-dim text-sm">{item}</span>
            </div>
          ))}
        </GlassCard>
      </Container>
    </section>
  );
}
