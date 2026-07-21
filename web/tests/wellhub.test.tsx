import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Wellhub } from "@/components/sections/Wellhub";

describe("Wellhub", () => {
  it('mentions "Wellhub"', () => {
    render(<Wellhub />);

    expect(screen.getAllByText(/Wellhub/i).length).toBeGreaterThan(0);
  });
});
