import { describe, expect, it } from "vitest";
import { inviteSchema } from "@/lib/schemas/invite.schema";
import { exercicioSchema, treinoSchema } from "@/lib/schemas/treino.schema";

describe("inviteSchema", () => {
  it("aceita instrutor válido", () => {
    expect(
      inviteSchema.safeParse({
        nome: "Ana",
        email: "a@b.com",
        role: "instrutor",
      }).success,
    ).toBe(true);
  });
  it("rejeita role inválido", () => {
    expect(
      inviteSchema.safeParse({ nome: "Ana", email: "a@b.com", role: "admin" })
        .success,
    ).toBe(false);
  });
  it("rejeita email inválido", () => {
    expect(
      inviteSchema.safeParse({ nome: "Ana", email: "x", role: "aluno" })
        .success,
    ).toBe(false);
  });
});

describe("exercicioSchema", () => {
  it("exige séries positivas", () => {
    expect(
      exercicioSchema.safeParse({ nome: "Supino", series: 0, repeticoes: "10" })
        .success,
    ).toBe(false);
  });
  it("aceita exercício válido", () => {
    expect(
      exercicioSchema.safeParse({
        nome: "Supino",
        series: 3,
        repeticoes: "10-12",
        carga: "20kg",
      }).success,
    ).toBe(true);
  });
});

describe("treinoSchema", () => {
  it("exige alunoId uuid e nome", () => {
    expect(
      treinoSchema.safeParse({
        alunoId: "550e8400-e29b-41d4-a716-446655440000",
        nome: "Treino A",
      }).success,
    ).toBe(true);
    expect(
      treinoSchema.safeParse({ alunoId: "nope", nome: "Treino A" }).success,
    ).toBe(false);
  });
});
