"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { PlanoCard } from "@/components/ui/PlanoCard";
import { fadeUp, stagger } from "@/lib/motion";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/ui/cn";

type FormaPagamento = "avulso" | "recorrente";

const TABS: ReadonlyArray<{ value: FormaPagamento; label: string }> = [
  { value: "avulso", label: "Avulso" },
  { value: "recorrente", label: "Recorrente" },
];

export function Planos() {
  const [forma, setForma] = useState<FormaPagamento>("recorrente");

  const planos = useMemo(
    () =>
      PLANS.filter((p) =>
        forma === "avulso" ? p.forma === "avulso" : p.forma !== "avulso",
      ),
    [forma],
  );

  return (
    <section id="planos" className="py-12 md:py-28">
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
            Nossos Planos
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-center font-sans text-fg-dim"
          >
            Musculação livre — escolha o seu e comece hoje.
          </motion.p>

          <motion.div
            variants={fadeUp}
            role="group"
            aria-label="Forma de pagamento"
            className="mx-auto mt-8 flex w-fit gap-1 rounded-full border border-white/10 bg-white/5 p-1"
          >
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-pressed={forma === tab.value}
                onClick={() => setForma(tab.value)}
                className={cn(
                  "rounded-full px-5 py-2 font-sans font-semibold text-sm transition",
                  forma === tab.value
                    ? "bg-flame text-ink"
                    : "text-fg-dim hover:text-fg",
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          <motion.div
            key={forma}
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mt-8 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:mt-10 sm:gap-4 lg:grid-cols-3"
          >
            {planos.map((plano) => (
              <motion.div key={plano.id} variants={fadeUp}>
                <PlanoCard plano={plano} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
