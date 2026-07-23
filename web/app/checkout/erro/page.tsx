import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Pagamento não concluído — Academia Beira Mar",
};

/** Página de retorno do Checkout Pro (Mercado Pago) quando `back_urls.failure`
 * é acionado — pagamento recusado ou cancelado pelo cliente. */
export default function CheckoutErroPage() {
  return (
    <section className="px-4 py-24 md:py-28">
      <Container className="max-w-lg text-center">
        <h1 className="font-display text-3xl text-fg uppercase md:text-4xl">
          Pagamento não <span className="text-flame">concluído</span>
        </h1>
        <GlassCard className="mt-8">
          <p className="font-sans text-fg">
            Não foi possível concluir o pagamento. Nenhum valor foi cobrado —
            você pode tentar novamente ou falar com a gente pelo WhatsApp.
          </p>
          <Link
            href="/checkout"
            className="mt-6 block font-display text-flame uppercase hover:underline"
          >
            Tentar novamente
          </Link>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block font-sans text-flame text-sm"
          >
            Fale conosco no WhatsApp {SITE.whatsappDisplay}
          </a>
        </GlassCard>
      </Container>
    </section>
  );
}
