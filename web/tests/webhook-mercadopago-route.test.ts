import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getPaymentByIdMock } = vi.hoisted(() => ({
  getPaymentByIdMock: vi.fn(),
}));

vi.mock("@/lib/payments/mercadopago", () => ({
  getPaymentById: getPaymentByIdMock,
}));

import { POST } from "@/app/api/webhooks/mercadopago/route";

const SECRET = "test-webhook-secret";
const TOKEN = "TEST-fake-access-token";

function sign(dataId: string, requestId: string, ts: string): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hash = createHmac("sha256", SECRET).update(manifest).digest("hex");
  return `ts=${ts},v1=${hash}`;
}

function buildRequest(opts: {
  dataId?: string;
  type?: string;
  xSignature?: string | null;
  xRequestId?: string | null;
}) {
  const { dataId = "123456", type = "payment" } = opts;
  const url = `http://localhost/api/webhooks/mercadopago?data.id=${dataId}&type=${type}`;
  const headers: Record<string, string> = {};
  const xRequestId = opts.xRequestId === undefined ? "req-1" : opts.xRequestId;
  const xSignature =
    opts.xSignature === undefined
      ? sign(dataId, "req-1", "1700000000")
      : opts.xSignature;
  if (xRequestId !== null) headers["x-request-id"] = xRequestId;
  if (xSignature !== null) headers["x-signature"] = xSignature;

  return new NextRequest(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      action: "payment.created",
      data: { id: dataId },
      type,
    }),
  });
}

describe("POST /api/webhooks/mercadopago", () => {
  const originalSecret = process.env.MP_WEBHOOK_SECRET;
  const originalToken = process.env.MP_ACCESS_TOKEN;

  beforeEach(() => {
    process.env.MP_WEBHOOK_SECRET = SECRET;
    process.env.MP_ACCESS_TOKEN = TOKEN;
    getPaymentByIdMock.mockReset();
    getPaymentByIdMock.mockResolvedValue({
      id: 123456,
      status: "approved",
    });
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.MP_WEBHOOK_SECRET;
    else process.env.MP_WEBHOOK_SECRET = originalSecret;
    if (originalToken === undefined) delete process.env.MP_ACCESS_TOKEN;
    else process.env.MP_ACCESS_TOKEN = originalToken;
  });

  it("sem x-signature responde 401 e nunca consulta a API", async () => {
    const req = buildRequest({ xSignature: null });

    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(getPaymentByIdMock).not.toHaveBeenCalled();
  });

  it("assinatura calculada com segredo errado responde 401", async () => {
    const badSignature = `ts=1700000000,v1=${createHmac("sha256", "segredo-errado").update("id:123456;request-id:req-1;ts:1700000000;").digest("hex")}`;
    const req = buildRequest({ xSignature: badSignature });

    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(getPaymentByIdMock).not.toHaveBeenCalled();
  });

  it("sem MP_WEBHOOK_SECRET configurado responde 401 mesmo com header presente", async () => {
    delete process.env.MP_WEBHOOK_SECRET;
    const req = buildRequest({});

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("assinatura válida mas tipo diferente de 'payment' responde 200 sem consultar a API", async () => {
    const dataId = "999";
    const req = buildRequest({
      dataId,
      type: "merchant_order",
      xSignature: sign(dataId, "req-1", "1700000000"),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(getPaymentByIdMock).not.toHaveBeenCalled();
  });

  it("assinatura válida e tipo 'payment' consulta a API e responde 200", async () => {
    const req = buildRequest({});

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(getPaymentByIdMock).toHaveBeenCalledWith("123456", TOKEN);
  });

  it("regista só id + status no log — nunca dados do pagador", async () => {
    getPaymentByIdMock.mockResolvedValue({
      id: 123456,
      status: "approved",
      payer: { email: "cliente-nao-deveria-aparecer@example.com" },
      transaction_amount: 125,
    });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await POST(buildRequest({}));

    expect(logSpy).toHaveBeenCalled();
    const logged = logSpy.mock.calls.map((c) => c.join(" ")).join(" ");
    expect(logged).toContain("123456");
    expect(logged).toContain("approved");
    expect(logged).not.toContain("cliente-nao-deveria-aparecer@example.com");

    logSpy.mockRestore();
  });

  it("se a consulta à API falhar, ainda responde 200 (evita loop de reenvio do Mercado Pago)", async () => {
    getPaymentByIdMock.mockRejectedValue(new Error("timeout"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(200);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it("sem MP_ACCESS_TOKEN configurado responde 200 mas não tenta consultar a API", async () => {
    delete process.env.MP_ACCESS_TOKEN;

    const res = await POST(buildRequest({}));

    expect(res.status).toBe(200);
    expect(getPaymentByIdMock).not.toHaveBeenCalled();
  });
});
