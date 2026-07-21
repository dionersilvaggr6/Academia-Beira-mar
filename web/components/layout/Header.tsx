"use client";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";
import { cn } from "@/lib/ui/cn";
import { waLink } from "@/lib/whatsapp";

const NAV = [
  { href: "/#modalidades", label: "Modalidades" },
  { href: "/#planos", label: "Planos" },
  { href: "/#depoimentos", label: "Depoimentos" },
  { href: "/#localizacao", label: "Onde estamos" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition",
        scrolled && "border-white/10 border-b",
      )}
      style={
        scrolled
          ? {
              background: "var(--glass-bg)",
              backdropFilter: "blur(var(--glass-blur))",
            }
          : undefined
      }
    >
      <Container className="flex items-center justify-between py-3">
        <a
          href="/"
          className="flex items-center gap-2 font-display font-bold text-fg tracking-wide"
        >
          <img src="/brand/mark.svg" alt="" width={26} height={26} /> BEIRA MAR
        </a>
        <nav className="hidden gap-6 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-sans text-fg-dim text-sm transition hover:text-fg"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="px-3 py-2.5 font-sans text-fg-dim text-sm transition hover:text-fg"
          >
            Entrar
          </a>
          <ButtonLink
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm"
          >
            Matricular
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
