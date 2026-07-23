import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SITE } from "@/content/site";

const { iniciarPagamentoMock } = vi.hoisted(() => ({
  iniciarPagamentoMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/app/actions/checkout", () => ({
  iniciarPagamento: iniciarPagamentoMock,
}));

function preencherCamposObrigatorios() {
  fireEvent.change(screen.getByPlaceholderText("Nome completo"), {
    target: { value: "Ana Silva" },
  });
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "ana@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Telefone / WhatsApp"), {
    target: { value: "51999999999" },
  });
}

describe("CheckoutForm", () => {
  beforeEach(() => {
    iniciarPagamentoMock.mockReset();
  });

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

  it("quando o gateway devolve pix, mostra o QR code inline em vez do formulário", async () => {
    iniciarPagamentoMock.mockResolvedValue({
      ok: true,
      kind: "pix",
      qrCodeBase64: "QR_BASE64_DATA",
      copiaECola: "00020126-copia-e-cola",
      paymentId: "123",
    });

    const { container } = render(
      <CheckoutForm planoIdInicial="mensal-recorrente" />,
    );
    preencherCamposObrigatorios();
    // React 19 intercepta o `submit` do <form action={fn}> via listener
    // próprio; um clique sintético no botão em jsdom nem sempre percorre o
    // mesmo caminho que num browser real, por isso disparamos o evento
    // `submit` diretamente no form (equivalente a `form.requestSubmit()`).
    const form = container.querySelector("form");
    if (!form) throw new Error("formulário não encontrado");
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(iniciarPagamentoMock).toHaveBeenCalled();
    });

    expect(
      await screen.findByRole("img", { name: /qr code/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/pix copia e cola/i)).toHaveValue(
      "00020126-copia-e-cola",
    );
    // o formulário original (campos/seletor) deixa de estar no ecrã
    expect(
      screen.queryByPlaceholderText("Nome completo"),
    ).not.toBeInTheDocument();
  });
});
