import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionProvider } from "@/components/MotionProvider";

describe("MotionProvider", () => {
  it("renders its children unchanged", () => {
    render(
      <MotionProvider>
        <p>conteúdo</p>
      </MotionProvider>,
    );
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });
});
