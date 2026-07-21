import { fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { MobileMenu } from "@/components/layout/MobileMenu";

vi.mock("@/lib/whatsapp", () => ({
  waLink: () => "https://wa.me/5551997442463",
}));

/** Mirrors how Header actually wires the menu: a trigger button + state. */
function Harness() {
  const [open, setOpen] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={triggerRef} type="button">
        Abrir menu
      </button>
      {open && (
        <MobileMenu
          onClose={() => setOpen(false)}
          returnFocusRef={triggerRef}
        />
      )}
    </div>
  );
}

describe("MobileMenu", () => {
  it("renders as an accessible dialog", () => {
    render(<Harness />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders the nav anchors, Entrar and the WhatsApp CTA", () => {
    render(<Harness />);
    expect(screen.getByText("Modalidades")).toBeInTheDocument();
    expect(screen.getByText("Planos")).toBeInTheDocument();
    expect(screen.getByText("Depoimentos")).toBeInTheDocument();
    expect(screen.getByText("Onde estamos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Matricular/i })).toHaveAttribute(
      "href",
      "https://wa.me/5551997442463",
    );
  });

  it("moves focus into the panel on open", () => {
    render(<Harness />);
    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it("locks body scroll while open", () => {
    render(<Harness />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on Escape and restores body scroll + focus", () => {
    render(<Harness />);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Abrir menu" }),
    );
  });

  it("closes when a nav link is clicked", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("Modalidades"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
