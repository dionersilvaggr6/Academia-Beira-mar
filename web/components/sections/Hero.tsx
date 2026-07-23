import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[92vh] items-center overflow-hidden pt-20"
    >
      {/* O campo de partículas 3D agora é montado uma única vez em
          app/layout.tsx como fundo global; aqui fica só o overlay de
          gradiente que garante legibilidade do headline. */}
      <div className="-z-10 absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" />
      <Container className="text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <Badge className="mb-5">⭐ 5,0 no Google · +5.700 no Instagram</Badge>
          <h1 className="font-display font-bold text-5xl text-fg uppercase leading-[0.95] sm:text-6xl md:text-8xl">
            Aqui
            <br />
            evoluímos<span className="text-flame">.</span>
          </h1>
          <p className="mt-6 max-w-xl font-sans text-fg-dim text-lg">
            Musculação, Pilates e Funcional em Capão da Canoa. Aparelhos novos,
            climatizada, ambiente familiar.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {/* Fluxo de venda vai para o checkout próprio, não mais direto
                ao WhatsApp — ver app/checkout/page.tsx. */}
            <ButtonLink href="/checkout" className="px-8">
              Matricular agora
            </ButtonLink>
            <ButtonLink href="#planos" variant="ghost" className="px-8">
              Ver planos
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
