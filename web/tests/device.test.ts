import { describe, expect, it } from "vitest";
import { particleCount } from "@/lib/device";

describe("particleCount", () => {
  // Lowered from 5000/1500 to cut the per-frame morph/rotation main-thread
  // cost (Lighthouse TBT/bootup-time) — see components/three/ParticleField.tsx.
  it("desktop devolve 2200", () =>
    expect(particleCount(1440, false)).toBe(2200));
  it("mobile devolve 800", () => expect(particleCount(390, false)).toBe(800));
  it("reduced motion devolve 0", () =>
    expect(particleCount(1440, true)).toBe(0));
});
