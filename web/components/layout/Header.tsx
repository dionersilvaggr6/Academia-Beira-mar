import { waLink } from "@/lib/whatsapp";

const LINKS = [
  { href: "#modalidades", label: "Modalidades" },
  { href: "#planos", label: "Planos" },
  { href: "#localizacao", label: "Localização" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-white/10 border-b bg-bm-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a
          href="#inicio"
          className="font-extrabold text-bm-cream uppercase tracking-wide"
        >
          Beira <span className="text-bm-orange">Mar</span>
        </a>
        <nav className="hidden gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-bm-cream/80 text-sm transition hover:text-bm-orange"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="rounded-lg border border-bm-cream/20 px-3 py-2 font-semibold text-bm-cream text-sm transition hover:border-bm-orange"
          >
            Entrar
          </a>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-bm-orange px-4 py-2 font-semibold text-bm-black text-sm transition hover:brightness-110"
          >
            Matricular
          </a>
        </div>
      </div>
    </header>
  );
}
