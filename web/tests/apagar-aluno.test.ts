import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted garante que os mocks existem antes de o vi.mock (içado) correr.
const { requireRoleMock, createAdminClientMock, revalidatePathMock } =
  vi.hoisted(() => ({
    requireRoleMock: vi.fn(),
    createAdminClientMock: vi.fn(),
    revalidatePathMock: vi.fn(),
  }));

vi.mock("@/lib/auth/profile", () => ({
  requireRole: requireRoleMock,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: createAdminClientMock,
}));
// revalidatePath exige um request store do Next.js que não existe em testes unitários.
vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { apagarAluno } from "@/app/actions/pessoas";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

/** Ordem da primeira chamada de um mock, para comparar sequência entre mocks distintos. */
function firstCallOrder(mock: {
  mock: { invocationCallOrder: number[] };
}): number {
  const order = mock.mock.invocationCallOrder[0];
  if (order === undefined) {
    throw new Error("mock não foi chamado — sem invocationCallOrder");
  }
  return order;
}

const instrutor = {
  id: "550e8400-e29b-41d4-a716-446655440099",
  nome: "Prof",
  role: "instrutor" as const,
  telefone: null,
};
const alunoId = "550e8400-e29b-41d4-a716-446655440000";
const treinoIds = ["treino-1", "treino-2"];

type MockOpts = {
  profileRole?: string;
  profileFetchError?: { message: string } | null;
  treinoRows?: { id: string }[];
  treinosSelectError?: { message: string } | null;
  exerciciosDeleteError?: { message: string } | null;
  treinosDeleteError?: { message: string } | null;
  profileDeleteError?: { message: string } | null;
  deleteUserError?: { message: string } | null;
};

/** Constrói um cliente admin falso cobrindo toda a cadeia usada por `apagarAluno`. */
function buildAdminMock(opts: MockOpts = {}) {
  const {
    profileRole = "aluno",
    profileFetchError = null,
    treinoRows = treinoIds.map((id) => ({ id })),
    treinosSelectError = null,
    exerciciosDeleteError = null,
    treinosDeleteError = null,
    profileDeleteError = null,
    deleteUserError = null,
  } = opts;

  const profileSingleMock = vi
    .fn()
    .mockResolvedValue(
      profileFetchError
        ? { data: null, error: profileFetchError }
        : { data: { role: profileRole }, error: null },
    );
  const treinosSelectEqMock = vi
    .fn()
    .mockResolvedValue(
      treinosSelectError
        ? { data: null, error: treinosSelectError }
        : { data: treinoRows, error: null },
    );
  const exerciciosDeleteInMock = vi
    .fn()
    .mockResolvedValue({ error: exerciciosDeleteError });
  const treinosDeleteEqMock = vi
    .fn()
    .mockResolvedValue({ error: treinosDeleteError });
  const profileDeleteEqMock = vi
    .fn()
    .mockResolvedValue({ error: profileDeleteError });
  const deleteUserMock = vi.fn().mockResolvedValue({ error: deleteUserError });

  const fromMock = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: () => ({ eq: () => ({ single: profileSingleMock }) }),
        delete: () => ({ eq: profileDeleteEqMock }),
      };
    }
    if (table === "treinos") {
      return {
        select: () => ({ eq: treinosSelectEqMock }),
        delete: () => ({ eq: treinosDeleteEqMock }),
      };
    }
    if (table === "exercicios") {
      return { delete: () => ({ in: exerciciosDeleteInMock }) };
    }
    throw new Error(`tabela inesperada: ${table}`);
  });

  return {
    from: fromMock,
    auth: { admin: { deleteUser: deleteUserMock } },
    _mocks: {
      fromMock,
      profileSingleMock,
      treinosSelectEqMock,
      exerciciosDeleteInMock,
      treinosDeleteEqMock,
      profileDeleteEqMock,
      deleteUserMock,
    },
  };
}

beforeEach(() => {
  requireRoleMock.mockReset();
  requireRoleMock.mockResolvedValue(instrutor);
  createAdminClientMock.mockReset();
  revalidatePathMock.mockReset();
});

