import { describe, expect, it } from "vitest";
import { PLANS } from "@/lib/plans";
import { planoSchema } from "@/lib/plans.schema";

describe("PLANS", () => {
  it("tem os 10 planos oficiais", () => {
    expect(PLANS).toHaveLength(10);
  });

  it("todos válidos pelo schema", () => {
    for (const p of PLANS) expect(() => planoSchema.parse(p)).not.toThrow();
  });

  it("inclui a Anual à Vista a 999", () => {
    const anual = PLANS.find((p) => p.id === "anual-vista");
    expect(anual?.preco).toBe(999);
  });
});
