"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Framer's JS-driven transforms (fadeUp, whileHover, ...) don't read the CSS
// `prefers-reduced-motion` media query on their own. `reducedMotion="user"`
// makes every `motion.*` element in the tree honor the user's OS setting,
// matching the CSS-only reduced-motion rule already applied elsewhere.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
