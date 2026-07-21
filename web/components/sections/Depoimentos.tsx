"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";
import { cn } from "@/lib/ui/cn";

const AUTO_ADVANCE_MS = 6000;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={direction === "left" ? "rotate-180" : undefined}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Depoimentos() {
  const reviews = SITE.reviews;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const goTo = (next: number) => {
    setIndex(((next % reviews.length) + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (reducedMotion || paused || reviews.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused, reviews.length]);

  const current = reviews[index];
  if (!current) return null;

  return (
    <section id="depoimentos" className="py-20 md:py-28">
      <Container>
        <h2 className="text-center font-display text-3xl text-fg uppercase md:text-4xl">
          O que dizem de nós
        </h2>
        <p
          aria-hidden="true"
          className="mt-3 text-center font-sans text-flame text-lg"
        >
          ★★★★★
        </p>

        <div
          className="relative mx-auto mt-10 max-w-2xl"
          role="region"
          aria-roledescription="carousel"
          aria-label="Depoimentos de alunos"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${reviews.length}`}
              >
                <GlassCard className="text-center">
                  <p className="font-sans text-fg text-lg leading-relaxed">
                    “{current.texto}”
                  </p>
                  <p className="mt-4 font-sans text-fg-dim text-sm">
                    — {current.fonte}
                  </p>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Depoimento anterior"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-fg-dim transition hover:border-flame hover:text-fg"
            >
              <ArrowIcon direction="left" />
            </button>

            <div className="flex gap-2">
              {reviews.map((review, i) => (
                <button
                  key={review.fonte + review.texto}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir para depoimento ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-2 w-2 rounded-full transition",
                    i === index ? "bg-flame" : "bg-white/20",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Próximo depoimento"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-fg-dim transition hover:border-flame hover:text-fg"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
