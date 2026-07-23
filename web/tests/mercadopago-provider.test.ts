import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted garante que os mocks existem antes de o vi.mock (içado) correr.
const { paymentCreateMock, preferenceCreateMock } = vi.hoisted(() => ({
  paymentCreateMock: vi.fn(),
  preferenceCreateMock: vi.fn(),
}));

// Nunca chama a API real do Mercado Pago nos testes — só a forma do pedido
// (body/requestOptions) e o mapeamento da resposta são verificados. As
// classes precisam de ser construíveis com `new` (arrow functions/objetos
// simples não servem como mock de uma `class`).
vi.mock("mercadopago", () => ({
  MercadoPagoConfig: vi.fn(function MockConfig() {}),
  Payment: vi.fn(function MockPayment() {
    return { create: paymentCreateMock };
  }),
  Preference: vi.fn(function MockPreference() {
    return { create: preferenceCreateMock };
  }),
}));

import {
  createPixPayment,
  createPreference,
  MercadoPagoProvider,
  splitNome,
  toTransactionAmount,
} from "@/lib/payments/mercadopago";
import { PLANS } from "@/lib/plans";

function findPlano(id: string) {
  const plano = PLANS.find((p) => p.id === id);
  if (!plano) throw new Error(`plano "${id}" não encontrado em PLANS`);
  return plano;
}

const cliente = {
  nome: "Ana Silva",
  email: "ana@example.com",
  telefone: "51999999999",
};
const origin = "https://academiabeiramar.com.br";

// Os mocks são partilhados por todo o ficheiro (vi.hoisted) — sem isto,
// `.mock.calls[0]` de um teste apanharia a chamada de um teste anterior.
beforeEach(() => {
  paymentCreateMock.mockClear();
  preferenceCreateMock.mockClear();
});

describe("toTransactionAmount", () => {
  it("devolve o valor já arredondado a 2 casas decimais", () => {
    expect(toTransactionAmount(125)).toBe(125);
    expect(toTransactionAmount(10.999)).toBe(11);
    expect(toTransactionAmount(10.1)).toBe(10.1);
  });
});

describe("splitNome", () => {
  it("nome com duas partes separa primeiro e último nome", () => {
    expect(splitNome("Ana Silva")).toEqual({
      firstName: "Ana",
      lastName: "Silva",
    });
  });

  it("nome com uma única palavra não inventa apelido", () => {
    expect(splitNome("Ana")).toEqual({
      firstName: "Ana",
      lastName: undefined,
    });
  });

  it("nome com várias palavras: primeiro nome + resto como apelido", () => {
    expect(splitNome("Ana Maria Silva Santos")).toEqual({
      firstName: "Ana",
      lastName: "Maria Silva Santos",
    });
  });

  it("ignora espaços extra nas pontas", () => {
    expect(splitNome("  Ana   Silva  ")).toEqual({
      firstName: "Ana",
      lastName: "Silva",
    });
  });
});

