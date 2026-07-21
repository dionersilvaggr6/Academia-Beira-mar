import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
      p: ({
        children,
        ...props
      }: { children?: React.ReactNode } & Record<string, unknown>) => (
        <p {...stripMotionProps(props)}>{children}</p>
      ),
    },
  };
});

import { Planos } from "@/components/sections/Planos";

describe("Planos", () => {
  it("shows Anual à Vista and the destaque badge by default (recorrente)", () => {
    render(<Planos />);

    expect(screen.getByText("Anual à Vista")).toBeInTheDocument();
    expect(screen.getByText("MELHOR OFERTA")).toBeInTheDocument();
  });

  it("shows Diária once toggled to Avulso", () => {
    render(<Planos />);

    fireEvent.click(screen.getByRole("button", { name: "Avulso" }));

    expect(screen.getByText("Diária")).toBeInTheDocument();
  });
});
