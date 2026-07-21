"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { MODALIDADE_IMG } from "@/lib/images";
import { fadeUp, stagger } from "@/lib/motion";

type Modalidade = {
  slug: string;
  nome: string;
  desc: string;
};

const MODALIDADES: readonly Modalidade[] = [
  {
    slug: "musculacao",
    nome: "Musculação",
    desc: "Aparelhos novos e completos para todos os níveis, do primeiro treino à evolução avançada.",
  },
  {
    slug: "pilates",
    nome: "Pilates",
    desc: "Aulas guiadas que trabalham força, mobilidade e postura num ambiente climatizado.",
  },
  {
    slug: "funcional",
    nome: "Funcional",
    desc: "Treinos dinâmicos que elevam o condicionamento físico e a energia do dia a dia.",
  },
];

export function Modalidades() {
  return (
    <section id="modalidades" className="py-12 md:py-28">
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
            Modalidades
          </motion.h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {MODALIDADES.map((m) => (
              <motion.article
                key={m.slug}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-2 via-surface to-ink transition-colors duration-300 hover:border-flame/50"
              >
                <Image
                  src={MODALIDADE_IMG[m.slug] ?? ""}
                  alt={`Treino de ${m.nome} na Academia Beira Mar`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-fg text-xl uppercase">
                    {m.nome}
                  </h3>
                  <p className="mt-2 font-sans text-fg-dim text-sm">{m.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