describe("createPixPayment", () => {
  it("cria o pagamento com o valor do plano, payer e payment_method_id pix", async () => {
    paymentCreateMock.mockResolvedValue({
      id: 123456789,
      date_of_expiration: "2026-07-24T10:00:00.000-04:00",
      point_of_interaction: {
        transaction_data: {
          qr_code_base64: "QR_BASE64_DATA",
          qr_code: "00020126580014BR.GOV.BCB.PIX...copia-e-cola",
          ticket_url: "https://mp.example/ticket/123",
        },
      },
    });

    const plano = findPlano("mensal-recorrente"); // preco 125, sem parcelas
    const order = { plano, metodo: "pix" as const, cliente, origin };

    await createPixPayment(order, {} as never);

    expect(paymentCreateMock).toHaveBeenCalledTimes(1);
    const call = paymentCreateMock.mock.calls[0]?.[0];
    expect(call.body.transaction_amount).toBe(125);
    expect(call.body.payment_method_id).toBe("pix");
    expect(call.body.payer.email).toBe("ana@example.com");
    expect(call.body.payer.first_name).toBe("Ana");
    expect(call.body.payer.last_name).toBe("Silva");
  });

  it("usa plano.preco (não preco × parcelas) num plano parcelado", async () => {
    paymentCreateMock.mockResolvedValue({
      id: 1,
      point_of_interaction: {
        transaction_data: { qr_code_base64: "x", qr_code: "y" },
      },
    });

    const plano = findPlano("trimestral"); // preco 125, parcelas 3
    const order = { plano, metodo: "pix" as const, cliente, origin };

    await createPixPayment(order, {} as never);

    const call = paymentCreateMock.mock.calls[0]?.[0];
    // 125, não 375 (125 × 3) — Pix é uma cobrança única, ver comentário no
    // código-fonte sobre a escolha (o número bate com o que o precoLabel
    // mostra em destaque, não com o total do plano).
    expect(call.body.transaction_amount).toBe(125);
  });

  it("define uma X-Idempotency-Key não vazia no pedido", async () => {
    paymentCreateMock.mockResolvedValue({
      id: 1,
      point_of_interaction: {
        transaction_data: { qr_code_base64: "x", qr_code: "y" },
      },
    });

    const plano = findPlano("mensal-recorrente");
    await createPixPayment(
      { plano, metodo: "pix" as const, cliente, origin },
      {} as never,
    );

    const call = paymentCreateMock.mock.calls[0]?.[0];
    expect(typeof call.requestOptions.idempotencyKey).toBe("string");
    expect(call.requestOptions.idempotencyKey.length).toBeGreaterThan(0);
  });

  it("devolve os dados do QR code a partir da resposta da API", async () => {
    paymentCreateMock.mockResolvedValue({
      id: 123456789,
      date_of_expiration: "2026-07-24T10:00:00.000-04:00",
      point_of_interaction: {
        transaction_data: {
          qr_code_base64: "QR_BASE64_DATA",
          qr_code: "00020126-copia-e-cola",
          ticket_url: "https://mp.example/ticket/123",
        },
      },
    });

    const plano = findPlano("mensal-recorrente");
    const result = await createPixPayment(
      { plano, metodo: "pix" as const, cliente, origin },
      {} as never,
    );

    expect(result).toEqual({
      status: "pix",
      qrCodeBase64: "QR_BASE64_DATA",
      copiaECola: "00020126-copia-e-cola",
      paymentId: "123456789",
      ticketUrl: "https://mp.example/ticket/123",
      expiresAt: "2026-07-24T10:00:00.000-04:00",
    });
  });

  it("lança um erro claro se a API não devolver dados de QR code", async () => {
    paymentCreateMock.mockResolvedValue({ id: 1 }); // sem point_of_interaction

    const plano = findPlano("mensal-recorrente");
    await expect(
      createPixPayment(
        { plano, metodo: "pix" as const, cliente, origin },
        {} as never,
      ),
    ).rejects.toThrow(/qr code/i);
  });
});

