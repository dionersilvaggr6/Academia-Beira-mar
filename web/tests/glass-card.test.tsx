import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlassCard } from "@/components/ui/GlassCard";

describe("GlassCard padding", () => {
  it("defaults to p-6 (unchanged for every existing consumer)", () => {
    const { container } = render(<GlassCard>conteúdo</GlassCard>);
    expect(container.firstElementChild?.className).toContain("p-6");
  });

  it("accepts a custom padding to compact a card (e.g. mobile plan cards)", () => {
    const { container } = render(
      <GlassCard padding="p-4 md:p-6">conteúdo</GlassCard>,
    );
    const el = container.firstElementChild;
    expect(el?.className).toContain("p-4");
    expect(el?.className).toContain("md:p-6");
  });
});
