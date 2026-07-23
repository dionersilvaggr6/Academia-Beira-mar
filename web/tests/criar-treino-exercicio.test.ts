import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted garante que os mocks existem antes de o vi.mock (içado) correr.
const { requireRoleMock, fromMock, revalidatePathMock } = vi.hoisted(() => ({
  requireRoleMock: vi.fn(),
  fromMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/auth/profile", () => ({
  requireRole: requireRoleMock,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: fromMock }),
}));
// revalidatePath exige um request store do Next.js que não existe em testes unitários.
vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { criarExercicio, criarTreino } from "@/app/actions/treinos";

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
const treinoId = "650e8400-e29b-41d4-a716-446655440001";

/** Mock de `.from(tabela).select("id").eq(...)` + `.insert(...)` na mesma tabela. */
function buildFromMock(
  existingCount: number,
  insertError: { message: string } | null = null,
) {
  const selectEq = vi.fn().mockResolvedValue({
    data: Array.from({ length: existingCount }, (_, i) => ({ id: `row-${i}` })),
    error: null,
  });
  const insertMock = vi.fn().mockResolvedValue({ error: insertError });
  const from = vi.fn(() => ({
    select: () => ({ eq: selectEq }),
    insert: insertMock,
  }));
  return { from, selectEq, insertMock };
}

beforeEach(() => {
  requireRoleMock.mockReset();
  requireRoleMock.mockResolvedValue(instrutor);
  fromMock.mockReset();
  revalidatePathMock.mockReset();
});

describe("criarTreino", () => {
  it("define `ordem` como a contagem de divisões já existentes do aluno", async () => {
    const { from, insertMock } = buildFromMock(2);
    fromMock.mockImplementation(from);

    const r = await criarTreino(null, fd({ alunoId, nome: "Treino C" }));

    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        aluno_id: alunoId,
        nome: "Treino C",
        ordem: 2,
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/instrutor/aluno/${alunoId}`,
    );
  });

  it("primeira divisão do aluno recebe ordem 0", async () => {
    const { from, insertMock } = buildFromMock(0);
    fromMock.mockImplementation(from);

    const r = await criarTreino(null, fd({ alunoId, nome: "Treino A" }));

    expect(r.ok).toBe(true);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ ordem: 0 }),
    );
  });

  it("erro do supabase ao inserir vira mensagem amigável", async () => {
    const { from } = buildFromMock(0, { message: "db down" });
    fromMock.mockImplementation(from);

    const r = await criarTreino(null, fd({ alunoId, nome: "Treino A" }));

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível criar a divisão.",
    });
  });
});

describe("criarExercicio", () => {
  it("ok: cria o exercício com ordem = contagem de exercícios já existentes na divisão e revalida a página do aluno (não /instrutor)", async () => {
    const { from, insertMock } = buildFromMock(3);
    fromMock.mockImplementation(from);

    const r = await criarExercicio(
      null,
      fd({
        treinoId,
        alunoId,
        nome: "Supino",
        series: "3",
        repeticoes: "10-12",
      }),
    );

    expect(r).toEqual({ ok: true });
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ treino_id: treinoId, ordem: 3 }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith(
      `/instrutor/aluno/${alunoId}`,
    );
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/instrutor");
  });

  it("rejeita quando falta o alunoId, sem tocar na base de dados", async () => {
    const { from, insertMock } = buildFromMock(0);
    fromMock.mockImplementation(from);

    const r = await criarExercicio(
      null,
      fd({ treinoId, nome: "Supino", series: "3", repeticoes: "10-12" }),
    );

    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejeita alunoId que não é uuid", async () => {
    const { insertMock } = buildFromMock(0);
    const r = await criarExercicio(
      null,
      fd({
        treinoId,
        alunoId: "nao-uuid",
        nome: "Supino",
        series: "3",
        repeticoes: "10-12",
      }),
    );

    expect(r.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejeita quando falta o treinoId ou não é uuid", async () => {
    const semTreino = await criarExercicio(
      null,
      fd({ alunoId, nome: "Supino", series: "3", repeticoes: "10-12" }),
    );
    expect(semTreino.ok).toBe(false);

    const treinoInvalido = await criarExercicio(
      null,
      fd({
        treinoId: "nao-uuid",
        alunoId,
        nome: "Supino",
        series: "3",
        repeticoes: "10-12",
      }),
    );
    expect(treinoInvalido.ok).toBe(false);
  });

  it("erro do supabase ao inserir vira mensagem amigável", async () => {
    const { from } = buildFromMock(0, { message: "db down" });
    fromMock.mockImplementation(from);

    const r = await criarExercicio(
      null,
      fd({
        treinoId,
        alunoId,
        nome: "Supino",
        series: "3",
        repeticoes: "10-12",
      }),
    );

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível adicionar o exercício.",
    });
  });
});
