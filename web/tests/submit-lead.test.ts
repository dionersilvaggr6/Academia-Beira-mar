import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/client", () => ({
  getDb: () => ({
    insert: () => ({ values: vi.fn().mockResolvedValue(undefined) }),
  }),
}));

import { submitLead } from "@/app/actions/submit-lead";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

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
});
