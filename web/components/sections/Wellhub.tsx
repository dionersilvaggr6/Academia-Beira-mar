import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";

export function Wellhub() {
  return (
    <section id="wellhub" className="py-10 md:py-16">
      <Container>
        <GlassCard className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-xl text-fg uppercase tracking-wide md:text-2xl">
              Aceitamos Wellhub / Gympass
            </p>
            <p className="mt-2 font-sans text-fg-dim">
              Treine com o seu plano Wellhub/Gympass na Academia Beira Mar.
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-flame/30 bg-flame/10 px-4 py-2 font-sans font-bold text-flame text-sm uppercase tracking-wide">
            Wellhub · Gympass
          </span>
        </GlassCard>
      </Container>
    </section>
  );
}
