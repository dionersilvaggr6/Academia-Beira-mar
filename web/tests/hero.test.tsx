/// <reference types="vitest" />

import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Hero } from "@/components/sections/Hero";

// Mock the ParticleFieldLazy component so it doesn't try to mount WebGL
vi.mock("@/components/three/ParticleFieldLazy", () => ({
  ParticleFieldLazy: () => <div data-testid="particle-field" />,
}));

describe("Hero", () => {
  it("renders headline with 'evoluímos' text", () => {
    render(<Hero />);
    expect(screen.getByText(/evoluímos/i)).toBeInTheDocument();
  });

  it("renders two CTA links", () => {
    render(<Hero />);
    const matricularLink = screen.getByRole("link", {
      name: /Matricular agora/i,
    });
    const planosLink = screen.getByRole("link", { name: /Ver planos/i });

    expect(matricularLink).toBeInTheDocument();
    expect(planosLink).toBeInTheDocument();
  });
});
