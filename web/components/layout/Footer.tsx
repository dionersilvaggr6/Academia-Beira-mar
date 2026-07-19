import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="border-white/10 border-t bg-black px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <p className="font-extrabold text-bm-cream text-lg uppercase">
            Beira <span className="text-bm-orange">Mar</span>
          </p>
          <p className="mt-2 text-bm-cream/60 text-sm">{SITE.tagline}</p>
        </div>
        <div>
          <p className="font-bold text-bm-orange">Contacto</p>
          <p className="mt-2 text-bm-cream/70 text-sm">{SITE.address}</p>
          <p className="text-bm-cream/70 text-sm">{SITE.city}</p>
          <a
            href={waLink()}
            className="mt-2 block text-bm-cream/70 text-sm hover:text-bm-orange"
          >
            WhatsApp {SITE.whatsappDisplay}
          </a>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-bm-cream/70 text-sm hover:text-bm-orange"
          >
            Instagram {SITE.instagramHandle}
          </a>
        </div>
        <div>
          <p className="font-bold text-bm-orange">Horário</p>
          <ul className="mt-2 space-y-1">
            {SITE.hours.map((h) => (
              <li key={h.dias} className="text-bm-cream/70 text-sm">
                {h.dias}: {h.horas}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-bm-cream/40 text-xs">
        © {new Date().getFullYear()} Academia Beira Mar. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
