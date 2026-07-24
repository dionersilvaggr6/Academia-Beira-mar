"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ParticleFallback } from "./ParticleFallback";

const ParticleField = dynamic(() => import("./ParticleField"), {
  ssr: false,
  loading: () => <ParticleFallback />,
});

// How long to wait for an idle slot before mounting anyway — a busy main
// thread (slow devices, lots of hydration work) shouldn't delay the 3D
// background forever.
const IDLE_TIMEOUT_MS = 2000;
// `requestIdleCallback` fallback for browsers that don't support it
// (Safari): a fixed delay well after first paint is a reasonable proxy.
const IDLE_FALLBACK_DELAY_MS = 200;

/**
 * True once the page has fired `load` AND the main thread has reported an
 * idle slot (or the fallback timer elapsed). Kept false for the very first
 * render so SSR/hydration output matches (both render the cheap fallback).
 */
function useIdleAfterLoad(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const scheduleIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(() => setReady(true), {
          timeout: IDLE_TIMEOUT_MS,
        });
      } else {
        timeoutHandle = window.setTimeout(
          () => setReady(true),
          IDLE_FALLBACK_DELAY_MS,
        );
      }
    };

    if (document.readyState === "complete") {
      scheduleIdle();
    } else {
      window.addEventListener("load", scheduleIdle, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleIdle);
      if (idleHandle !== undefined && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  return ready;
}

/**
 * Mounts (and therefore code-splits-in) the heavy three.js particle field
 * only once the page is interactive and idle, so it never competes with
 * LCP/TBT during the critical initial render — see `useIdleAfterLoad`.
 * Renders the cheap CSS-only fallback until then.
 */
export function ParticleFieldLazy() {
  const ready = useIdleAfterLoad();
  if (!ready) return <ParticleFallback />;
  return <ParticleField />;
}
