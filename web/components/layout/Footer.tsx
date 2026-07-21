import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

const NAV = [
  { href: "/#modalidades", label: "Modalidades" },
  { href: "/#planos", label: "Planos" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#localizacao", label: "Onde estamos" },
  { href: "/#contacto", label: "Contato" },
];

export function Footer() {
  return (
    <footer className="border-white/10 border-t bg-ink py-12">
      <Container className="grid gap-10 md:grid-cols-4">
        <div>
          <a
            href="/"
            className="flex items-center gap-2 font-display font-bold text-fg tracking-wide"
          >
            <img src="/brand/mark.svg" alt="" width={26} height={26} /> BEIRA
            MAR
          </a>
          <p className="mt-3 font-sans text-fg-mute text-sm">{SITE.tagline}</p>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-sans text-fg-dim text-sm transition hover:text-flame"
          >
            Instagram {SITE.instagramHandle}
          </a>
        </div>

        <div>
          <p className="font-display text-flame text-sm uppercase tracking-wide">
            Navegação
          </p>
          <ul className="mt-3 space-y-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="font-sans text-fg-dim text-sm transition hover:text-flame"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-flame text-sm uppercase tracking-wide">
            Contato
          </p>
          <p className="mt-3 font-sans text-fg-dim text-sm">{SITE.address}</p>
          <p className="font-sans text-fg-dim text-sm">{SITE.city}</p>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block font-sans text-fg-dim text-sm transition hover:text-flame"
          >
            WhatsApp {SITE.whatsappDisplay}
          </a>
        </div>

        <div>
          <p className="font-display text-flame text-sm uppercase tracking-wide">
            Horário
          </p>
          <ul className="mt-3 space-y-1">
            {SITE.hours.map((h) => (
              <li key={h.dias} className="font-sans text-fg-dim text-sm">
                {h.dias}: {h.horas}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <p className="mt-10 text-center font-sans text-fg-mute text-xs">
        © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
      </p>
    </footer>
  );
}
