import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SITE } from "@/content/site";

describe("LojaTeaser", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@/content/site");
  });

  it('shows "Whey Protein" and a WhatsApp CTA when SITE.flags.loja is true', async () => {
    const { LojaTeaser } = await import("@/components/sections/LojaTeaser");
    render(<LojaTeaser />);

    expect(screen.getByText("Whey Protein")).toBeInTheDocument();
    expect(screen.getByText(/Loja online em breve/i)).toBeInTheDocument();

    const cta = screen.getByRole("link");
    expect(cta.getAttribute("href")).toContain("wa.me");
  });

  it("renders nothing when SITE.flags.loja is false", async () => {
    vi.doMock("@/content/site", () => ({
      SITE: { ...SITE, flags: { ...SITE.flags, loja: false } },
    }));
    vi.resetModules();

    const { LojaTeaser } = await import("@/components/sections/LojaTeaser");
    const { container } = render(<LojaTeaser />);

    expect(container).toBeEmptyDOMElement();
  });
});
