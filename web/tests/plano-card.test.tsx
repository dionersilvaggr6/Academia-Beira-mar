import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanoCard } from "@/components/ui/PlanoCard";
import { PLANS } from "@/lib/plans";

function getPlano(id: string) {
  const plano = PLANS.find((p) => p.id === id);
  if (!plano) throw new Error(`plano de teste "${id}" não encontrado`);
  return plano;
}

describe("PlanoCard", () => {
  it("o CTA leva ao checkout com o plano pré-selecionado, não mais ao WhatsApp", () => {
    const plano = getPlano("mensal-recorrente");
    render(<PlanoCard plano={plano} />);

    const cta = screen.getByRole("link", { name: /Quero o plano/i });
    expect(cta).toHaveAttribute("href", `/checkout?plano=${plano.id}`);
    expect(cta.getAttribute("href")).not.toContain("wa.me");
    expect(cta).not.toHaveAttribute("target");
  });

  it("mostra nome, preço formatado e forma de pagamento", () => {
    const plano = getPlano("trimestral");
    render(<PlanoCard plano={plano} />);

    expect(screen.getByText(plano.nome)).toBeInTheDocument();
    expect(screen.getByText("3× de R$ 125,00")).toBeInTheDocument();
    expect(screen.getByText(plano.forma)).toBeInTheDocument();
  });

  it("mostra o badge MELHOR OFERTA só no plano em destaque", () => {
    const destaque = getPlano("anual-vista");
    const normal = getPlano("mensal");

    const { unmount } = render(<PlanoCard plano={destaque} />);
    expect(screen.getByText("MELHOR OFERTA")).toBeInTheDocument();
    unmount();

    render(<PlanoCard plano={normal} />);
    expect(screen.queryByText("MELHOR OFERTA")).not.toBeInTheDocument();
  });
});
