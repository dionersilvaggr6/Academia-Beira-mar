"use client";

import dynamic from "next/dynamic";
import { ParticleFallback } from "./ParticleFallback";

const ParticleField = dynamic(() => import("./ParticleField"), {
  ssr: false,
  loading: () => <ParticleFallback />,
});

export function ParticleFieldLazy() {
  return <ParticleField />;
}
