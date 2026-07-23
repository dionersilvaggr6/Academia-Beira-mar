import { afterEach, describe, expect, it } from "vitest";
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
    });

    expect(result).toEqual({ status: "unavailable" });
  });
});

describe("getPaymentProvider", () => {
  const originalEnv = process.env.PAYMENT_PROVIDER;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.PAYMENT_PROVIDER;
    else process.env.PAYMENT_PROVIDER = originalEnv;
  });

  it("devolve NotConfiguredProvider quando a env não está definida", () => {
    delete process.env.PAYMENT_PROVIDER;
    expect(getPaymentProvider()).toBeInstanceOf(NotConfiguredProvider);
  });

  it("devolve NotConfiguredProvider para um valor de gateway desconhecido", () => {
    process.env.PAYMENT_PROVIDER = "gateway-que-nao-existe";
    expect(getPaymentProvider()).toBeInstanceOf(NotConfiguredProvider);
  });
});
