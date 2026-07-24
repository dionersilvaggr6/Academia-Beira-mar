export function particleCount(width: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  // Kept low deliberately — the per-frame morph/rotation math in
  // ParticleField runs over every point, so this count directly drives its
  // main-thread cost (Lighthouse TBT/bootup-time on lower-end devices).
  return width < 768 ? 800 : 2200;
}
