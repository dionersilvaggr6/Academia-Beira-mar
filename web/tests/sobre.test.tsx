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

  it("renders the section heading and the academy image", () => {
    render(<Sobre />);
    expect(
      screen.getByRole("heading", { name: /Sobre nós/i }),
    ).toBeInTheDocument();
    expect(screen.getByAltText(/Academia Beira Mar/i)).toBeInTheDocument();
  });
});
