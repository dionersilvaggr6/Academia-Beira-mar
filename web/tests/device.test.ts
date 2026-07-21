import { describe, expect, it } from "vitest";
import { particleCount } from "@/lib/device";

describe("particleCount", () => {
  it("desktop devolve 5000", () =>
    expect(particleCount(1440, false)).toBe(5000));
  it("mobile devolve 1500", () => expect(particleCount(390, false)).toBe(1500));
  it("reduced motion devolve 0", () =>
    expect(particleCount(1440, true)).toBe(0));
});
