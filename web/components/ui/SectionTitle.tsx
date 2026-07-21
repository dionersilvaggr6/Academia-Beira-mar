import type { ReactNode } from "react";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-3xl font-extrabold uppercase tracking-tight text-fg md:text-4xl">
      <span className="border-flame border-b-4 pb-1">{children}</span>
    </h2>
  );
}
