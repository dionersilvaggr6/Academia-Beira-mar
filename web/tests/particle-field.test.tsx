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

describe("ParticleField (pause when off-screen)", () => {
  it("seta frameloop='never' quando o container sai do viewport", async () => {
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

    let observerCallback: IntersectionObserverCallback = () => undefined;
    class FakeIntersectionObserver {
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = "";
      thresholds: number[] = [];
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
    }
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

    const { default: ParticleField } = await import(
      "@/components/three/ParticleField"
    );
    render(<ParticleField />);

    expect(capturedProps.frameloop).toBe("always");

    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        new FakeIntersectionObserver(
          () => undefined,
        ) as unknown as IntersectionObserver,
      );
    });

    expect(capturedProps.frameloop).toBe("never");
  });
});
