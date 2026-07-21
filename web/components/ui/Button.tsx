import { cn } from "@/lib/ui/cn";

type Variant = "primary" | "ghost";
type Size = "md" | "compact";

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-sans font-bold transition disabled:opacity-60";

// Padding/type live per-size (never alongside a conflicting override in
// `className`) — Tailwind has no reliable "last one wins" guarantee between
// two unprefixed utilities of the same property, so a size is always a
// single, self-contained string.
const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-base",
  // Compact CTAs (header, plan cards): smaller tap target on phones, then
  // reset back to the `md` numbers at `md:` so desktop is byte-for-byte
  // what it already renders today.
  compact: "min-h-10 px-3 py-2 text-sm md:px-6 md:py-3",
};

const styles: Record<Variant, string> = {
  primary:
    "bg-flame text-ink hover:brightness-110 shadow-[0_0_28px_var(--flame-glow)]",
  ghost: "border border-white/20 text-fg hover:border-flame",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, sizes[size], styles[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Common & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(base, sizes[size], styles[variant], className)} {...rest}>
      {children}
    </a>
  );
}
