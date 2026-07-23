import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

export const metadata = { title: "Pagamento recebido — Academia Beira Mar" };

/**
 * Página de retorno do Checkout Pro (Mercado Pago) — `back_urls.success` e
 * `back_urls.pending` apontam as duas para aqui (ver
 * `lib/payments/mercadopago.ts`: pendente não é erro).
 *
 * Os parâmetros que o Mercado Pago acrescenta na URL de retorno
 * (`status`, `payment_id`, ...) vêm do browser do cliente e NUNCA são
 * prova de pagamento — por isso a mensagem fica propositadamente neutra.
 * A confirmação real acontece no webhook
 * (`app/api/webhooks/mercadopago/route.ts`), que consulta a API do
 * Mercado Pago diretamente em vez de confiar nesta URL.
 */
export default function CheckoutSucessoPage() {
  return (
    <section className="px-4 py-24 md:py-28">
      <Container className="max-w-lg text-center">
        <h1 className="font-display text-3xl text-fg uppercase md:text-4xl">
          Recebemos seu <span className="text-flame">pagamento</span>
        </h1>
        <GlassCard className="mt-8">
          <p className="font-sans text-fg">
            Obrigado! Assim que a confirmação chegar, nossa equipe entra em
            contato para finalizar sua matrícula.
          </p>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block font-sans text-flame text-sm"
          >
            Dúvidas? Fale conosco no WhatsApp {SITE.whatsappDisplay}
          </a>
        </GlassCard>
      </Container>
    </section>
  );
}
