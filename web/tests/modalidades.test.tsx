import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Real framer-motion's `whileInView` reaches for `IntersectionObserver`, which
// jsdom doesn't provide. Stub the specific `motion.*` tags this section uses
// so children render synchronously without needing a polyfill.
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
      article: ({
        children,
        ...props
      }: { children?: React.ReactNode } & Record<string, unknown>) => (
        <article {...stripMotionProps(props)}>{children}</article>
      ),
    },
  };
});

// The generated modalidade images don't exist yet (produced by a later task).
// next/image would otherwise warn about missing `sizes`/dimensions in jsdom.
vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    fill: _fill,
    sizes: _sizes,
    ...rest
  }: {
    alt: string;
    src: string;
    fill?: boolean;
    sizes?: string;
  } & Record<string, unknown>) => <img alt={alt} src={src} {...rest} />,
}));

import { Modalidades } from "@/components/sections/Modalidades";

describe("Modalidades", () => {
  it("renders the three modalidade titles", () => {
    render(<Modalidades />);

    expect(screen.getByText("Musculação")).toBeInTheDocument();
    expect(screen.getByText("Pilates")).toBeInTheDocument();
    expect(screen.getByText("Funcional")).toBeInTheDocument();
  });
});
