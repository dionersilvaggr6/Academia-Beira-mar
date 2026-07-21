import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

type AnimateOptions = {
  duration: number;
  ease: readonly number[];
  onUpdate: (latest: number) => void;
};
type AnimateControls = { stop: () => void };

const useReducedMotionMock = vi.fn<() => boolean>();
const animateMock =
  vi.fn<
    (from: number, to: number, options: AnimateOptions) => AnimateControls
  >();

// Counter drives its animation off `useInView`/`useReducedMotion`/`animate`.
// Stub them directly (rather than the whole framer-motion surface used by
// other sections) so we can flip each axis independently per test — see
// tests/stats.test.tsx for the same reduced-motion-first stubbing approach.
vi.mock("framer-motion", () => ({
  useInView: () => true,
  useReducedMotion: () => useReducedMotionMock(),
  animate: (from: number, to: number, options: AnimateOptions) =>
    animateMock(from, to, options),
}));

import { Counter } from "@/components/ui/Counter";

afterEach(() => {
  vi.clearAllMocks();
});

describe("Counter", () => {
  it("renders values with a non-numeric suffix/prefix verbatim under reduced motion", () => {
    useReducedMotionMock.mockReturnValue(true);

    render(<Counter value="5★" />);
    render(<Counter value="+5.700" />);

    expect(screen.getByText("5★")).toBeInTheDocument();
    expect(screen.getByText("+5.700")).toBeInTheDocument();
  });

  it("shows the final value immediately when reduced motion is preferred", () => {
    useReducedMotionMock.mockReturnValue(true);

    render(<Counter value="120" />);

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(animateMock).not.toHaveBeenCalled();
  });

  it("animates to the final formatted numeric value once in view", () => {
    useReducedMotionMock.mockReturnValue(false);
    animateMock.mockImplementation((_from, to, options) => {
      options.onUpdate(to);
      return { stop: vi.fn() };
    });

    render(<Counter value="+5.700" />);

    expect(animateMock).toHaveBeenCalledWith(0, 5700, expect.anything());
    expect(screen.getByText("+5.700")).toBeInTheDocument();
  });

  it("stops the running animation on unmount", () => {
    useReducedMotionMock.mockReturnValue(false);
    const stop = vi.fn();
    animateMock.mockReturnValue({ stop });

    const { unmount } = render(<Counter value="42" />);
    unmount();

    expect(stop).toHaveBeenCalledOnce();
  });
});
