import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { valuesMock, headersMock, getPaymentProviderMock, createCheckoutMock } =
  vi.hoisted(() => ({
    valuesMock: vi.fn().mockResolvedValue(undefined),
    headersMock: vi.fn(),
    getPaymentProviderMock: vi.fn(),
    createCheckoutMock: vi.fn(),
  }));

vi.mock("@/db/client", () => ({
  getDb: () => ({
    insert: () => ({ values: valuesMock }),
  }),
}));
// `headers()` exige um request store do Next.js que não existe em testes
// unitários — mesmo mock que `tests/convidar-pessoa.test.ts`.
vi.mock("next/headers", () => ({ headers: headersMock }));
// Mock parcial: preserva METODOS_PAGAMENTO/NotConfiguredProvider reais (o
// schema e o resto do módulo dependem deles) e só troca `getPaymentProvider`
// para controlar o resultado do gateway em cada teste.
vi.mock("@/lib/payments/provider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/payments/provider")>();
  return { ...actual, getPaymentProvider: getPaymentProviderMock };
});

import { iniciarPagamento } from "@/app/actions/checkout";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

function buildHeaders(map: Record<string, string> = {}) {
  return { get: (key: string) => map[key] ?? null };
}

const validOrder = {
  planoId: "mensal-recorrente",
  nome: "Ana Silva",
  email: "ana@example.com",
  telefone: "51999999999",
  metodo: "pix",
};

describe("iniciarPagamento", () => {
  beforeEach(() => {
    headersMock.mockReset();
    headersMock.mockResolvedValue(
      buildHeaders({
        host: "academiabeiramar.com.br",
        "x-forwarded-proto": "https",
      }),
    );
    createCheckoutMock.mockReset();
    createCheckoutMock.mockResolvedValue({ status: "unavailable" });
    getPaymentProviderMock.mockReset();
    getPaymentProviderMock.mockReturnValue({
      name: "test-provider",
      createCheckout: createCheckoutMock,
    });
  });

  afterEach(() => {
    valuesMock.mockClear();
    delete process.env.PAYMENT_PROVIDER;
  });

  it("com pedido válido grava o lead e devolve o aviso de pagamento indisponível", async () => {
    const r = await iniciarPagamento(null, fd(validOrder));

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.kind).toBe("pendente");
    if (r.kind !== "pendente") return;
    expect(r.mensagem).toContain("Mensal Recorrente");
    expect(r.whatsapp).toContain("wa.me");
  });

  it("grava o lead com nome, telefone, interesse e origem 'checkout'", async () => {
    await iniciarPagamento(null, fd(validOrder));

    expect(valuesMock).toHaveBeenCalledWith({
      nome: "Ana Silva",
      telefone: "51999999999",
      interesse: "Checkout: Mensal Recorrente (Pix)",
      origem: "checkout",
    });
  });

  it("rejeita plano que não existe em PLANS", async () => {
    const r = await iniciarPagamento(
      null,
      fd({ ...validOrder, planoId: "plano-fantasma" }),
    );
    expect(r.ok).toBe(false);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejeita dados de cliente inválidos (nome curto)", async () => {
    const r = await iniciarPagamento(null, fd({ ...validOrder, nome: "A" }));
    expect(r.ok).toBe(false);
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it("rejeita email inválido", async () => {
    const r = await iniciarPagamento(
      null,
      fd({ ...validOrder, email: "nao-e-email" }),
    );
    expect(r.ok).toBe(false);
  });

  it("rejeita telefone inválido", async () => {
    const r = await iniciarPagamento(
      null,
      fd({ ...validOrder, telefone: "abc" }),
    );
    expect(r.ok).toBe(false);
  });

  it("rejeita forma de pagamento fora da lista", async () => {
    const r = await iniciarPagamento(
      null,
      fd({ ...validOrder, metodo: "cripto" }),
    );
    expect(r.ok).toBe(false);
  });

  it("devolve kind 'pix' com os dados do QR code quando o provider aprova Pix", async () => {
    createCheckoutMock.mockResolvedValue({
      status: "pix",
      qrCodeBase64: "QR_B64",
      copiaECola: "00020126-copia-e-cola",
      paymentId: "123",
      ticketUrl: "https://mp.example/ticket/123",
      expiresAt: "2026-07-24T10:00:00.000-04:00",
    });

    const r = await iniciarPagamento(null, fd(validOrder));

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.kind).toBe("pix");
    if (r.kind !== "pix") return;
    expect(r.qrCodeBase64).toBe("QR_B64");
    expect(r.copiaECola).toBe("00020126-copia-e-cola");
    expect(r.paymentId).toBe("123");
    expect(r.ticketUrl).toBe("https://mp.example/ticket/123");
    expect(r.expiresAt).toBe("2026-07-24T10:00:00.000-04:00");
    // o lead continua sempre gravado, mesmo com gateway a devolver pix
    expect(valuesMock).toHaveBeenCalledTimes(1);
  });

  it("devolve kind 'redirect' com a url quando o provider devolve Checkout Pro", async () => {
    createCheckoutMock.mockResolvedValue({
      status: "redirect",
      url: "https://sandbox.mercadopago.com/checkout/abc",
    });

    const r = await iniciarPagamento(
      null,
      fd({ ...validOrder, metodo: "cartao" }),
    );

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.kind).toBe("redirect");
    if (r.kind !== "redirect") return;
    expect(r.url).toBe("https://sandbox.mercadopago.com/checkout/abc");
  });

  it("passa a origin resolvida a partir dos headers do pedido ao provider", async () => {
    await iniciarPagamento(null, fd(validOrder));

    expect(createCheckoutMock).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "https://academiabeiramar.com.br" }),
    );
  });

  it("se o provider lançar (falha de comunicação), cai para o aviso de pagamento indisponível em vez de quebrar", async () => {
    const gatewayError = new Error("timeout ao contactar o Mercado Pago");
    createCheckoutMock.mockRejectedValue(gatewayError);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const r = await iniciarPagamento(null, fd(validOrder));

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.kind).toBe("pendente");
    if (r.kind !== "pendente") return;
    expect(r.mensagem).toContain("Mensal Recorrente");
    // continua a gravar o lead antes da falha do gateway
    expect(valuesMock).toHaveBeenCalledTimes(1);

    // o log é seguro: nunca contém nome/email/telefone do cliente
    const logged = (errorSpy.mock.calls[0] ?? []).join(" ");
    expect(logged).not.toContain("Ana Silva");
    expect(logged).not.toContain("ana@example.com");
    expect(logged).not.toContain("51999999999");

    errorSpy.mockRestore();
  });
});
