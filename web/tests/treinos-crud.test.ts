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

import {
  apagarExercicio,
  apagarTreino,
  editarExercicio,
  editarTreino,
} from "@/app/actions/treinos";

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
const exercicioId = "750e8400-e29b-41d4-a716-446655440002";

beforeEach(() => {
  requireRoleMock.mockReset();
  requireRoleMock.mockResolvedValue(instrutor);
  fromMock.mockReset();
});

describe("editarTreino", () => {
  it("ok com dados válidos", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ update: () => ({ eq: eqMock }) });

    const r = await editarTreino(
      null,
      fd({ id: treinoId, alunoId, nome: "Treino A", foco: "Peito" }),
    );

    expect(r).toEqual({ ok: true });
    expect(eqMock).toHaveBeenCalledWith("id", treinoId);
  });

  it("erro com nome vazio", async () => {
    const r = await editarTreino(null, fd({ id: treinoId, alunoId, nome: "" }));
    expect(r.ok).toBe(false);
  });

  it("erro do supabase vira mensagem amigável", async () => {
    fromMock.mockReturnValue({
      update: () => ({
        eq: vi.fn().mockResolvedValue({ error: { message: "db down" } }),
      }),
    });

    const r = await editarTreino(
      null,
      fd({ id: treinoId, alunoId, nome: "Treino A" }),
    );

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível atualizar a divisão.",
    });
  });
});

describe("apagarTreino", () => {
  it("ok — apaga exercícios da divisão e depois a divisão", async () => {
    const exDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const treinoDeleteEq = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockImplementation((table: string) =>
      table === "exercicios"
        ? { delete: () => ({ eq: exDeleteEq }) }
        : { delete: () => ({ eq: treinoDeleteEq }) },
    );

    const r = await apagarTreino(null, fd({ id: treinoId, alunoId }));

    expect(r).toEqual({ ok: true });
    expect(exDeleteEq).toHaveBeenCalledWith("treino_id", treinoId);
    expect(treinoDeleteEq).toHaveBeenCalledWith("id", treinoId);
  });

  it("erro com id inválido", async () => {
    const r = await apagarTreino(null, fd({ id: "nao-uuid", alunoId }));
    expect(r.ok).toBe(false);
  });

  it("erro do supabase ao apagar exercícios não apaga a divisão", async () => {
    const treinoDeleteEq = vi.fn();
    fromMock.mockImplementation((table: string) =>
      table === "exercicios"
        ? {
            delete: () => ({
              eq: vi.fn().mockResolvedValue({ error: { message: "db down" } }),
            }),
          }
        : { delete: () => ({ eq: treinoDeleteEq }) },
    );

    const r = await apagarTreino(null, fd({ id: treinoId, alunoId }));

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível apagar a divisão.",
    });
    expect(treinoDeleteEq).not.toHaveBeenCalled();
  });
});

describe("editarExercicio", () => {
  it("ok com dados válidos", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ update: () => ({ eq: eqMock }) });

    const r = await editarExercicio(
      null,
      fd({
        id: exercicioId,
        alunoId,
        nome: "Supino",
        series: "3",
        repeticoes: "10-12",
        carga: "20kg",
        observacoes: "Cadência lenta",
      }),
    );

    expect(r).toEqual({ ok: true });
    expect(eqMock).toHaveBeenCalledWith("id", exercicioId);
  });

  it("erro com séries inválidas", async () => {
    const r = await editarExercicio(
      null,
      fd({
        id: exercicioId,
        alunoId,
        nome: "Supino",
        series: "0",
        repeticoes: "10",
      }),
    );
    expect(r.ok).toBe(false);
  });

  it("erro do supabase vira mensagem amigável", async () => {
    fromMock.mockReturnValue({
      update: () => ({
        eq: vi.fn().mockResolvedValue({ error: { message: "db down" } }),
      }),
    });

    const r = await editarExercicio(
      null,
      fd({
        id: exercicioId,
        alunoId,
        nome: "Supino",
        series: "3",
        repeticoes: "10",
      }),
    );

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível atualizar o exercício.",
    });
  });
});

describe("apagarExercicio", () => {
  it("ok com id válido", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    fromMock.mockReturnValue({ delete: () => ({ eq: eqMock }) });

    const r = await apagarExercicio(null, fd({ id: exercicioId, alunoId }));

    expect(r).toEqual({ ok: true });
    expect(eqMock).toHaveBeenCalledWith("id", exercicioId);
  });

  it("erro com id inválido", async () => {
    const r = await apagarExercicio(null, fd({ id: "nao-uuid", alunoId }));
    expect(r.ok).toBe(false);
  });

  it("erro do supabase vira mensagem amigável", async () => {
    fromMock.mockReturnValue({
      delete: () => ({
        eq: vi.fn().mockResolvedValue({ error: { message: "db down" } }),
      }),
    });

    const r = await apagarExercicio(null, fd({ id: exercicioId, alunoId }));

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível apagar o exercício.",
    });
  });
});
