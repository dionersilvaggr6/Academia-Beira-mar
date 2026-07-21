import { describe, expect, it } from "vitest";
import { definirSenhaSchema } from "@/lib/schemas/definir-senha.schema";

describe("definirSenhaSchema", () => {
  it("aceita senha válida com confirmação igual", () => {
    expect(
      definirSenhaSchema.safeParse({
        senha: "12345678",
        confirmarSenha: "12345678",
      }).success,
    ).toBe(true);
  });

  it("rejeita senha com menos de 8 caracteres", () => {
    expect(
      definirSenhaSchema.safeParse({
        senha: "1234567",
        confirmarSenha: "1234567",
      }).success,
    ).toBe(false);
  });

  it("rejeita quando a confirmação não coincide", () => {
    const result = definirSenhaSchema.safeParse({
      senha: "12345678",
      confirmarSenha: "87654321",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirmarSenha");
    }
  });
});
