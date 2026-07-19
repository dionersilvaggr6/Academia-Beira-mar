import { SectionTitle } from "@/components/ui/SectionTitle";
import { SITE } from "@/content/site";

const MAP_SRC =
  "https://www.google.com/maps?q=Academia+Beira+Mar+Av+Paraguassu+78+Cap%C3%A3o+da+Canoa&output=embed";

export function Localizacao() {
  return (
    <section id="localizacao" className="mx-auto max-w-6xl px-4 py-20">
      <SectionTitle>Onde estamos</SectionTitle>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="font-bold text-bm-orange text-lg">Endereço</h3>
          <p className="mt-1 text-bm-cream/85">{SITE.address}</p>
          <p className="text-bm-cream/85">{SITE.city}</p>

          <h3 className="mt-6 font-bold text-bm-orange text-lg">Horário</h3>
          <ul className="mt-1 space-y-1">
            {SITE.hours.map((h) => (
              <li
                key={h.dias}
                className="flex justify-between gap-4 text-bm-cream/85"
              >
                <span>{h.dias}</span>
                <span className="font-medium">{h.horas}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title="Mapa Academia Beira Mar"
            src={MAP_SRC}
            className="h-72 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
