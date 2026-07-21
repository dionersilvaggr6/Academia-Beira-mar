import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SITE } from "@/content/site";

// Reduced-motion path skips useInView/animate entirely, keeping jsdom stable
// (no IntersectionObserver polyfill needed) and rendering final values.
vi.mock("framer-motion", () => ({
  useInView: () => false,
  useReducedMotion: () => true,
  animate: () => ({ stop: () => {} }),
}));

import { Stats } from "@/components/sections/Stats";

describe("Stats", () => {
  it("renders all SITE.stats labels", () => {
    render(<Stats />);

    for (const stat of SITE.stats) {
      expect(screen.getByText(stat.rotulo)).toBeInTheDocument();
    }
  });
});
