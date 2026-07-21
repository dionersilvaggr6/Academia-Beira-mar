// Deliberately has ZERO `three` / `@react-three/fiber` imports.
// `ParticleFieldLazy.tsx` renders this eagerly (as the `next/dynamic` loading
// state), so pulling the heavy 3D deps in here would defeat the lazy-loading
// of `ParticleField.tsx`.
export function ParticleFallback() {
  return (
    <div
      data-particle-fallback
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(circle at 70% 20%, var(--flame-glow), transparent 55%)",
      }}
    />
  );
}
