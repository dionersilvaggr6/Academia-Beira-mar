import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/content/site";

describe("Footer", () => {
  it("renders the wordmark", () => {
    render(<Footer />);
    expect(screen.getByText("BEIRA MAR")).toBeInTheDocument();
  });

  it("shows SITE.whatsappDisplay", () => {
    render(<Footer />);
    expect(
      screen.getByText(SITE.whatsappDisplay, { exact: false }),
    ).toBeInTheDocument();
  });

  it("shows the Instagram handle and address", () => {
    render(<Footer />);
    expect(
      screen.getByText(SITE.instagramHandle, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(SITE.address)).toBeInTheDocument();
  });

  it("shows SITE.hours entries", () => {
    render(<Footer />);
    for (const h of SITE.hours) {
      expect(screen.getByText(`${h.dias}: ${h.horas}`)).toBeInTheDocument();
    }
  });
});
