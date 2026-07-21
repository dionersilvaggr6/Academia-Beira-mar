import { fireEvent, render, screen } from "@testing-library/react";
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

  it("advances to the next review's text on next-button click", () => {
    render(<Depoimentos />);

    const [first, second] = SITE.reviews;
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Próximo depoimento" }));

    expect(
      screen.getByText(new RegExp(second?.texto ?? "")),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(first?.texto ?? "")),
    ).not.toBeInTheDocument();
  });

  it("wraps to the last review when going previous from the first slide", () => {
    render(<Depoimentos />);

    const last = SITE.reviews.at(-1);
    expect(last).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", { name: "Depoimento anterior" }),
    );

    expect(screen.getByText(new RegExp(last?.texto ?? ""))).toBeInTheDocument();
  });

  it("jumps directly to a review via its dot indicator", () => {
    render(<Depoimentos />);

    const last = SITE.reviews.at(-1);
    expect(last).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: `Ir para depoimento ${SITE.reviews.length}`,
      }),
    );

    expect(screen.getByText(new RegExp(last?.texto ?? ""))).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `Ir para depoimento ${SITE.reviews.length}`,
      }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("wraps back to the first review after advancing past the last one", () => {
    render(<Depoimentos />);

    const [first] = SITE.reviews;
    expect(first).toBeDefined();

    const next = screen.getByRole("button", { name: "Próximo depoimento" });
    for (let i = 0; i < SITE.reviews.length; i++) {
      fireEvent.click(next);
    }

    expect(
      screen.getByText(new RegExp(first?.texto ?? "")),
    ).toBeInTheDocument();
  });
});
