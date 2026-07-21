export function particleCount(width: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return width < 768 ? 1500 : 5000;
}
