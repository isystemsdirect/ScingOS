import type { FluxLayer } from "./colorFlux.types";

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

export function normWeights<T extends Pick<FluxLayer, "weight">>(layers: T[]): T[] {
  const sum = layers.reduce((acc, l) => acc + (Number.isFinite(l.weight) ? l.weight : 0), 0);
  if (sum <= 0) return layers;
  return layers.map((l) => ({ ...l, weight: l.weight / sum }));
}

export function hslToCss(v: { h: number; s: number; l: number; a: number }): string {
  const h = Number.isFinite(v.h) ? v.h : 0;
  const s = clamp01(v.s);
  const l = clamp01(v.l);
  const a = clamp01(v.a);
  return `hsla(${h.toFixed(1)}, ${(s * 100).toFixed(1)}%, ${(l * 100).toFixed(1)}%, ${a.toFixed(3)})`;
}

// Future: perceptual color conversion. Stubbed to avoid blocking builds.
export function lchToCss(_v: { l: number; c: number; h: number; a?: number }): string {
  return hslToCss({ h: 0, s: 0, l: 0.5, a: 1 });
}
