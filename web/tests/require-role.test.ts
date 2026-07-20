import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted garante que os mocks existem antes de o vi.mock (içado) correr.
const { redirectMock, getUserMock, singleMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  getUserMock: vi.fn(),
  singleMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: () => ({
      select: () => ({ eq: () => ({ single: singleMock }) }),
    }),
  }),
}));

import { requireRole } from "@/lib/auth/profile";

beforeEach(() => {
  redirectMock.mockClear();
  getUserMock.mockReset();
  singleMock.mockReset();
});

describe("requireRole", () => {
  it("sem sessão → redireciona para /login", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await expect(requireRole("aluno")).rejects.toThrow("REDIRECT:/login");
  });

  it("papel errado → redireciona para a área do próprio papel", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    singleMock.mockResolvedValue({
      data: { id: "u1", nome: "Ana", role: "aluno", telefone: null },
    });
    await expect(requireRole("instrutor")).rejects.toThrow("REDIRECT:/aluno");
  });

  it("papel certo → devolve o perfil", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u2" } } });
    singleMock.mockResolvedValue({
      data: { id: "u2", nome: "Prof", role: "instrutor", telefone: null },
    });
    const p = await requireRole("instrutor");
    expect(p.nome).toBe("Prof");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
