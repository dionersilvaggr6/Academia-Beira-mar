import { PlanoCard } from "@/components/ui/PlanoCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PLANS } from "@/lib/plans";

export function Planos() {
  return (
    <section id="planos" className="mx-auto max-w-6xl px-4 py-20">
      <SectionTitle>Nossos Planos</SectionTitle>
      <p className="mt-4 text-center text-bm-cream/70">
        Musculação livre — escolhe o teu e começa hoje.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => (
          <PlanoCard key={p.id} plano={p} />
        ))}
      </div>
    </section>
  );
}
