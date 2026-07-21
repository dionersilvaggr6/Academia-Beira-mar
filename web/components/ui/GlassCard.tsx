import { cn } from "@/lib/ui/cn";

export function GlassCard({
  className,
  padding = "p-6",
  children,
}: {
  className?: string;
  /** Override the default `p-6` — e.g. a tighter mobile-first pad for compact cards. */
  padding?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("rounded-xl border", padding, className)}
      style={{
        background: "var(--glass-bg)",
        borderColor: "var(--glass-border)",
        backdropFilter: "blur(var(--glass-blur))",
      }}
    >
      {children}
    </div>
  );
}
