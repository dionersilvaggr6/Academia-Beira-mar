"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";
import { fadeUp, stagger } from "@/lib/motion";

export function Diferenciais() {
  return (
    <section id="diferenciais" className="py-20 md:py-28">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-center font-display text-3xl text-fg uppercase md:text-4xl"
          >
            Porquê o Beira Mar
          </motion.h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SITE.diferenciais.map((item) => (
              <motion.div key={item} variants={fadeUp}>
                <GlassCard className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flame/15 text-flame"
                  >
                    ✓
                  </span>
                  <span className="font-sans font-medium text-fg">{item}</span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
