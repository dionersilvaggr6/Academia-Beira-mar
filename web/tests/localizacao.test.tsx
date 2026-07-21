import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Localizacao } from "@/components/sections/Localizacao";
import { SITE } from "@/content/site";

describe("Localizacao", () => {
  it("renders address and hours", () => {
    render(<Localizacao />);
    expect(screen.getByText(SITE.address)).toBeInTheDocument();
    for (const h of SITE.hours) {
      expect(screen.getByText(h.dias)).toBeInTheDocument();
    }
  });

  it('shows the "mais movimentado às 20h" note', () => {
    render(<Localizacao />);
    expect(screen.getByText(/20h/)).toBeInTheDocument();
  });

  it("renders the map iframe", () => {
    render(<Localizacao />);
    const iframe = screen.getByTitle(/mapa/i);
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute("loading", "lazy");
  });
});
