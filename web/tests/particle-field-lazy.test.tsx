import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// `next/dynamic` is mocked at the module level (not just `three`/r3f, like
// `particle-field.test.tsx` does) so this suite can assert on *whether*
// ParticleFieldLazy decides to mount the dynamic-imported component at all,
// without ever pulling the real `ParticleField` (and therefore `three`)
// into this test file.
function mockDynamicWithStub() {
  vi.doMock("next/dynamic", () => ({
    default: () => () => <div data-particle-stub />,
  }));
}

afterEach(() => {
  vi.doUnmock("next/dynamic");
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("ParticleFieldLazy (deferred mount)", () => {
  it("renders only the lightweight CSS fallback on first render", async () => {
    vi.resetModules();
    mockDynamicWithStub();

    const { ParticleFieldLazy } = await import(
      "@/components/three/ParticleFieldLazy"
    );
    const { container } = render(<ParticleFieldLazy />);

    expect(container.querySelector("[data-particle-fallback]")).not.toBeNull();
    expect(container.querySelector("[data-particle-stub]")).toBeNull();
  });

  it("mounts the real (dynamic-imported) particle field once idle-after-load fires", async () => {
    vi.resetModules();
    vi.useFakeTimers();
    mockDynamicWithStub();

    const { ParticleFieldLazy } = await import(
      "@/components/three/ParticleFieldLazy"
    );
    const { container } = render(<ParticleFieldLazy />);

    // jsdom has no `requestIdleCallback`, so the deferral falls back to a
    // `setTimeout` — advancing fake timers exercises that fallback path.
    await act(async () => {
      vi.runAllTimers();
    });

    expect(container.querySelector("[data-particle-stub]")).not.toBeNull();
    expect(container.querySelector("[data-particle-fallback]")).toBeNull();
  });
});
