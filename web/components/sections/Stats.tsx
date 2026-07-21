import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { SITE } from "@/content/site";

export function Stats() {
  return (
    <section
      id="numeros"
      className="border-white/5 border-y bg-surface/30 py-12 md:py-16"
    >
      <Container>
        <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-white/10">
          {SITE.stats.map((stat) => (
            <div
              key={stat.rotulo}
              className="px-6 text-center md:px-8 md:text-left"
            >
              <p className="font-display text-5xl text-flame leading-none tracking-tight md:text-6xl">
                <Counter value={stat.valor} />
              </p>
              <p className="mt-3 font-sans text-fg-dim text-sm">
                {stat.rotulo}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
