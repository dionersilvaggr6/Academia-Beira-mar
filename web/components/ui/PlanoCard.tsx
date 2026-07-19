import type { Plano } from "@/lib/plans.schema";
import { waLink } from "@/lib/whatsapp";

function precoLabel(p: Plano): string {
  const val = p.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return p.parcelas ? `${p.parcelas}× de ${val}` : val;
}

export function PlanoCard({ plano }: { plano: Plano }) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 transition hover:-translate-y-1 ${
        plano.destaque
          ? "border-bm-orange bg-bm-orange/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      {plano.destaque && (
        <span className="mb-2 w-fit rounded-full bg-bm-orange px-2 py-0.5 text-xs font-bold text-bm-black">
          MELHOR OFERTA
        </span>
      )}
      <h3 className="text-lg font-bold text-bm-cream">{plano.nome}</h3>
      <p className="mt-2 font-extrabold text-2xl text-bm-orange">
        {precoLabel(plano)}
      </p>
      <p className="text-bm-cream/60 text-sm">{plano.forma}</p>
      <a
        href={waLink({ plano: plano.nome })}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-lg bg-bm-orange px-4 py-2 text-center font-semibold text-bm-black transition hover:brightness-110"
      >
        EU QUERO
      </a>
    </div>
  );
}
