import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/lead.schema";

describe("leadSchema", () => {
  it("aceita lead válido", () => {
    expect(
      leadSchema.safeParse({ nome: "Ana", telefone: "51999999999" }).success,
    ).toBe(true);
  });

  it("rejeita nome curto", () => {
    expect(
      leadSchema.safeParse({ nome: "A", telefone: "51999999999" }).success,
    ).toBe(false);
  });

  it("rejeita telefone curto", () => {
    expect(leadSchema.safeParse({ nome: "Ana", telefone: "123" }).success).toBe(
      false,
    );
  });

  it("aceita telefone formatado", () => {
    expect(
      leadSchema.safeParse({ nome: "Ana", telefone: "(51) 99744-2463" })
        .success,
    ).toBe(true);
  });

  it("rejeita telefone com letras/símbolos", () => {
    expect(
      leadSchema.safeParse({ nome: "Ana", telefone: "!!!!!!!!" }).success,
    ).toBe(false);
  });
});
