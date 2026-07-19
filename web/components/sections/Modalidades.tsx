import { SectionTitle } from "@/components/ui/SectionTitle";

const MODALIDADES = [
  {
    icon: "🏋️",
    nome: "Musculação",
    desc: "Musculação livre com aparelhos novos e completos.",
  },
  {
    icon: "🧘",
    nome: "Pilates",
    desc: "Força, mobilidade e postura em aulas guiadas.",
  },
  {
    icon: "🤸",
    nome: "Funcional",
    desc: "Treino funcional para condicionamento e energia.",
  },
];

export function Modalidades() {
  return (
    <section id="modalidades" className="mx-auto max-w-6xl px-4 py-20">
      <SectionTitle>Modalidades</SectionTitle>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {MODALIDADES.map((m) => (
          <div
            key={m.nome}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
          >
            <div className="text-4xl">{m.icon}</div>
            <h3 className="mt-3 font-bold text-bm-cream text-xl">{m.nome}</h3>
            <p className="mt-2 text-bm-cream/70">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
