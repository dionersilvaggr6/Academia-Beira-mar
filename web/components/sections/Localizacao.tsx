import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";

const MAP_QUERY = "Av. Paraguassu, 78, Jardim Beira Mar, Capão da Canoa - RS";
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;

export function Localizacao() {
  return (
    <section id="localizacao" className="py-12 md:py-28">
      <Container>
        <h2 className="text-center font-display text-3xl text-fg uppercase md:text-4xl">
          Onde estamos
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <GlassCard>
            <h3 className="font-display text-flame text-lg uppercase">
              Endereço
            </h3>
            <p className="mt-2 font-sans text-fg-dim">{SITE.address}</p>
            <p className="font-sans text-fg-dim">{SITE.city}</p>

            <h3 className="mt-6 font-display text-flame text-lg uppercase">
              Horário
            </h3>
            <ul className="mt-2 space-y-1">
              {SITE.hours.map((h) => (
                <li
                  key={h.dias}
                  className="flex justify-between gap-4 font-sans text-fg-dim text-sm"
                >
                  <span>{h.dias}</span>
                  <span className="font-medium text-fg">{h.horas}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 font-sans text-fg-mute text-sm">
              Mais movimentado por volta das 20h.
            </p>
          </GlassCard>

          <div
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <iframe
              title="Mapa — Academia Beira Mar"
              src={MAP_SRC}
              className="h-80 w-full md:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                filter:
                  "invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(0.9) saturate(0.85)",
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
