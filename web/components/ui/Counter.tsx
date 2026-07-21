"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type ParsedValue = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
};

// Matches an optional non-numeric prefix, a numeric run (digits + "." "," as
// thousands/decimal separators), and an optional non-numeric suffix — e.g.
// "+5.700" -> ("+", "5.700", ""), "5★" -> ("", "5", "★"), "100%" -> ("", "100", "%").
const NUMERIC_PATTERN = /^(\D*)(\d[\d.,]*)(\D*)$/;

function parseValue(value: string): ParsedValue | null {
  const match = value.match(NUMERIC_PATTERN);
  if (!match) return null;

  const [, prefix = "", digits = "", suffix = ""] = match;
  const decimalMatch = digits.match(/,(\d+)$/);
  const decimals = decimalMatch?.[1] ? decimalMatch[1].length : 0;
  const normalized = digits.replace(/\./g, "").replace(",", ".");
  const target = Number(normalized);

  if (Number.isNaN(target)) return null;

  return { prefix, suffix, target, decimals };
}

function formatValue(parsed: ParsedValue, current: number): string {
  const formatted = current.toLocaleString("pt-BR", {
    minimumFractionDigits: parsed.decimals,
    maximumFractionDigits: parsed.decimals,
  });
  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

export function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reducedMotion = useReducedMotion();
  const parsed = useMemo(() => parseValue(value), [value]);
  const [display, setDisplay] = useState(() =>
    parsed ? formatValue(parsed, 0) : value,
  );

  useEffect(() => {
    if (!parsed || reducedMotion || !isInView) return;

    const controls = animate(0, parsed.target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(formatValue(parsed, latest)),
    });

    return () => controls.stop();
  }, [isInView, parsed, reducedMotion]);

  // Non-numeric values (or explicit reduced-motion preference) render as-is.
  if (!parsed || reducedMotion) {
    return <span ref={ref}>{value}</span>;
  }

  return <span ref={ref}>{display}</span>;
}
