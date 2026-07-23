import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { precoLabel } from "@/lib/plans";
import type { Plano } from "@/lib/plans.schema";
import { cn } from "@/lib/ui/cn";

export function PlanoCard({ plano }: { plano: Plano }) {
  return (
    <GlassCard
      padding="p-2.5 md:p-6"
      className={cn(
        "flex h-full flex-col transition hover:-translate-y-1",
        plano.destaque && "border-flame/50 shadow-[0_0_28px_var(--flame-glow)]",
      )}
    >
      {plano.destaque && (
        <Badge className="mb-1 w-fit border-flame/40 bg-flame px-2 py-0.5 font-bold text-[9px] text-ink md:mb-2 md:px-3 md:py-1 md:text-[10px]">
          MELHOR OFERTA
        </Badge>
      )}
      <h3 className="font-display text-fg text-xs uppercase leading-tight md:text-lg">
        {plano.nome}
      </h3>
      <p className="mt-0.5 font-display text-flame text-base leading-tight md:mt-1 md:text-2xl">
        {precoLabel(plano)}
      </p>
      <p className="text-[10px] text-fg-dim md:text-xs">{plano.forma}</p>
      {/*
       * Fluxo de venda: leva ao checkout próprio (captura o pedido mesmo
       * sem gateway ligado ainda), não mais direto ao WhatsApp — ver
       * app/checkout/page.tsx. O WhatsApp continua disponível como suporte
       * (FAB flutuante + "dúvidas? fale conosco" no fim do checkout).
       */}
      <ButtonLink
        href={`/checkout?plano=${plano.id}`}
        aria-label={`Quero o plano ${plano.nome}`}
        size="compact"
        className="mt-2 w-full md:mt-4 md:w-auto"
      >
        Eu quero
      </ButtonLink>
    </GlassCard>
  );
}
