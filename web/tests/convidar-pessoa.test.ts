import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted garante que os mocks existem antes de o vi.mock (içado) correr.
const {
  requireRoleMock,
  createAdminClientMock,
  revalidatePathMock,
  headersMock,
} = vi.hoisted(() => ({
  requireRoleMock: vi.fn(),
  createAdminClientMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  headersMock: vi.fn(),
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
vi.mock("next/headers", () => ({
  headers: headersMock,
}));

import { convidarPessoa } from "@/app/actions/pessoas";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

function buildHeaders(map: Record<string, string> = {}) {
  return { get: (key: string) => map[key] ?? null };
}

const instrutor = {
  id: "550e8400-e29b-41d4-a716-446655440099",
  nome: "Prof",
  role: "instrutor" as const,
  telefone: null,
};
const novoUserId = "650e8400-e29b-41d4-a716-446655440001";

/** Constrói um cliente admin falso cobrindo a cadeia usada por `convidarPessoa`. */
function buildAdminMock(
  opts: {
    inviteError?: { message: string } | null;
    upsertError?: { message: string } | null;
    deleteUserError?: { message: string } | null;
  } = {},
) {
  const {
    inviteError = null,
    upsertError = null,
    deleteUserError = null,
  } = opts;

  const inviteUserByEmailMock = vi
    .fn()
    .mockResolvedValue(
      inviteError
        ? { data: null, error: inviteError }
        : { data: { user: { id: novoUserId } }, error: null },
    );
  const upsertMock = vi.fn().mockResolvedValue({ error: upsertError });
  const deleteUserMock = vi.fn().mockResolvedValue({ error: deleteUserError });
  const fromMock = vi.fn(() => ({ upsert: upsertMock }));

  return {
    auth: {
      admin: {
        inviteUserByEmail: inviteUserByEmailMock,
        deleteUser: deleteUserMock,
      },
    },
    from: fromMock,
    _mocks: { inviteUserByEmailMock, upsertMock, deleteUserMock, fromMock },
  };
}

beforeEach(() => {
  requireRoleMock.mockReset();
  requireRoleMock.mockResolvedValue(instrutor);
  createAdminClientMock.mockReset();
  revalidatePathMock.mockReset();
  headersMock.mockReset();
  headersMock.mockResolvedValue(
    buildHeaders({
      host: "academiabeiramar.com.br",
      "x-forwarded-proto": "https",
    }),
  );
});

describe("convidarPessoa", () => {
  it("ok: convida e cria o perfil, sem tocar em deleteUser", async () => {
    const admin = buildAdminMock();
    createAdminClientMock.mockReturnValue(admin);

    const r = await convidarPessoa(
      null,
      fd({ nome: "Ana Aluna", email: "ana@example.com", role: "aluno" }),
    );

    expect(r).toEqual({ ok: true });
    expect(admin._mocks.upsertMock).toHaveBeenCalledWith({
      id: novoUserId,
      nome: "Ana Aluna",
      role: "aluno",
    });
    expect(admin._mocks.deleteUserMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/instrutor");
  });

  it("upsert do perfil falha depois do convite: apaga o utilizador de auth órfão e devolve erro", async () => {
    const admin = buildAdminMock({
      upsertError: { message: "profiles insert falhou" },
    });
    createAdminClientMock.mockReturnValue(admin);

    const r = await convidarPessoa(
      null,
      fd({ nome: "Ana Aluna", email: "ana@example.com", role: "aluno" }),
    );

    expect(r.ok).toBe(false);
    expect(admin._mocks.deleteUserMock).toHaveBeenCalledWith(novoUserId);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("se a limpeza do órfão também falhar, ainda assim devolve erro (não lança para fora)", async () => {
    const admin = buildAdminMock({
      upsertError: { message: "profiles insert falhou" },
      deleteUserError: { message: "deleteUser falhou também" },
    });
    createAdminClientMock.mockReturnValue(admin);

    const r = await convidarPessoa(
      null,
      fd({ nome: "Ana Aluna", email: "ana@example.com", role: "aluno" }),
    );

    expect(r.ok).toBe(false);
    expect(admin._mocks.deleteUserMock).toHaveBeenCalledWith(novoUserId);
  });

  it("erro no próprio convite não tenta apagar nenhum utilizador (nada foi criado)", async () => {
    const admin = buildAdminMock({
      inviteError: { message: "email já existe" },
    });
    createAdminClientMock.mockReturnValue(admin);

    const r = await convidarPessoa(
      null,
      fd({ nome: "Ana Aluna", email: "ana@example.com", role: "aluno" }),
    );

    expect(r.ok).toBe(false);
    expect(admin._mocks.deleteUserMock).not.toHaveBeenCalled();
    expect(admin._mocks.fromMock).not.toHaveBeenCalled();
  });

  it("erro de validação não chama o cliente admin", async () => {
    const r = await convidarPessoa(
      null,
      fd({ nome: "A", email: "nao-email", role: "aluno" }),
    );

    expect(r.ok).toBe(false);
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });
});
