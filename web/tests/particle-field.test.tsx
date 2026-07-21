import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ParticleFallback } from "@/components/three/ParticleFallback";

afterEach(() => {
  vi.doUnmock("framer-motion");
  vi.doUnmock("@react-three/fiber");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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

describe("ParticleField (WebGL feature detection)", () => {
  it("renderiza só o fallback quando o WebGL não está disponível", async () => {
    vi.resetModules();
    vi.doMock("framer-motion", () => ({ useReducedMotion: () => false }));
    vi.doMock("@react-three/fiber", () => ({
      Canvas: () => <div data-canvas-stub />,
      useFrame: () => undefined,
    }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const { default: ParticleField } = await import(
      "@/components/three/ParticleField"
    );
    const { container } = render(<ParticleField />);

    expect(container.querySelector("[data-particle-fallback]")).not.toBeNull();
    expect(container.querySelector("[data-canvas-stub]")).toBeNull();
  });
});

describe("ParticleField (error boundary)", () => {
  it("renderiza o fallback se o Canvas lançar um erro ao montar", async () => {
    vi.resetModules();
    vi.doMock("framer-motion", () => ({ useReducedMotion: () => false }));
    vi.doMock("@react-three/fiber", () => ({
      Canvas: () => {
        throw new Error("boom: no WebGL context");
      },
      useFrame: () => undefined,
    }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as unknown as RenderingContext,
    );
    // The boundary logs the caught error; keep test output clean.
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { default: ParticleField } = await import(
      "@/components/three/ParticleField"
    );
    const { container } = render(<ParticleField />);

    expect(container.querySelector("[data-particle-fallback]")).not.toBeNull();
  });
});

describe("ParticleField (pause when tab is hidden)", () => {
  it("seta frameloop='never' quando document.hidden fica true, e volta a 'always' quando a aba reaparece", async () => {
    vi.resetModules();
    vi.doMock("framer-motion", () => ({ useReducedMotion: () => false }));

    let capturedProps: Record<string, unknown> = {};
    vi.doMock("@react-three/fiber", () => ({
      Canvas: (props: Record<string, unknown>) => {
        capturedProps = props;
        return <div data-canvas-stub />;
      },
      useFrame: () => undefined,
    }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as unknown as RenderingContext,
    );
    const hiddenSpy = vi
      .spyOn(document, "hidden", "get")
      .mockReturnValue(false);

    const { default: ParticleField } = await import(
      "@/components/three/ParticleField"
    );
    render(<ParticleField />);

    expect(capturedProps.frameloop).toBe("always");

    hiddenSpy.mockReturnValue(true);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(capturedProps.frameloop).toBe("never");

    hiddenSpy.mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(capturedProps.frameloop).toBe("always");
  });
});
