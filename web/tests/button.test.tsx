import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLink } from "@/components/ui/Button";

describe("Button size", () => {
  it("defaults to the md size (unchanged desktop padding/type)", () => {
    render(<Button>Enviar</Button>);
    const btn = screen.getByRole("button", { name: "Enviar" });
    expect(btn.className).toContain("px-6");
    expect(btn.className).toContain("py-3");
    expect(btn.className).toContain("text-base");
  });

  it("size='compact' shrinks padding/height on mobile but restores the md look at md:", () => {
    render(<Button size="compact">Matricular</Button>);
    const btn = screen.getByRole("button", { name: "Matricular" });
    expect(btn.className).toContain("min-h-10");
    expect(btn.className).toContain("px-3");
    expect(btn.className).toContain("py-2");
    expect(btn.className).toContain("text-sm");
    // desktop must render identically to today's (bugged-but-shipped) size
    expect(btn.className).toContain("md:px-6");
    expect(btn.className).toContain("md:py-3");
  });
});

describe("ButtonLink size", () => {
  it("supports the same size prop as Button", () => {
    render(
      <ButtonLink href="/x" size="compact">
        Eu quero
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Eu quero" });
    expect(link.className).toContain("min-h-10");
    expect(link.className).toContain("px-3");
  });
});
