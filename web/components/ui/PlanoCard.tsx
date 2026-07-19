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
    <div className="flex flex-col rounded-xl border border-bm-orange/25 bg-bm-orange/[0.04] p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-bm-orange/40">
      {plano.destaque && (
        <span className="mb-1.5 w-fit rounded-full bg-bm-orange px-2 py-0.5 font-bold text-[10px] text-bm-black">
          MELHOR OFERTA
        </span>
      )}
      <h3 className="font-bold text-base text-bm-cream">{plano.nome}</h3>
      <p className="mt-1 font-extrabold text-bm-orange text-xl">
        {precoLabel(plano)}
      </p>
      <p className="text-bm-cream/50 text-xs">{plano.forma}</p>
      <a
        href={waLink({ plano: plano.nome })}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Quero o plano ${plano.nome} — falar no WhatsApp`}
        className="mt-3 inline-block rounded-lg border border-bm-orange-light/50 bg-bm-orange-light/80 px-3 py-1.5 text-center font-semibold text-bm-black text-sm backdrop-blur-md transition hover:bg-bm-orange-light"
      >
        EU QUERO
      </a>
    </div>
  );
}
