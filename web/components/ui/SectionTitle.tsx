import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-3xl font-extrabold uppercase tracking-tight text-bm-cream md:text-4xl">
      <span className="border-bm-orange border-b-4 pb-1">{children}</span>
    </h2>
  );
}
