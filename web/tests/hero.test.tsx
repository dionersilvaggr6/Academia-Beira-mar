/// <reference types="vitest" />

import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/sections/Hero";

// Hero no longer mounts ParticleFieldLazy directly — the 3D particle field
// is now a single global background mounted in app/layout.tsx — so no mock
// for it is needed here anymore.

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
