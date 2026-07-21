import { describe, expect, it } from "vitest";
import { isPendingInvite } from "@/lib/auth/invite-status";

describe("isPendingInvite", () => {
  it("é pendente quando nunca confirmou o email nem entrou", () => {
    expect(
      isPendingInvite({
        email_confirmed_at: undefined,
        confirmed_at: undefined,
        last_sign_in_at: undefined,
      }),
    ).toBe(true);
  });

  it("não é pendente quando confirmou o email (aceitou o convite)", () => {
    expect(
      isPendingInvite({
        email_confirmed_at: "2026-07-21T10:00:00Z",
        confirmed_at: "2026-07-21T10:00:00Z",
        last_sign_in_at: null,
      }),
    ).toBe(false);
  });

  it("não é pendente quando já tem confirmed_at e last_sign_in_at (ativo)", () => {
    expect(
      isPendingInvite({
        email_confirmed_at: "2026-07-21T10:00:00Z",
        confirmed_at: "2026-07-21T10:00:00Z",
        last_sign_in_at: "2026-07-21T11:00:00Z",
      }),
    ).toBe(false);
  });

  it("trata campos em falta (undefined) como pendente, sem lançar erro", () => {
    expect(isPendingInvite({})).toBe(true);
  });

  it("trata campos nulos (formato real da API) como pendente", () => {
    expect(
      isPendingInvite({
        email_confirmed_at: null,
        confirmed_at: null,
        last_sign_in_at: null,
      }),
    ).toBe(true);
  });

  it("considera confirmado quando só confirmed_at está definido (sem email_confirmed_at)", () => {
    expect(
      isPendingInvite({
        email_confirmed_at: null,
        confirmed_at: "2026-07-21T10:00:00Z",
        last_sign_in_at: null,
      }),
    ).toBe(false);
  });
});
