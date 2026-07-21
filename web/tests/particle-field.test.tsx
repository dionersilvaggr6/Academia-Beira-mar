import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ParticleFallback } from "@/components/three/ParticleFallback";

describe("ParticleFallback", () => {
  it("renderiza fallback acessível quando reduced-motion", () => {
    const { container } = render(<ParticleFallback />);
    const fallback = container.querySelector("[data-particle-fallback]");
    expect(fallback).not.toBeNull();
    expect(fallback?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("ParticleField (default export)", () => {
  it("com reduced-motion, renderiza só o fallback e nunca monta o Canvas", async () => {
    vi.resetModules();
    vi.doMock("framer-motion", () => ({ useReducedMotion: () => true }));
    vi.doMock("@react-three/fiber", () => ({
      Canvas: () => <div data-canvas-stub />,
      useFrame: () => undefined,
    }));

    const { default: ParticleField } = await import(
      "@/components/three/ParticleField"
    );
    const { container } = render(<ParticleField />);

    expect(container.querySelector("[data-particle-fallback]")).not.toBeNull();
    expect(container.querySelector("[data-canvas-stub]")).toBeNull();

    vi.doUnmock("framer-motion");
    vi.doUnmock("@react-three/fiber");
  });
});
