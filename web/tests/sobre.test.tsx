import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sobre } from "@/components/sections/Sobre";
import { SITE } from "@/content/site";

describe("Sobre", () => {
  it("renders the tagline and the location copy", () => {
    render(<Sobre />);
    expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
    expect(screen.getByText(/Capão da Canoa/i)).toBeInTheDocument();
  });

  it("renders every SITE.diferenciais item", () => {
    render(<Sobre />);
    for (const item of SITE.diferenciais) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
