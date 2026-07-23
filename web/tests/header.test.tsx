import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/Header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/",
}));

describe("Header", () => {
  it("renders BEIRA MAR text", () => {
    render(<Header />);
    expect(screen.getByText("BEIRA MAR")).toBeInTheDocument();
  });

  it("'Matricular' leva ao checkout, não mais direto ao WhatsApp", () => {
    render(<Header />);
    const matricularLink = screen.getByRole("link", { name: /Matricular/i });
    expect(matricularLink).toBeInTheDocument();
    expect(matricularLink).toHaveAttribute("href", "/checkout");
    expect(matricularLink).not.toHaveAttribute("target");
  });

  it("renders login link", () => {
    render(<Header />);
    const loginLink = screen.getByRole("link", { name: /Entrar/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders navigation items", () => {
    render(<Header />);
    expect(screen.getByText("Modalidades")).toBeInTheDocument();
    expect(screen.getByText("Planos")).toBeInTheDocument();
    expect(screen.getByText("Depoimentos")).toBeInTheDocument();
    expect(screen.getByText("Onde estamos")).toBeInTheDocument();
  });

  it("uses root-relative anchors so nav still works from other routes", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Modalidades" })).toHaveAttribute(
      "href",
      "/#modalidades",
    );
    expect(screen.getByRole("link", { name: "BEIRA MAR" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders a closed mobile menu toggle by default", () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /abrir menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the mobile menu when the toggle is clicked", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /fechar menu/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
