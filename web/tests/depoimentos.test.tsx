import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SITE } from "@/content/site";

// Reduced-motion path skips the auto-advance interval entirely, keeping jsdom
// stable (no fake timers needed) — see tests/stats.test.tsx for precedent.
vi.mock("framer-motion", () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      variants: _variants,
      transition: _transition,
      ...rest
    } = props;
    return rest;
  };

  return {
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      div: ({
        children,
        ...props
      }: { children?: React.ReactNode } & Record<string, unknown>) => (
        <div {...stripMotionProps(props)}>{children}</div>
      ),
    },
    useReducedMotion: () => true,
  };
});

import { Depoimentos } from "@/components/sections/Depoimentos";

describe("Depoimentos", () => {
  it("shows the first review's text", () => {
    render(<Depoimentos />);

    const [firstReview] = SITE.reviews;
    expect(firstReview).toBeDefined();
    expect(
      screen.getByText(new RegExp(firstReview?.texto ?? "")),
    ).toBeInTheDocument();
  });
});
