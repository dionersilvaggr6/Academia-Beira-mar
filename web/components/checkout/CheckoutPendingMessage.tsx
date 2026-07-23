import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Estado de sucesso quando o gateway ainda não está configurado (ou devolve
 * um pagamento pendente): o pedido já foi gravado como lead, então isto só
 * confirma ao cliente e deixa o WhatsApp como canal de suporte.
 */
export function CheckoutPendingMessage({
  mensagem,
  whatsapp,
}: {
  mensagem: string;
  whatsapp: string;
}) {
  return (
    <GlassCard className="mt-8 text-center">
      <p role="status" aria-live="polite" className="font-sans text-fg">
        {mensagem}
      </p>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block font-sans text-flame text-sm"
      >
        Dúvidas? Fale conosco no WhatsApp
      </a>
    </GlassCard>
  );
}
