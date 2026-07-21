import { describe, expect, it } from "vitest";
import { recuperarSenhaSchema } from "@/lib/schemas/recuperar-senha.schema";

describe("recuperarSenhaSchema", () => {
  it("aceita email válido", () => {
    expect(
      recuperarSenhaSchema.safeParse({ email: "ana@example.com" }).success,
    ).toBe(true);
  });

  it("rejeita email com formato inválido", () => {
    expect(
      recuperarSenhaSchema.safeParse({ email: "não-é-email" }).success,
    ).toBe(false);
  });

  it("rejeita email vazio", () => {
    expect(recuperarSenhaSchema.safeParse({ email: "" }).success).toBe(false);
  });

  it("rejeita quando o campo email está em falta", () => {
    expect(recuperarSenhaSchema.safeParse({}).success).toBe(false);
  });
});
