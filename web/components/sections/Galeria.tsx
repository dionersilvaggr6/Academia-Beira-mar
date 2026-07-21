"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";
import { GALLERY as GALLERY_IMAGES } from "@/lib/images";

export function Galeria() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const openFrom = useCallback(
    (index: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
      triggerRef.current = event.currentTarget;
      setOpenIndex(index);
    },
    [],
  );

  useEffect(() => {
    if (openIndex === null) return;

    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }
      // Only one focusable element lives inside the dialog, so trapping
      // focus just means keeping it pinned to the close button.
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Return focus to the thumbnail that opened the lightbox, so
      // keyboard/screen-reader users land back where they started.
      triggerRef.current?.focus();
    };
  }, [openIndex, close]);

  if (!SITE.flags.galeria) return null;

  const active = openIndex === null ? null : GALLERY_IMAGES[openIndex];

  return (
    <section id="galeria" className="py-12 md:py-28">
      <Container>
        <h2 className="text-center font-display text-3xl text-fg uppercase md:text-4xl">
          Galeria
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {GALLERY_IMAGES.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={openFrom(index)}
              aria-label={`Ampliar ${image.alt}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-2 via-surface to-ink transition-colors duration-300 hover:border-flame/50"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </Container>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.alt}
            onClick={(event) => event.stopPropagation()}
            className="relative aspect-square w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-surface"
          >
            <Image
              src={active.src}
              alt={active.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Fechar galeria"
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-fg transition hover:text-flame"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
