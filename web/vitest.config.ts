import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      exclude: [
        "node_modules/**",
        "tests/**",
        "e2e/**",
        "**/*.config.*",
        ".next/**",
        "coverage/**",
        // Render-only 3D / animation wrappers: no meaningful branch logic to
        // unit-test in jsdom (no WebGL, no real rAF loop). The pure shape
        // math they depend on (particle-shapes.ts) IS covered separately.
        // ParticleFieldLazy's idle-after-load deferral IS covered (see
        // tests/particle-field-lazy.test.tsx), so it's no longer excluded.
        "components/three/ParticleField.tsx",
        "components/three/CanvasBoundary.tsx",
        "components/MotionProvider.tsx",
      ],
    },
  },
});
