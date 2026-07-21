"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
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
          className="grid gap-10 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] md:gap-16"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-3xl text-fg uppercase leading-[1.05] md:text-5xl"
          >
            Porquê o<br />
            <span className="text-flame">Beira Mar</span>
          </motion.h2>

          <motion.ul
            variants={stagger}
            className="grid gap-x-10 sm:grid-cols-2"
          >
            {SITE.diferenciais.map((item) => (
              <motion.li
                key={item}
                variants={fadeUp}
                className="flex items-center gap-3 border-white/10 border-t py-4 last:border-b sm:last:border-b-0"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-flame"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
                <span className="font-sans font-medium text-fg">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </Container>
    </section>
  );
}
