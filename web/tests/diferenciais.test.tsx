import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SITE } from "@/content/site";

// See tests/modalidades.test.tsx for why framer-motion is stubbed in jsdom.
vi.mock("framer-motion", () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial: _initial,
      animate: _animate,
      whileInView: _whileInView,
      whileHover: _whileHover,
      whileTap: _whileTap,
      viewport: _viewport,
      variants: _variants,
      transition: _transition,
      ...rest
    } = props;
    return rest;
  };

  return {
    motion: {
      div: ({
        children,
        ...props
      }: { children?: React.ReactNode } & Record<string, unknown>) => (
        <div {...stripMotionProps(props)}>{children}</div>
      ),
      h2: ({
        children,
        ...props
      }: { children?: React.ReactNode } & Record<string, unknown>) => (
        <h2 {...stripMotionProps(props)}>{children}</h2>
      ),
    },
  };
});

import { Diferenciais } from "@/components/sections/Diferenciais";

describe("Diferenciais", () => {
  it("renders every SITE.diferenciais item (at least 8)", () => {
    render(<Diferenciais />);

    expect(SITE.diferenciais.length).toBeGreaterThanOrEqual(8);
    for (const item of SITE.diferenciais) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
