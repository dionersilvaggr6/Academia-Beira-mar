import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Plano } from "@/lib/plans.schema";
import { cn } from "@/lib/ui/cn";
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
    <GlassCard
      className={cn(
        "flex h-full flex-col transition hover:-translate-y-1",
        plano.destaque && "border-flame/50 shadow-[0_0_28px_var(--flame-glow)]",
      )}
    >
      {plano.destaque && (
        <Badge className="mb-2 w-fit border-flame/40 bg-flame font-bold text-[10px] text-ink">
          MELHOR OFERTA
        </Badge>
      )}
      <h3 className="font-display text-fg text-lg uppercase">{plano.nome}</h3>
      <p className="mt-1 font-display text-2xl text-flame">
        {precoLabel(plano)}
      </p>
      <p className="text-fg-dim text-xs">{plano.forma}</p>
      <ButtonLink
        href={waLink({ plano: plano.nome })}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Quero o plano ${plano.nome} — falar no WhatsApp`}
        className="mt-4 px-3 py-2 text-sm"
      >
        Eu quero
      </ButtonLink>
    </GlassCard>
  );
}
