import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SITE } from "@/content/site";

// The generated gallery images don't exist yet (produced by a later task).
// Stub next/image the same way tests/modalidades.test.tsx does, so jsdom
// renders a plain <img> instead of warning about missing dimensions.
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

describe("Galeria", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@/content/site");
  });

  it("renders 6 gallery images when SITE.flags.galeria is true", async () => {
    const { Galeria } = await import("@/components/sections/Galeria");
    render(<Galeria />);

    expect(screen.getAllByRole("img")).toHaveLength(6);
  });

  it("opens an accessible lightbox on click and closes on Escape", async () => {
    const { Galeria } = await import("@/components/sections/Galeria");
    render(<Galeria />);

    const [firstThumb] = screen.getAllByRole("button");
    expect(firstThumb).toBeDefined();
    if (firstThumb) fireEvent.click(firstThumb);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("returns focus to the thumbnail that opened the lightbox on close", async () => {
    const { Galeria } = await import("@/components/sections/Galeria");
    render(<Galeria />);

    const thumbs = screen.getAllByRole("button");
    const secondThumb = thumbs[1];
    expect(secondThumb).toBeDefined();
    if (secondThumb) fireEvent.click(secondThumb);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(secondThumb).toHaveFocus();
  });

  it("closes the lightbox on backdrop click", async () => {
    const { Galeria } = await import("@/components/sections/Galeria");
    render(<Galeria />);

    const [firstThumb] = screen.getAllByRole("button");
    if (firstThumb) fireEvent.click(firstThumb);

    const dialog = screen.getByRole("dialog");
    const backdrop = dialog.parentElement;
    expect(backdrop).not.toBeNull();
    if (backdrop) fireEvent.click(backdrop);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when SITE.flags.galeria is false", async () => {
    vi.doMock("@/content/site", () => ({
      SITE: { ...SITE, flags: { ...SITE.flags, galeria: false } },
    }));
    vi.resetModules();

    const { Galeria } = await import("@/components/sections/Galeria");
    const { container } = render(<Galeria />);

    expect(container).toBeEmptyDOMElement();
  });
});
