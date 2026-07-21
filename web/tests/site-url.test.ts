import { describe, expect, it } from "vitest";
import { resolveOrigin } from "@/lib/site-url";

function headersFrom(values: Record<string, string>): Pick<Headers, "get"> {
  return { get: (name) => values[name.toLowerCase()] ?? null };
}

describe("resolveOrigin", () => {
  it("usa x-forwarded-proto + host mesmo com NEXT_PUBLIC_SITE_URL definida (previews da Vercel)", () => {
    const headers = headersFrom({
      "x-forwarded-proto": "https",
      host: "beira-mar-git-branch.vercel.app",
    });
    expect(resolveOrigin(headers, "https://academiabeiramar.com.br")).toBe(
      "https://beira-mar-git-branch.vercel.app",
    );
  });

  it("sem x-forwarded-proto, usa NEXT_PUBLIC_SITE_URL se definida", () => {
    const headers = headersFrom({ host: "beira-mar.internal" });
    expect(resolveOrigin(headers, "https://academiabeiramar.com.br/")).toBe(
      "https://academiabeiramar.com.br",
    );
  });

  it("sem proto e sem env var, assume https para um domínio normal", () => {
    const headers = headersFrom({ host: "academiabeiramar.com.br" });
    expect(resolveOrigin(headers, undefined)).toBe(
      "https://academiabeiramar.com.br",
    );
  });

  it("sem proto e sem env var, assume http para localhost", () => {
    const headers = headersFrom({ host: "localhost:3000" });
    expect(resolveOrigin(headers, undefined)).toBe("http://localhost:3000");
  });

  it("sem host e sem env var, lança erro", () => {
    const headers = headersFrom({});
    expect(() => resolveOrigin(headers, undefined)).toThrow();
  });
});
