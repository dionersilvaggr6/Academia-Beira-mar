import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 text-center"
    >
      <div className="-z-10 absolute inset-0 bg-gradient-to-b from-bm-black via-bm-black to-black" />
      <div className="-z-10 absolute inset-0 opacity-20 [background:radial-gradient(circle_at_50%_30%,var(--color-bm-orange),transparent_55%)]" />

      <p className="mb-3 font-semibold text-bm-orange uppercase tracking-[0.3em]">
        Academia
      </p>
      <h1 className="font-extrabold text-5xl text-bm-cream uppercase leading-none md:text-7xl">
        Beira <span className="text-bm-orange">Mar</span>
      </h1>
      <p className="mt-5 max-w-xl text-bm-cream/80 text-lg">{SITE.tagline}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-bm-orange px-8 py-3 font-bold text-bm-black transition hover:brightness-110"
        >
          Matricular agora
        </a>
        <a
          href="#planos"
          className="rounded-lg border border-bm-cream/30 px-8 py-3 font-bold text-bm-cream transition hover:border-bm-orange"
        >
          Ver planos
        </a>
      </div>
    </section>
  );
}
