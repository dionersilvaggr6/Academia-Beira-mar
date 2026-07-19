import { SectionTitle } from "@/components/ui/SectionTitle";
import { SITE } from "@/content/site";

export function Diferenciais() {
  return (
    <section id="diferenciais" className="mx-auto max-w-6xl px-4 py-20">
      <SectionTitle>Porquê o Beira Mar</SectionTitle>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {SITE.diferenciais.map((d) => (
          <div
            key={d}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-5"
          >
            <span className="text-bm-orange text-xl">✓</span>
            <span className="font-medium text-bm-cream">{d}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
