"use client";
import { useEffect, useRef, useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HEADER_NAV } from "@/lib/nav";
import { cn } from "@/lib/ui/cn";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" />
      ) : (
        <path d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        // z-[60]: sits above the WhatsApp FAB (z-50) so the mobile drawer —
        // rendered inside this element — dims/covers it too. No visual
        // change while idle, the two never overlapped before.
        "fixed inset-x-0 top-0 z-[60] transition",
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
          {HEADER_NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-sans text-fg-dim text-sm transition hover:text-fg"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1 md:gap-2">
          <a
            href="/login"
            className="px-3 py-2.5 font-sans text-fg-dim text-sm transition hover:text-fg"
          >
            Entrar
          </a>
          {/* Fluxo de venda vai para o checkout próprio, sem plano
              pré-selecionado — ver app/checkout/page.tsx. */}
          <ButtonLink href="/checkout" size="compact">
            Matricular
          </ButtonLink>
          <button
            ref={menuTriggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 text-fg md:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </Container>
      {menuOpen && (
        <MobileMenu
          onClose={() => setMenuOpen(false)}
          returnFocusRef={menuTriggerRef}
        />
      )}
    </header>
  );
}
