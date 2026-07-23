import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted garante que o mock existe antes de o vi.mock (içado) correr.
const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));

vi.mock("@/db/client", () => ({ getDb: getDbMock }));

import { submitLead } from "@/app/actions/submit-lead";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

beforeEach(() => {
  getDbMock.mockReset();
  getDbMock.mockReturnValue({
    insert: () => ({ values: vi.fn().mockResolvedValue(undefined) }),
  });
});

describe("submitLead", () => {
  it("ok com dados válidos", async () => {
    const r = await submitLead(
      null,
      fd({ nome: "Ana", telefone: "51999999999" }),
    );
    expect(r).toEqual({ ok: true });
  });

  it("erro com nome curto", async () => {
    const r = await submitLead(
      null,
      fd({ nome: "A", telefone: "51999999999" }),
    );
    expect(r.ok).toBe(false);
  });

  it("em erro ao gravar, regista só a mensagem — nunca o objeto do lead (PII)", async () => {
    // Mensagens de erro de BD (ex.: violação de constraint) por vezes citam
    // os valores da linha — por isso o teste garante que nada do que foi
    // registado contém nome/telefone, só uma mensagem em texto.
    const dbError = new Error(
      'duplicate key value violates unique constraint "leads_telefone_key"',
    );
    getDbMock.mockReturnValue({
      insert: () => ({ values: vi.fn().mockRejectedValue(dbError) }),
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const r = await submitLead(
      null,
      fd({ nome: "Maria Confidencial", telefone: "51988887777" }),
    );

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível enviar agora. Tenta pelo WhatsApp.",
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedArgs = errorSpy.mock.calls[0] ?? [];
    for (const arg of loggedArgs) {
      expect(typeof arg).toBe("string");
    }
    const logged = loggedArgs.join(" ");
    expect(logged).not.toContain("Maria Confidencial");
    expect(logged).not.toContain("51988887777");
    expect(logged).toContain(dbError.message);

    errorSpy.mockRestore();
  });
});
