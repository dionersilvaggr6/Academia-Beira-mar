import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { waLink } from "@/lib/whatsapp";

const PILARES = ["Segurança", "Eficiência", "Resultados"] as const;

export function PersonalTrainer() {
  return (
    <section id="personal" className="py-12 md:py-28">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge className="mb-4">Treino individual</Badge>
            <h2 className="font-display text-3xl text-fg uppercase leading-tight md:text-4xl">
              Personal Trainer
            </h2>
            <p className="mt-4 max-w-md font-sans text-fg-dim text-lg">
              Treinos exclusivos com acompanhamento de Personal Trainer. Método
              focado em segurança, eficiência e resultados.
            </p>
            <ButtonLink
              href={waLink({ plano: "Personal Trainer" })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8"
            >
              Quero um Personal Trainer
            </ButtonLink>
          </div>

          <GlassCard className="flex flex-col gap-5">
            <p className="font-sans text-fg-mute text-xs uppercase tracking-wide">
              O que garantimos
            </p>
            <div className="flex flex-wrap gap-3">
              {PILARES.map((pilar) => (
                <Badge key={pilar} tone="strong" className="text-sm">
                  {pilar}
                </Badge>
              ))}
            </div>
          </GlassCard>
        </div>
      </Container>
    </section>
  );
}
