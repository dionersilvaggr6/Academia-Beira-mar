import { describe, expect, it } from "vitest";
import { CATALOGO, TODOS_EXERCICIOS } from "@/lib/treinos/catalogo";
import { MODELOS } from "@/lib/treinos/modelos";

describe("catálogo de exercícios", () => {
  it("tem categorias com ids únicos", () => {
    const ids = CATALOGO.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("não repete o mesmo exercício em categorias diferentes", () => {
    expect(new Set(TODOS_EXERCICIOS).size).toBe(TODOS_EXERCICIOS.length);
  });

  it("nenhuma categoria está vazia", () => {
    for (const categoria of CATALOGO) {
      expect(categoria.exercicios.length).toBeGreaterThan(0);
    }
  });
});

describe("modelos de treino", () => {
  it("tem ids únicos", () => {
    const ids = MODELOS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nenhum modelo está vazio", () => {
    for (const modelo of MODELOS) {
      expect(modelo.divisoes.length).toBeGreaterThan(0);
      for (const divisao of modelo.divisoes) {
        expect(divisao.exercicios.length).toBeGreaterThan(0);
      }
    }
  });

  // A invariante que interessa: um modelo nunca pode referir um exercício
  // que não existe no catálogo (senão o instrutor recebe um nome órfão).
  it("todos os exercícios dos modelos existem no catálogo", () => {
    const catalogo = new Set(TODOS_EXERCICIOS);
    const orfaos: string[] = [];

    for (const modelo of MODELOS) {
      for (const divisao of modelo.divisoes) {
        for (const exercicio of divisao.exercicios) {
          if (!catalogo.has(exercicio)) {
            orfaos.push(`${modelo.id}/${divisao.nome}: ${exercicio}`);
          }
        }
      }
    }

    expect(orfaos).toEqual([]);
  });

  it("inclui o modelo ABC com as três divisões", () => {
    const abc = MODELOS.find((m) => m.id === "abc");
    expect(abc).toBeDefined();
    expect(abc?.divisoes.map((d) => d.nome)).toEqual([
      "Treino A",
      "Treino B",
      "Treino C",
    ]);
  });
});
