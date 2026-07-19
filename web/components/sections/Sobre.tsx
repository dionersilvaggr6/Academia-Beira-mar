import { SectionTitle } from "@/components/ui/SectionTitle";
import { SITE } from "@/content/site";

export function Sobre() {
  return (
    <section id="sobre" className="mx-auto max-w-3xl px-4 py-20 text-center">
      <SectionTitle>Sobre nós</SectionTitle>
      <p className="mt-8 text-bm-cream/85 text-lg leading-relaxed">
        {SITE.tagline}
      </p>
      <p className="mt-4 text-bm-cream/70 leading-relaxed">
        Nova academia em Capão da Canoa, com atendimento humanizado, estrutura
        completa e aparelhos novos. Aqui, cada pessoa da comunidade encontra um
        ambiente familiar para cuidar da saúde e do bem-estar.
      </p>
    </section>
  );
}
