import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PersonalTrainer } from "@/components/sections/PersonalTrainer";

describe("PersonalTrainer", () => {
  it('mentions "Personal Trainer" and links to WhatsApp', () => {
    render(<PersonalTrainer />);

    expect(screen.getAllByText(/Personal Trainer/i).length).toBeGreaterThan(0);

    const cta = screen.getByRole("link");
    expect(cta.getAttribute("href")).toContain("wa.me");
  });
});