describe("createPreference", () => {
  it("cria a preference com o nome do plano e o valor unitário", async () => {
    preferenceCreateMock.mockResolvedValue({
      id: "pref-1",
      init_point: "https://www.mercadopago.com/checkout/prod",
      sandbox_init_point: "https://sandbox.mercadopago.com/checkout/test",
    });

    const plano = findPlano("mensal-recorrente"); // preco 125
    await createPreference(
      { plano, metodo: "cartao" as const, cliente, origin },
      {} as never,
    );

    const call = preferenceCreateMock.mock.calls[0]?.[0];
    expect(call.body.items).toHaveLength(1);
    expect(call.body.items[0].title).toContain(plano.nome);
    expect(call.body.items[0].unit_price).toBe(125);
    expect(call.body.items[0].quantity).toBe(1);
  });

  it("usa plano.preco (não preco × parcelas) num plano parcelado", async () => {
    preferenceCreateMock.mockResolvedValue({
      id: "pref-2",
      sandbox_init_point: "https://sandbox.mercadopago.com/checkout/test",
    });

    const plano = findPlano("anual-parcelado"); // preco 99, parcelas 12
    await createPreference(
      { plano, metodo: "cartao" as const, cliente, origin },
      {} as never,
    );

    const call = preferenceCreateMock.mock.calls[0]?.[0];
    expect(call.body.items[0].unit_price).toBe(99);
  });

  it("define back_urls absolutos a partir de order.origin, com auto_return approved", async () => {
    preferenceCreateMock.mockResolvedValue({
      id: "pref-3",
      sandbox_init_point: "https://sandbox.mercadopago.com/checkout/test",
    });

    const plano = findPlano("mensal-recorrente");
    await createPreference(
      { plano, metodo: "cartao" as const, cliente, origin },
      {} as never,
    );

    const call = preferenceCreateMock.mock.calls[0]?.[0];
    expect(call.body.back_urls.success).toBe(
      "https://academiabeiramar.com.br/checkout/sucesso",
    );
    expect(call.body.back_urls.failure).toBe(
      "https://academiabeiramar.com.br/checkout/erro",
    );
    expect(call.body.auto_return).toBe("approved");
  });

  it("define uma X-Idempotency-Key não vazia no pedido", async () => {
    preferenceCreateMock.mockResolvedValue({
      id: "pref-4",
      sandbox_init_point: "https://sandbox.mercadopago.com/checkout/test",
    });

    const plano = findPlano("mensal-recorrente");
    await createPreference(
      { plano, metodo: "cartao" as const, cliente, origin },
      {} as never,
    );

    const call = preferenceCreateMock.mock.calls[0]?.[0];
    expect(typeof call.requestOptions.idempotencyKey).toBe("string");
    expect(call.requestOptions.idempotencyKey.length).toBeGreaterThan(0);
  });

  it("devolve o sandbox_init_point (modo teste) como url de redirect", async () => {
    preferenceCreateMock.mockResolvedValue({
      id: "pref-5",
      init_point: "https://www.mercadopago.com/checkout/prod",
      sandbox_init_point: "https://sandbox.mercadopago.com/checkout/test",
    });

    const plano = findPlano("mensal-recorrente");
    const result = await createPreference(
      { plano, metodo: "cartao" as const, cliente, origin },
      {} as never,
    );

    expect(result).toEqual({
      status: "redirect",
      url: "https://sandbox.mercadopago.com/checkout/test",
    });
  });

  it("lança um erro claro se a API não devolver nenhum init_point", async () => {
    preferenceCreateMock.mockResolvedValue({ id: "pref-6" });

    const plano = findPlano("mensal-recorrente");
    await expect(
      createPreference(
        { plano, metodo: "cartao" as const, cliente, origin },
        {} as never,
      ),
    ).rejects.toThrow(/init_point/i);
  });
});

describe("MercadoPagoProvider", () => {
  it("expõe name 'mercadopago'", () => {
    const provider = new MercadoPagoProvider("TEST-token");
    expect(provider.name).toBe("mercadopago");
  });

  it("metodo 'pix' delega no pagamento Pix (Payment.create)", async () => {
    paymentCreateMock.mockResolvedValue({
      id: 1,
      point_of_interaction: {
        transaction_data: { qr_code_base64: "x", qr_code: "y" },
      },
    });

    const plano = findPlano("mensal-recorrente");
    const provider = new MercadoPagoProvider("TEST-token");
    const result = await provider.createCheckout({
      plano,
      metodo: "pix",
      cliente,
      origin,
    });

    expect(paymentCreateMock).toHaveBeenCalledTimes(1);
    expect(preferenceCreateMock).not.toHaveBeenCalled();
    expect(result.status).toBe("pix");
  });

  it("metodo 'cartao' delega na preference (Preference.create)", async () => {
    preferenceCreateMock.mockResolvedValue({
      id: "p",
      sandbox_init_point: "https://sandbox.mercadopago.com/x",
    });

    const plano = findPlano("mensal-recorrente");
    const provider = new MercadoPagoProvider("TEST-token");
    const result = await provider.createCheckout({
      plano,
      metodo: "cartao",
      cliente,
      origin,
    });

    expect(preferenceCreateMock).toHaveBeenCalledTimes(1);
    expect(paymentCreateMock).not.toHaveBeenCalled();
    expect(result.status).toBe("redirect");
  });

  it("metodo 'boleto' também delega na preference (Checkout Pro trata o resto)", async () => {
    preferenceCreateMock.mockResolvedValue({
      id: "p",
      sandbox_init_point: "https://sandbox.mercadopago.com/x",
    });

    const plano = findPlano("mensal-recorrente");
    const provider = new MercadoPagoProvider("TEST-token");
    await provider.createCheckout({
      plano,
      metodo: "boleto",
      cliente,
      origin,
    });

    expect(preferenceCreateMock).toHaveBeenCalledTimes(1);
    expect(paymentCreateMock).not.toHaveBeenCalled();
  });
});
