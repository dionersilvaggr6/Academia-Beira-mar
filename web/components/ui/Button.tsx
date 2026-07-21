import { cn } from "@/lib/ui/cn";

type Common = {
  variant?: "primary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-sans font-bold transition disabled:opacity-60";

const styles = {
  primary:
    "bg-flame text-ink hover:brightness-110 shadow-[0_0_28px_var(--flame-glow)]",
  ghost: "border border-white/20 text-fg hover:border-flame",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...rest
}: Common & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(base, styles[variant], className)} {...rest}>
      {children}
    </a>
  );
}
