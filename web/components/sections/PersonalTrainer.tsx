import { waLink } from "@/lib/whatsapp";

export function PersonalTrainer() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 rounded-3xl border border-bm-orange/40 bg-bm-orange/10 p-10 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="font-extrabold text-2xl text-bm-cream uppercase md:text-3xl">
            Personal Trainer
          </h2>
          <p className="mt-2 max-w-xl text-bm-cream/80">
            Acompanhamento individual para treinar com técnica, segurança e
            resultados mais rápidos.
          </p>
        </div>
        <a
          href={waLink({ plano: "Personal Trainer" })}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-bm-orange px-6 py-3 font-bold text-bm-black transition hover:brightness-110"
        >
          Quero um personal
        </a>
      </div>
    </section>
  );
}
