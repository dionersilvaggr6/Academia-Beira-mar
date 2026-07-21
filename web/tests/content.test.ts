import { describe, expect, it } from "vitest";
import { SITE } from "@/content/site";
import { siteSchema } from "@/lib/content.schema";

describe("SITE", () => {
  it("valida contra o schema", () => {
    expect(() => siteSchema.parse(SITE)).not.toThrow();
  });
  it("tem reviews reais e stats", () => {
    expect(SITE.reviews.length).toBeGreaterThanOrEqual(3);
    expect(SITE.stats.some((s) => s.valor.includes("5"))).toBe(true);
  });
});
