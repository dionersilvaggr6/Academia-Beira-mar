import { describe, expect, it } from "vitest";
import { findPlano, PLANS, precoLabel } from "@/lib/plans";
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

describe("precoLabel", () => {
  it("formata um plano sem parcelas em BRL", () => {
    const anual = PLANS.find((p) => p.id === "anual-vista");
    expect(anual).toBeDefined();
    if (!anual) return;
    expect(precoLabel(anual)).toBe(
      anual.preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    );
  });

  it("prefixa com '<parcelas>× de' quando o plano tem parcelas", () => {
    const trimestral = PLANS.find((p) => p.id === "trimestral");
    expect(trimestral).toBeDefined();
    if (!trimestral) return;
    expect(precoLabel(trimestral)).toMatch(/^3× de R\$/);
  });
});

describe("findPlano", () => {
  it("devolve o plano quando o id existe", () => {
    expect(findPlano("mensal-recorrente")?.nome).toBe("Mensal Recorrente");
  });

  it("devolve undefined para um id que não existe", () => {
    expect(findPlano("nao-existe")).toBeUndefined();
  });
});
