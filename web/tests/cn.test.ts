import { describe, expect, it } from "vitest";
import { cn } from "@/lib/ui/cn";

describe("cn", () => {
  it("junta e ignora falsy", () => {
    expect(cn("a", false, null, "b", undefined)).toBe("a b");
  });
});
