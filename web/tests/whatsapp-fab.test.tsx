import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/whatsapp", () => ({
  waLink: () => "https://wa.me/5551997442463",
}));

import { WhatsappFab } from "@/components/layout/WhatsappFab";

describe("WhatsappFab", () => {
  it("renders a link to waLink() with the expected accessibility attributes", () => {
    render(<WhatsappFab />);

    const link = screen.getByRole("link", { name: /Falar no WhatsApp/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://wa.me/5551997442463");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
