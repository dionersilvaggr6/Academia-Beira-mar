import { afterEach, describe, expect, it, vi } from "vitest";

const { valuesMock } = vi.hoisted(() => ({
  valuesMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/db/client", () => ({
  getDb: () => ({
    insert: () => ({ values: valuesMock }),
  }),
}));

import { iniciarPagamento } from "@/app/actions/checkout";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

const validOrder = {
  planoId: "mensal-recorrente",
  nome: "Ana Silva",
  email: "ana@example.com",
  telefone: "51999999999",
  metodo: "pix",
};

describe("iniciarPagamento", () => {
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
});
