import { cn } from "@/lib/ui/cn";

type Tone = "dim" | "strong" | "flame";

// `cn()` is a plain string join (no tailwind-merge), so two classes for the
// same CSS property — one here, one from a caller's `className` — don't
// reliably "last one wins": Tailwind's generated stylesheet order decides,
// not the order in the `class` attribute. Every color/border utility for
// each tone lives together here so callers never need to pass a competing
// bg-*/text-*/border-* class (that's what silently broke the "MELHOR
// OFERTA" badge: `bg-flame` from a caller lost to this component's own
// `bg-white/5`).
const tones: Record<Tone, string> = {
  dim: "border-white/10 bg-white/5 text-fg-dim",
  strong: "border-white/10 bg-white/5 text-fg",
  flame: "border-flame/40 bg-flame text-ink",
};

export function Badge({
  tone = "dim",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-xs",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
