import { afterEach, describe, expect, it } from "vitest";
import { MercadoPagoProvider } from "@/lib/payments/mercadopago";
import {
  getPaymentProvider,
  NotConfiguredProvider,
} from "@/lib/payments/provider";
import { PLANS } from "@/lib/plans";

describe("NotConfiguredProvider", () => {
  it("devolve status 'unavailable' — nenhum gateway está ligado ainda", async () => {
    const provider = new NotConfiguredProvider();
    const plano = PLANS[0];
    if (!plano) throw new Error("PLANS está vazio");

    const result = await provider.createCheckout({
      plano,
      metodo: "pix",
      cliente: {
        nome: "Ana",
        email: "ana@example.com",
        telefone: "51999999999",
      },
      origin: "http://localhost:3000",
    });

    expect(result).toEqual({ status: "unavailable" });
  });
});

describe("getPaymentProvider", () => {
  const originalProvider = process.env.PAYMENT_PROVIDER;
  const originalToken = process.env.MP_ACCESS_TOKEN;

  afterEach(() => {
    if (originalProvider === undefined) delete process.env.PAYMENT_PROVIDER;
    else process.env.PAYMENT_PROVIDER = originalProvider;
    if (originalToken === undefined) delete process.env.MP_ACCESS_TOKEN;
    else process.env.MP_ACCESS_TOKEN = originalToken;
  });

  it("devolve NotConfiguredProvider quando a env não está definida", () => {
    delete process.env.PAYMENT_PROVIDER;
    expect(getPaymentProvider()).toBeInstanceOf(NotConfiguredProvider);
  });

  it("devolve NotConfiguredProvider para um valor de gateway desconhecido", () => {
    process.env.PAYMENT_PROVIDER = "gateway-que-nao-existe";
    expect(getPaymentProvider()).toBeInstanceOf(NotConfiguredProvider);
  });

  it("PAYMENT_PROVIDER=mercadopago sem MP_ACCESS_TOKEN cai para NotConfiguredProvider (nunca lança)", () => {
    process.env.PAYMENT_PROVIDER = "mercadopago";
    delete process.env.MP_ACCESS_TOKEN;
    expect(getPaymentProvider()).toBeInstanceOf(NotConfiguredProvider);
  });

  it("PAYMENT_PROVIDER=mercadopago com MP_ACCESS_TOKEN devolve o MercadoPagoProvider", () => {
    process.env.PAYMENT_PROVIDER = "mercadopago";
    process.env.MP_ACCESS_TOKEN = "TEST-fake-token";
    expect(getPaymentProvider()).toBeInstanceOf(MercadoPagoProvider);
  });
});
