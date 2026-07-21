"use client";

import { Component, type ReactNode } from "react";
import { ParticleFallback } from "./ParticleFallback";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Catches render/mount errors thrown by `<Canvas>` (e.g. a WebGL context
 * that fails to initialize despite our upfront `hasWebGL()` check) so a
 * crash in the 3D layer never unmounts the rest of the page — it degrades
 * to `ParticleFallback` instead.
 */
export class CanvasBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error("ParticleField failed to render:", error);
  }

  render() {
    if (this.state.hasError) return <ParticleFallback />;
    return this.props.children;
  }
}
