"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { particleCount } from "@/lib/device";
import { CanvasBoundary } from "./CanvasBoundary";
import { ParticleFallback } from "./ParticleFallback";
import { buildTargetShapes } from "./particle-shapes";

// Re-exported for back-compat with anything importing the fallback from here.
export { ParticleFallback };

const SECONDS_PER_SHAPE = 6.5;
const POINTER_DAMPING = 4;
// Mirror app/globals.css `--color-flame` / `--color-flame-hi` as a safety net
// in case the CSS custom properties can't be read (e.g. no `document`).
const FLAME_FALLBACK = "#ff6a2b";
const FLAME_HI_FALLBACK = "#ffa15e";

// Feature-detects WebGL before we ever try to mount `<Canvas>`. Motion being
// allowed (not `reduced`) doesn't imply the browser/GPU can actually give us
// a WebGL context (headless CI, locked-down GPUs, some in-app webviews).
function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function readCssColor(variableName: string, fallback: string): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return new THREE.Color(value || fallback);
}

function MorphingPoints({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const pointerSmoothed = useRef({ x: 0, y: 0 });

  const shapes = useMemo(() => buildTargetShapes(count), [count]);
  const positions = useMemo(() => shapes[0].slice(), [shapes]);
  const flameColor = useMemo(
    () => readCssColor("--color-flame", FLAME_FALLBACK),
    [],
  );
  const flameHiColor = useMemo(
    () => readCssColor("--color-flame-hi", FLAME_HI_FALLBACK),
    [],
  );

  useFrame((state, delta) => {
    const positionAttribute = pointsRef.current?.geometry.attributes.position;
    if (positionAttribute instanceof THREE.BufferAttribute) {
      const t = (state.clock.elapsedTime / SECONDS_PER_SHAPE) % shapes.length;
      const segment = Math.floor(t);
      const nextSegment = (segment + 1) % shapes.length;
      const k = t - segment;
      const from = shapes[segment];
      const to = shapes[nextSegment];
      if (from && to) {
        const array = positionAttribute.array;
        for (let i = 0; i < array.length; i++) {
          array[i] = THREE.MathUtils.lerp(from[i] ?? 0, to[i] ?? 0, k);
        }
        positionAttribute.needsUpdate = true;
      }
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
      pointerSmoothed.current.x = THREE.MathUtils.damp(
        pointerSmoothed.current.x,
        state.pointer.x,
        POINTER_DAMPING,
        delta,
      );
      pointerSmoothed.current.y = THREE.MathUtils.damp(
        pointerSmoothed.current.y,
        state.pointer.y,
        POINTER_DAMPING,
        delta,
      );
      pointsRef.current.rotation.x = pointerSmoothed.current.y * 0.15;
      pointsRef.current.rotation.z = pointerSmoothed.current.x * -0.1;
    }

    if (materialRef.current) {
      const colorMix = (Math.sin(state.clock.elapsedTime * 0.3) + 1) / 2;
      materialRef.current.color.lerpColors(flameColor, flameHiColor, colorMix);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.028}
        sizeAttenuation
        transparent
        opacity={0.85}
        color={FLAME_FALLBACK}
      />
    </points>
  );
}

export default function ParticleField() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const [webglSupported, setWebglSupported] = useState(true);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCount(particleCount(window.innerWidth, !!reduced));
    setWebglSupported(hasWebGL());
  }, [reduced]);

  // Pause the render loop whenever the hero scrolls out of view. The
  // container div is always mounted (see below), so this ref never goes
  // stale across the reduced/webgl/count state transitions above.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showCanvas = !reduced && count > 0 && webglSupported;

  return (
    <div ref={containerRef} className="absolute inset-0 -z-10" aria-hidden>
      {showCanvas ? (
        <CanvasBoundary>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            frameloop={visible ? "always" : "never"}
          >
            <MorphingPoints count={count} />
          </Canvas>
        </CanvasBoundary>
      ) : (
        <ParticleFallback />
      )}
    </div>
  );
}
