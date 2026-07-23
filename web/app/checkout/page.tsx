import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Checkout — Academia Beira Mar" };

// Lê `searchParams` (plano pré-selecionado) — nunca pré-renderizada no
// build, igual a /login e /definir-senha.
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;

  return (
    <section className="px-4 py-24 md:py-28">
      <Container className="max-w-lg">
        <h1 className="text-center font-display text-3xl text-fg uppercase md:text-4xl">
          Finalizar <span className="text-flame">matrícula</span>
        </h1>
        <p className="mt-3 text-center font-sans text-fg-dim text-sm">
          Preencha seus dados — nossa equipe confirma o pagamento com você.
        </p>
        <CheckoutForm planoIdInicial={plano ?? null} />
      </Container>
    </section>
  );
}
