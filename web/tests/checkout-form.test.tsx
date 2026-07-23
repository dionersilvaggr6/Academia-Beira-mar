import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SITE } from "@/content/site";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CheckoutForm", () => {
  it("sem plano pré-selecionado, mostra o seletor de planos e desabilita o botão", () => {
    render(<CheckoutForm planoIdInicial={null} />);
    expect(screen.getByText("Escolha o plano")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar pedido" }),
    ).toBeDisabled();
  });

  it("com plano pré-selecionado válido, mostra o resumo do pedido e habilita o botão", () => {
    render(<CheckoutForm planoIdInicial="mensal-recorrente" />);
    expect(screen.getByText("Plano selecionado")).toBeInTheDocument();
    expect(screen.getByText("Mensal Recorrente")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirmar pedido" }),
    ).not.toBeDisabled();
  });

  it("plano inválido na URL cai de volta para o seletor de planos", () => {
    render(<CheckoutForm planoIdInicial="plano-fantasma" />);
    expect(screen.getByText("Escolha o plano")).toBeInTheDocument();
  });

  it("renderiza os campos nome/email/telefone e a forma de pagamento", () => {
    render(<CheckoutForm planoIdInicial="mensal-recorrente" />);
    expect(screen.getByPlaceholderText("Nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Telefone / WhatsApp"),
    ).toBeInTheDocument();
    expect(screen.getByText("Forma de pagamento")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Pix/i })).toBeChecked();
  });

  it("Boleto aparece desabilitado (sem gateway ligado ainda)", () => {
    render(<CheckoutForm planoIdInicial="mensal-recorrente" />);
    expect(screen.getByRole("radio", { name: /Boleto/i })).toBeDisabled();
  });

  it("mostra o link de suporte no WhatsApp, não como botão principal", () => {
    render(<CheckoutForm planoIdInicial="mensal-recorrente" />);
    const supportLink = screen.getByText(SITE.whatsappDisplay, {
      exact: false,
    });
    expect(supportLink.closest("a")).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("button", { name: "Confirmar pedido" }),
    ).toBeInTheDocument();
  });

  it("não mostra estado de erro ou sucesso antes de submeter", () => {
    render(<CheckoutForm planoIdInicial="mensal-recorrente" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
