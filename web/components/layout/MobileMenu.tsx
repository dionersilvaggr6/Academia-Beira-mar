"use client";

import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { HEADER_NAV } from "@/lib/nav";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const linkClass =
  "flex min-h-10 items-center rounded-lg px-3 py-2.5 font-sans text-base text-fg-dim transition hover:bg-white/5 hover:text-fg";

export function MobileMenu({
  onClose,
  returnFocusRef,
}: {
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Trap focus, close on Escape, lock page scroll while mounted, and hand
  // focus back to whatever opened the menu once it unmounts. Conditionally
  // mounting (Header only renders <MobileMenu> while open) keeps this a
  // single effect instead of an open/close state machine.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const initial =
      panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    initial?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [onClose, returnFocusRef]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-ink/80 backdrop-blur-sm md:hidden"
      />
      {/* role="dialog" lives on this element (not a wrapper) — it's the one
          that's actually fixed/sized/visible, so tooling that checks
          visibility against the dialog role sees the real thing. */}
      <div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-y-0 right-0 z-10 flex w-[82%] max-w-xs flex-col gap-6 overflow-y-auto border-white/10 border-l bg-surface p-6 pt-24 md:hidden"
      >
        <nav className="flex flex-col gap-1" aria-label="Navegação principal">
          {HEADER_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={linkClass}
            >
              {item.label}
            </a>
          ))}
          <a href="/login" onClick={onClose} className={linkClass}>
            Entrar
          </a>
        </nav>
        <ButtonLink href="/checkout" onClick={onClose} className="mt-auto">
          Matricular
        </ButtonLink>
      </div>
    </>
  );
}
