import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted garante que os mocks existem antes de o vi.mock (içado) correr.
const { requireRoleMock, fromMock } = vi.hoisted(() => ({
  requireRoleMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("@/lib/auth/profile", () => ({
  requireRole: requireRoleMock,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: fromMock }),
}));
// revalidatePath exige um request store do Next.js que não existe em testes unitários.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { aplicarModelo } from "@/app/actions/treinos";
import { MODELOS } from "@/lib/treinos/modelos";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

const instrutor = {
  id: "i1",
  nome: "Prof",
  role: "instrutor" as const,
  telefone: null,
};
const alunoId = "550e8400-e29b-41d4-a716-446655440000";

/** Mock de `.from("treinos").insert(...).select("id").single()` que devolve um id novo a cada chamada. */
function criarTreinoInsertMock() {
  const insertCalls: unknown[] = [];
  let contador = 0;
  const single = vi.fn(() => {
    contador += 1;
    return Promise.resolve({ data: { id: `treino-${contador}` }, error: null });
  });
  const insert = vi.fn((row: unknown) => {
    insertCalls.push(row);
    return { select: () => ({ single }) };
  });
  return { insert, insertCalls, single };
}

beforeEach(() => {
  requireRoleMock.mockReset();
  requireRoleMock.mockResolvedValue(instrutor);
  fromMock.mockReset();
});

describe("aplicarModelo", () => {
  it("aplica o modelo ABC: cria as 3 divisões e os exercícios de cada uma, em ordem", async () => {
    const treinoInsert = criarTreinoInsertMock();
    const exercicioInsert = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) =>
      table === "treinos"
        ? { insert: treinoInsert.insert }
        : { insert: exercicioInsert },
    );

    const abc = MODELOS.find((m) => m.id === "abc");
    if (!abc) throw new Error("fixture: modelo abc em falta");
    const divisaoA = abc.divisoes[0];
    if (!divisaoA) throw new Error("fixture: modelo abc sem divisões");

    const r = await aplicarModelo(null, fd({ alunoId, modeloId: "abc" }));

    expect(r).toEqual({ ok: true });
    expect(treinoInsert.insert).toHaveBeenCalledTimes(abc.divisoes.length);
    expect(exercicioInsert).toHaveBeenCalledTimes(abc.divisoes.length);

    // Primeira divisão: nome/foco do modelo, ordem sequencial, dono = instrutor.
    expect(treinoInsert.insertCalls[0]).toEqual({
      aluno_id: alunoId,
      nome: divisaoA.nome,
      foco: divisaoA.foco,
      ordem: 0,
      created_by: instrutor.id,
    });
    expect(treinoInsert.insertCalls[1]).toMatchObject({ ordem: 1 });
    expect(treinoInsert.insertCalls[2]).toMatchObject({ ordem: 2 });

    // Exercícios da primeira divisão: nome do catálogo, placeholders neutros, ordem sequencial.
    const primeiraDivisaoExercicios = exercicioInsert.mock.calls[0]?.[0];
    expect(primeiraDivisaoExercicios).toEqual(
      divisaoA.exercicios.map((nome: string, idx: number) => ({
        treino_id: "treino-1",
        nome,
        series: 3,
        repeticoes: "10-12",
        carga: null,
        observacoes: null,
        ordem: idx,
      })),
    );

    // Exercícios da segunda divisão apontam para o treino_id certo (o segundo criado).
    const segundaDivisaoExercicios = exercicioInsert.mock.calls[1]?.[0];
    expect(segundaDivisaoExercicios?.[0]).toMatchObject({
      treino_id: "treino-2",
    });
  });

  it("aplica o modelo Full Body (1 divisão só)", async () => {
    const treinoInsert = criarTreinoInsertMock();
    const exercicioInsert = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) =>
      table === "treinos"
        ? { insert: treinoInsert.insert }
        : { insert: exercicioInsert },
    );

    const r = await aplicarModelo(null, fd({ alunoId, modeloId: "full-body" }));

    expect(r).toEqual({ ok: true });
    expect(treinoInsert.insert).toHaveBeenCalledTimes(1);
    expect(exercicioInsert).toHaveBeenCalledTimes(1);
  });

  it("rejeita modeloId desconhecido sem tocar na base de dados", async () => {
    const r = await aplicarModelo(
      null,
      fd({ alunoId, modeloId: "nao-existe" }),
    );

    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejeita alunoId inválido", async () => {
    const r = await aplicarModelo(
      null,
      fd({ alunoId: "nao-uuid", modeloId: "abc" }),
    );

    expect(r.ok).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("erro do supabase ao criar uma divisão devolve ok:false e para (não continua meio aplicado sem avisar)", async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db down" } });
    const treinoInsertMock = vi.fn(() => ({ select: () => ({ single }) }));
    const exercicioInsert = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) =>
      table === "treinos"
        ? { insert: treinoInsertMock }
        : { insert: exercicioInsert },
    );

    const r = await aplicarModelo(null, fd({ alunoId, modeloId: "full-body" }));

    expect(r.ok).toBe(false);
    expect(exercicioInsert).not.toHaveBeenCalled();
  });

  it("erro do supabase ao criar exercícios de uma divisão devolve ok:false", async () => {
    const treinoInsert = criarTreinoInsertMock();
    const exercicioInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: "db down" } });
    fromMock.mockImplementation((table: string) =>
      table === "treinos"
        ? { insert: treinoInsert.insert }
        : { insert: exercicioInsert },
    );

    const r = await aplicarModelo(null, fd({ alunoId, modeloId: "full-body" }));

    expect(r).toEqual({
      ok: false,
      error: expect.stringContaining("Full Body"),
    });
  });
});
