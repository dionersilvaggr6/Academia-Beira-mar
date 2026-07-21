import { describe, expect, it } from "vitest";
import { parseHashTokens } from "@/lib/auth/hash-tokens";

describe("parseHashTokens", () => {
  it("devolve os tokens de uma hash de convite válida", () => {
    const hash =
      "#access_token=abc123&refresh_token=def456&type=invite&expires_in=3600";
    expect(parseHashTokens(hash)).toEqual({
      accessToken: "abc123",
      refreshToken: "def456",
      type: "invite",
    });
  });

  it("aceita a hash sem o `#` inicial", () => {
    const hash = "access_token=abc123&refresh_token=def456&type=invite";
    expect(parseHashTokens(hash)).toEqual({
      accessToken: "abc123",
      refreshToken: "def456",
      type: "invite",
    });
  });

  it("devolve null para hash vazia", () => {
    expect(parseHashTokens("")).toBeNull();
    expect(parseHashTokens("#")).toBeNull();
  });

  it("devolve null para hash sem os tokens (lixo)", () => {
    expect(parseHashTokens("#foo=bar&baz=qux")).toBeNull();
  });

  it("devolve null quando falta o refresh_token", () => {
    expect(parseHashTokens("#access_token=abc123&type=invite")).toBeNull();
  });

  it("devolve null quando falta o access_token", () => {
    expect(parseHashTokens("#refresh_token=def456&type=invite")).toBeNull();
  });

  it("trata type=recovery corretamente", () => {
    const hash = "#access_token=abc123&refresh_token=def456&type=recovery";
    expect(parseHashTokens(hash)).toEqual({
      accessToken: "abc123",
      refreshToken: "def456",
      type: "recovery",
    });
  });

  it("devolve type null quando o parâmetro type não vem na hash", () => {
    const hash = "#access_token=abc123&refresh_token=def456";
    expect(parseHashTokens(hash)).toEqual({
      accessToken: "abc123",
      refreshToken: "def456",
      type: null,
    });
  });
});
