"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { particleCount } from "@/lib/device";
import { buildTargetShapes } from "./particle-shapes";

const SECONDS_PER_SHAPE = 6.5;
const POINTER_DAMPING = 4;
// Mirror app/globals.css `--color-flame` / `--color-flame-hi` as a safety net
// in case the CSS custom properties can't be read (e.g. no `document`).
const FLAME_FALLBACK = "#ff6a2b";
const FLAME_HI_FALLBACK = "#ffa15e";

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

export default function ParticleField() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(particleCount(window.innerWidth, !!reduced));
  }, [reduced]);

  if (reduced || count === 0) return <ParticleFallback />;

  return (
    <div className="absolute inset-0 -z-10" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <MorphingPoints count={count} />
      </Canvas>
    </div>
  );
}
