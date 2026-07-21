import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";
import { SOBRE_IMG } from "@/lib/images";

export function Sobre() {
  return (
    <section id="sobre" className="py-12 md:py-28">
      <Container className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
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

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={SOBRE_IMG}
            alt="Ambiente e estrutura da Academia Beira Mar"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
        </div>
      </Container>
    </section>
  );
}
