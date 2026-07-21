import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Contacto } from "@/components/sections/Contacto";
import { SITE } from "@/content/site";

describe("Contacto", () => {
  it("renders the form fields nome/telefone/interesse", () => {
    render(<Contacto />);
    expect(screen.getByPlaceholderText("O teu nome")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Telefone / WhatsApp"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Plano ou modalidade (opcional)"),
    ).toBeInTheDocument();
  });

  it("shows the submit button in its initial (not pending) state", () => {
    render(<Contacto />);
    const button = screen.getByRole("button", { name: "Quero começar" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("shows the WhatsApp fallback link with SITE.whatsappDisplay", () => {
    render(<Contacto />);
    expect(
      screen.getByText(SITE.whatsappDisplay, { exact: false }),
    ).toBeInTheDocument();
  });

  it("does not render the success message before submission", () => {
    render(<Contacto />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
