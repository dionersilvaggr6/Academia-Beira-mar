import * as THREE from "three";

/**
 * Deterministic pseudo-random value in [0, 1) for a given seed.
 * Keeps shape generation pure (no `Math.random()`) so the same `count`
 * always produces the same cloud — easier to reason about and to test.
 */
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function writePoint(
  target: Float32Array,
  index: number,
  x: number,
  y: number,
  z: number,
): void {
  target[index * 3] = x;
  target[index * 3 + 1] = y;
  target[index * 3 + 2] = z;
}

/** Evenly distributes `total` points across a sphere surface (golden-angle spiral). */
function fibonacciSpherePoint(
  i: number,
  total: number,
  radius: number,
): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = total <= 1 ? 0 : 1 - (i / (total - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * i;
  return [
    Math.cos(theta) * r * radius,
    y * radius,
    Math.sin(theta) * r * radius,
  ];
}

/** Haltere (dumbbell): two spheres joined by a bar, lying along the x axis. */
export function dumbbellPositions(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const sphereShare = Math.floor(count * 0.34);
  const barStart = sphereShare * 2;
  const barShare = count - barStart;
  const sphereRadius = 0.5;
  const offset = 1.15;

  for (let i = 0; i < sphereShare; i++) {
    const [x, y, z] = fibonacciSpherePoint(i, sphereShare, sphereRadius);
    writePoint(out, i, x - offset, y, z);
    writePoint(out, sphereShare + i, x + offset, y, z);
  }
  for (let i = 0; i < barShare; i++) {
    const t = barShare <= 1 ? 0.5 : i / (barShare - 1);
    const x = THREE.MathUtils.lerp(-offset, offset, t);
    const angle = i * 2.399963; // golden angle spread around the bar
    const radius = 0.1 + 0.05 * hash(i + 5.5);
    writePoint(
      out,
      barStart + i,
      x,
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
    );
  }
  return out;
}

/** Coração (heart): classic parametric heart curve, filled toward the center. */
export function heartPositions(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const scale = 0.095;
  const verticalLift = 0.5; // recenters the curve, which sits low around the origin

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    const fill = Math.sqrt(hash(i + 0.5)); // biases toward the outline for a fuller silhouette
    const z = (hash(i + 99.1) - 0.5) * 0.25;
    writePoint(out, i, hx * scale * fill, hy * scale * fill + verticalLift, z);
  }
  return out;
}

/** Pin (map marker): a ringed head tapering into a pointed tail. */
export function pinPositions(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  const headShare = Math.floor(count * 0.6);
  const tailShare = count - headShare;
  const headCenterY = 0.55;
  const headOuterRadius = 0.62;
  const headInnerRadius = 0.26;
  const tailTopY = headCenterY - headOuterRadius + 0.1;
  const tailTipY = -1.3;

  for (let i = 0; i < headShare; i++) {
    const angle = i * 2.399963;
    const radius = THREE.MathUtils.lerp(
      headInnerRadius,
      headOuterRadius,
      hash(i + 3.3),
    );
    const x = Math.cos(angle) * radius;
    const y = headCenterY + Math.sin(angle) * radius;
    const z = (hash(i + 7.7) - 0.5) * 0.2;
    writePoint(out, i, x, y, z);
  }
  for (let i = 0; i < tailShare; i++) {
    const t = tailShare <= 1 ? 0 : i / (tailShare - 1);
    const y = THREE.MathUtils.lerp(tailTopY, tailTipY, t);
    const width = headOuterRadius * 0.75 * (1 - t) ** 1.4;
    const x = (hash(i + 11.7) - 0.5) * 2 * width;
    const z = (hash(i + 21.3) - 0.5) * 0.2 * (1 - t);
    writePoint(out, headShare + i, x, y, z);
  }
  return out;
}

/** Fallback used only if `document`/canvas 2D context is unavailable (should not happen client-side). */
function blockLetterFallback(count: number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const x = THREE.MathUtils.lerp(-1.4, 1.4, hash(i + 1.1));
    const y = THREE.MathUtils.lerp(-0.6, 0.6, hash(i + 2.2));
    const z = (hash(i + 3.3) - 0.5) * 0.2;
    writePoint(out, i, x, y, z);
  }
  return out;
}

/** Rasterizes `text` on an offscreen canvas and samples `count` particle positions from the lit pixels. */
function sampleTextPositions(count: number, text: string): Float32Array | null {
  if (typeof document === "undefined") return null;
  const width = 256;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 96px system-ui, sans-serif";
  ctx.fillText(text, width / 2, height / 2 + 4);

  const { data } = ctx.getImageData(0, 0, width, height);
  const lit: Array<[number, number]> = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3] ?? 0;
      if (alpha > 128) lit.push([x, y]);
    }
  }
  if (lit.length === 0) return null;

  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pixel = lit[Math.floor(hash(i + 0.17) * lit.length) % lit.length] ?? [
      width / 2,
      height / 2,
    ];
    const [px, py] = pixel;
    const nx = (px / width - 0.5) * 2;
    const ny = -(py / height - 0.5) * 2;
    const jitter = (hash(i + 44.4) - 0.5) * 0.02;
    const z = (hash(i + 55.5) - 0.5) * 0.15;
    writePoint(out, i, nx * 1.55 + jitter, ny * 0.8 + jitter, z);
  }
  return out;
}

/** Wordmark "BM": sampled from the rendered glyphs so it reads as actual letterforms. */
export function wordmarkPositions(count: number): Float32Array {
  return sampleTextPositions(count, "BM") ?? blockLetterFallback(count);
}

export type TargetShapes = readonly [
  Float32Array,
  Float32Array,
  Float32Array,
  Float32Array,
];

/** The 4 morph targets in loop order: haltere → coração → pin → wordmark → (back to haltere). */
export function buildTargetShapes(count: number): TargetShapes {
  return [
    dumbbellPositions(count),
    heartPositions(count),
    pinPositions(count),
    wordmarkPositions(count),
  ];
}
