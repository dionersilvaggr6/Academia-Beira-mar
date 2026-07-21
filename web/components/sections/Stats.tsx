import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";

export function Stats() {
  return (
    <section id="numeros" className="py-16">
      <Container>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SITE.stats.map((stat) => (
            <GlassCard key={stat.rotulo} className="text-center">
              <p className="font-display text-4xl text-flame">
                <Counter value={stat.valor} />
              </p>
              <p className="mt-2 text-fg-dim">{stat.rotulo}</p>
            </GlassCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
