import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutPixPayment } from "@/components/checkout/CheckoutPixPayment";
import { PLANS } from "@/lib/plans";

const plano = PLANS.find((p) => p.id === "mensal-recorrente");
if (!plano) throw new Error("plano mensal-recorrente não encontrado");

const defaultProps = {
  plano,
  qrCodeBase64: "QR_BASE64_DATA",
  copiaECola: "00020126-copia-e-cola-completo",
};

describe("CheckoutPixPayment", () => {
  it("renderiza o QR code a partir do base64", () => {
    render(<CheckoutPixPayment {...defaultProps} />);
    const img = screen.getByRole("img", { name: /qr code/i });
    expect(img).toHaveAttribute("src", "data:image/png;base64,QR_BASE64_DATA");
  });

  it("mostra o valor do plano", () => {
    render(<CheckoutPixPayment {...defaultProps} />);
    expect(screen.getByText("R$ 125,00")).toBeInTheDocument();
  });

  it("mostra a instrução de como pagar", () => {
    render(<CheckoutPixPayment {...defaultProps} />);
    expect(
      screen.getByText(/abra o app do banco.*pix.*ler qr code/i),
    ).toBeInTheDocument();
  });

  it("o campo copia-e-cola tem um label acessível e mostra o código completo", () => {
    render(<CheckoutPixPayment {...defaultProps} />);
    const field = screen.getByLabelText(/pix copia e cola/i);
    expect(field).toHaveValue(defaultProps.copiaECola);
  });

  describe("botão copiar", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      writeTextMock.mockClear();
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } });
    });

    afterEach(() => {
      // @ts-expect-error -- limpeza do stub só de teste
      delete navigator.clipboard;
    });

    it("copia o código copia-e-cola para a área de transferência", async () => {
      render(<CheckoutPixPayment {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: /copiar código/i }));

      await vi.waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(defaultProps.copiaECola);
      });
    });

    it("anuncia sucesso (visível e para leitores de ecrã) depois de copiar", async () => {
      render(<CheckoutPixPayment {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: /copiar código/i }));

      expect(
        await screen.findByRole("button", { name: /copiado/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(/copiado/i);
    });
  });
});
