import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyMercadoPagoWebhook } from "@/lib/payments/mercadopago-webhook";

const SECRET = "test-webhook-secret";

/** Constrói um header `x-signature` válido, do mesmo jeito que o Mercado
 * Pago assina de verdade — usado para gerar fixtures de teste, não é lógica
 * de produção (essa vive só dentro do SDK `mercadopago`). */
function sign(params: {
  dataId: string;
  requestId: string;
  ts: string;
  secret: string;
}): string {
  const manifest = `id:${params.dataId};request-id:${params.requestId};ts:${params.ts};`;
  const hash = createHmac("sha256", params.secret)
    .update(manifest)
    .digest("hex");
  return `ts=${params.ts},v1=${hash}`;
}

describe("verifyMercadoPagoWebhook", () => {
  it("aceita uma assinatura corretamente calculada", () => {
    const xSignature = sign({
      dataId: "123456",
      requestId: "req-1",
      ts: "1700000000",
      secret: SECRET,
    });

    const result = verifyMercadoPagoWebhook({
      xSignature,
      xRequestId: "req-1",
      dataId: "123456",
      secret: SECRET,
    });

    expect(result).toEqual({ valid: true });
  });

  it("rejeita quando falta o header x-signature", () => {
    const result = verifyMercadoPagoWebhook({
      xSignature: null,
      xRequestId: "req-1",
      dataId: "123456",
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });

  it("rejeita quando MP_WEBHOOK_SECRET não está configurado", () => {
    const xSignature = sign({
      dataId: "123456",
      requestId: "req-1",
      ts: "1700000000",
      secret: SECRET,
    });

    const result = verifyMercadoPagoWebhook({
      xSignature,
      xRequestId: "req-1",
      dataId: "123456",
      secret: undefined,
    });

    expect(result.valid).toBe(false);
  });

  it("rejeita quando o segredo usado para assinar está errado (forjado)", () => {
    const xSignature = sign({
      dataId: "123456",
      requestId: "req-1",
      ts: "1700000000",
      secret: "segredo-errado",
    });

    const result = verifyMercadoPagoWebhook({
      xSignature,
      xRequestId: "req-1",
      dataId: "123456",
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });

  it("rejeita quando o data.id foi adulterado depois de assinado", () => {
    // Assinado para o pagamento "123456" — um atacante troca o data.id na
    // query string para apontar a outro pagamento (ex.: um já aprovado).
    const xSignature = sign({
      dataId: "123456",
      requestId: "req-1",
      ts: "1700000000",
      secret: SECRET,
    });

    const result = verifyMercadoPagoWebhook({
      xSignature,
      xRequestId: "req-1",
      dataId: "999999",
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });

  it("rejeita quando o x-request-id foi adulterado depois de assinado", () => {
    const xSignature = sign({
      dataId: "123456",
      requestId: "req-1",
      ts: "1700000000",
      secret: SECRET,
    });

    const result = verifyMercadoPagoWebhook({
      xSignature,
      xRequestId: "req-adulterado",
      dataId: "123456",
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });

  it("rejeita um header x-signature malformado", () => {
    const result = verifyMercadoPagoWebhook({
      xSignature: "isto-nao-e-um-header-valido",
      xRequestId: "req-1",
      dataId: "123456",
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });
});