describe("apagarAluno", () => {
  it("caminho feliz: apaga a conta de auth primeiro, depois exercícios, treinos e perfil, por esta ordem", async () => {
    const admin = buildAdminMock();
    createAdminClientMock.mockReturnValue(admin);

    const r = await apagarAluno(null, fd({ alunoId }));

    expect(r).toEqual({ ok: true });
    expect(admin._mocks.profileSingleMock).toHaveBeenCalled();
    expect(admin._mocks.deleteUserMock).toHaveBeenCalledWith(alunoId);
    expect(admin._mocks.treinosSelectEqMock).toHaveBeenCalledWith(
      "aluno_id",
      alunoId,
    );
    expect(admin._mocks.exerciciosDeleteInMock).toHaveBeenCalledWith(
      "treino_id",
      treinoIds,
    );
    expect(admin._mocks.treinosDeleteEqMock).toHaveBeenCalledWith(
      "aluno_id",
      alunoId,
    );
    expect(admin._mocks.profileDeleteEqMock).toHaveBeenCalledWith(
      "id",
      alunoId,
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/instrutor");

    // A conta de auth é apagada ANTES de qualquer linha dependente — se uma
    // falha a meio deixar dados por apagar, nunca deixa um utilizador de
    // auth órfão sem perfil (ver comentário em `apagarAluno`).
    const authOrder = firstCallOrder(admin._mocks.deleteUserMock);
    const treinosSelectOrder = firstCallOrder(admin._mocks.treinosSelectEqMock);
    const exerciciosOrder = firstCallOrder(admin._mocks.exerciciosDeleteInMock);
    const treinosDeleteOrder = firstCallOrder(admin._mocks.treinosDeleteEqMock);
    const profileDeleteOrder = firstCallOrder(admin._mocks.profileDeleteEqMock);
    expect(authOrder).toBeLessThan(treinosSelectOrder);
    expect(treinosSelectOrder).toBeLessThan(exerciciosOrder);
    expect(exerciciosOrder).toBeLessThan(treinosDeleteOrder);
    expect(treinosDeleteOrder).toBeLessThan(profileDeleteOrder);
  });

  it("caminho feliz sem divisões: não chama delete de exercícios", async () => {
    const admin = buildAdminMock({ treinoRows: [] });
    createAdminClientMock.mockReturnValue(admin);

    const r = await apagarAluno(null, fd({ alunoId }));

    expect(r).toEqual({ ok: true });
    expect(admin._mocks.exerciciosDeleteInMock).not.toHaveBeenCalled();
    expect(admin._mocks.treinosDeleteEqMock).toHaveBeenCalled();
    expect(admin._mocks.deleteUserMock).toHaveBeenCalledWith(alunoId);
  });

  it("rejeita alunoId que não é uuid, sem tocar no cliente admin", async () => {
    const r = await apagarAluno(null, fd({ alunoId: "nao-uuid" }));

    expect(r.ok).toBe(false);
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("recusa apagar um perfil cujo role é instrutor", async () => {
    const admin = buildAdminMock({ profileRole: "instrutor" });
    createAdminClientMock.mockReturnValue(admin);

    const r = await apagarAluno(null, fd({ alunoId }));

    expect(r.ok).toBe(false);
    expect(admin._mocks.treinosSelectEqMock).not.toHaveBeenCalled();
    expect(admin._mocks.profileDeleteEqMock).not.toHaveBeenCalled();
    expect(admin._mocks.deleteUserMock).not.toHaveBeenCalled();
  });

  it("recusa auto-exclusão (alunoId igual ao id do instrutor autenticado), sem tocar no cliente admin", async () => {
    const r = await apagarAluno(null, fd({ alunoId: instrutor.id }));

    expect(r.ok).toBe(false);
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("erro do supabase/admin (ex.: falha ao apagar exercícios) devolve ok:false e para — não continua para treinos/perfil", async () => {
    const admin = buildAdminMock({
      exerciciosDeleteError: { message: "db down" },
    });
    createAdminClientMock.mockReturnValue(admin);

    const r = await apagarAluno(null, fd({ alunoId }));

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível excluir o aluno. Tenta de novo.",
    });
    expect(admin._mocks.treinosDeleteEqMock).not.toHaveBeenCalled();
    expect(admin._mocks.profileDeleteEqMock).not.toHaveBeenCalled();
    // A conta de auth já foi apagada com sucesso antes disto acontecer — é
    // esperado que tenha sido chamada, é o passo dependente que não avança.
    expect(admin._mocks.deleteUserMock).toHaveBeenCalledWith(alunoId);
  });

  it("erro ao apagar a conta de auth devolve ok:false e não toca em nenhuma linha dependente (sem órfãos)", async () => {
    const admin = buildAdminMock({ deleteUserError: { message: "auth down" } });
    createAdminClientMock.mockReturnValue(admin);

    const r = await apagarAluno(null, fd({ alunoId }));

    expect(r).toEqual({
      ok: false,
      error: "Não foi possível excluir o aluno. Tenta de novo.",
    });
    expect(admin._mocks.treinosSelectEqMock).not.toHaveBeenCalled();
    expect(admin._mocks.exerciciosDeleteInMock).not.toHaveBeenCalled();
    expect(admin._mocks.treinosDeleteEqMock).not.toHaveBeenCalled();
    expect(admin._mocks.profileDeleteEqMock).not.toHaveBeenCalled();
  });
});
