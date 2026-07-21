import { cn } from "@/lib/ui/cn";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("rounded-xl border p-6", className)}
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
