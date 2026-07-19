import { describe, expect, it } from "vitest";
import { waLink } from "@/lib/whatsapp";

describe("waLink", () => {
  it("usa o número oficial", () => {
    expect(waLink()).toContain("https://wa.me/5551997442463");
  });

  it("inclui o plano na mensagem, url-encoded", () => {
    const url = waLink({ plano: "Anual à Vista" });
    expect(url).toContain("Anual%20%C3%A0%20Vista");
  });
});
