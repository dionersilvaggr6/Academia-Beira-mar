import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({ useReducedMotion: () => true }));

import { ParticleFallback } from "@/components/three/ParticleField";

describe("ParticleField", () => {
  it("renderiza fallback acessível quando reduced-motion", () => {
    const { container } = render(<ParticleFallback />);
    const fallback = container.querySelector("[data-particle-fallback]");
    expect(fallback).not.toBeNull();
    expect(fallback?.getAttribute("aria-hidden")).toBe("true");
  });
});
