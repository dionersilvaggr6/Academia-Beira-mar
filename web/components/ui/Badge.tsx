import { cn } from "@/lib/ui/cn";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-sans text-fg-dim text-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}
