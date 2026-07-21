import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

export function LojaTeaser() {
  if (!SITE.flags.loja) return null;

  return (
    <section id="loja" className="py-20 md:py-28">
      <Container>
        <GlassCard className="flex flex-col gap-6">
          <div>
            <h2 className="font-display text-3xl text-fg uppercase md:text-4xl">
              Suplementos na academia
            </h2>
            <p className="mt-3 font-sans text-fg-dim">
              Loja online em breve. Por enquanto, fale connosco na academia.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {SITE.store.map((item) => (
              <Badge key={item} className="text-fg text-sm">
                {item}
              </Badge>
            ))}
          </div>

          <ButtonLink
            href={waLink({ plano: "Suplementos" })}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start"
          >
            Perguntar sobre suplementos
          </ButtonLink>
        </GlassCard>
      </Container>
    </section>
  );
}
