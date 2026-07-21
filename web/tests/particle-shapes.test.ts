import { describe, expect, it } from "vitest";
import {
  buildTargetShapes,
  dumbbellPositions,
  heartPositions,
  pinPositions,
  wordmarkPositions,
} from "@/components/three/particle-shapes";

const COUNT = 60;

function expectValidCloud(positions: Float32Array, count: number) {
  expect(positions).toBeInstanceOf(Float32Array);
  expect(positions.length).toBe(count * 3);
  // Every coordinate must be a finite number — a stray NaN/Infinity would
  // silently vanish points (or blow up the morph lerp in ParticleField).
  for (const value of positions) {
    expect(Number.isFinite(value)).toBe(true);
  }
}

describe("particle-shapes", () => {
  describe("dumbbellPositions", () => {
    it("returns count*3 finite coordinates", () => {
      expectValidCloud(dumbbellPositions(COUNT), COUNT);
    });

    it("is deterministic for the same count", () => {
      expect(dumbbellPositions(COUNT)).toEqual(dumbbellPositions(COUNT));
    });

    it("places the two spheres on opposite sides of the x axis", () => {
      const positions = dumbbellPositions(COUNT);
      // First point belongs to the left sphere, its mirrored counterpart to
      // the right sphere (see dumbbellPositions' `sphereShare` split).
      const leftX = positions[0];
      const sphereShare = Math.floor(COUNT * 0.34);
      const rightX = positions[sphereShare * 3];
      expect(leftX).toBeDefined();
      expect(rightX).toBeDefined();
      expect(leftX as number).toBeLessThan(0);
      expect(rightX as number).toBeGreaterThan(0);
    });
  });

  describe("heartPositions", () => {
    it("returns count*3 finite coordinates", () => {
      expectValidCloud(heartPositions(COUNT), COUNT);
    });

    it("is deterministic for the same count", () => {
      expect(heartPositions(COUNT)).toEqual(heartPositions(COUNT));
    });
  });

  describe("pinPositions", () => {
    it("returns count*3 finite coordinates", () => {
      expectValidCloud(pinPositions(COUNT), COUNT);
    });

    it("is deterministic for the same count", () => {
      expect(pinPositions(COUNT)).toEqual(pinPositions(COUNT));
    });

    it("tapers the tail below the head", () => {
      const positions = pinPositions(COUNT);
      const headShare = Math.floor(COUNT * 0.6);
      const headY = positions[1];
      const tailTipY = positions[(COUNT - 1) * 3 + 1];
      expect(headShare).toBeGreaterThan(0);
      expect(headY).toBeDefined();
      expect(tailTipY).toBeDefined();
      expect(tailTipY as number).toBeLessThan(headY as number);
    });
  });

  describe("wordmarkPositions", () => {
    // jsdom has no real canvas 2D backend, so `getContext("2d")` resolves to
    // null and the component falls back to `blockLetterFallback` — still
    // pure and deterministic, which is exactly what we want to lock in here.
    it("returns count*3 finite coordinates via the deterministic fallback", () => {
      expectValidCloud(wordmarkPositions(COUNT), COUNT);
    });

    it("is deterministic for the same count", () => {
      expect(wordmarkPositions(COUNT)).toEqual(wordmarkPositions(COUNT));
    });
  });

  describe("buildTargetShapes", () => {
    it("returns the 4 morph targets, each with count*3 coordinates", () => {
      const shapes = buildTargetShapes(COUNT);

      expect(shapes).toHaveLength(4);
      for (const shape of shapes) {
        expectValidCloud(shape, COUNT);
      }
    });

    it("is deterministic for the same count", () => {
      expect(buildTargetShapes(COUNT)).toEqual(buildTargetShapes(COUNT));
    });
  });
});
