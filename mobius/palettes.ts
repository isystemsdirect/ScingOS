export type RGB = { r: number; g: number; b: number }; // 0..1

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}
function mix(a: RGB, b: RGB, t: number): RGB {
  const u = clamp01(t);
  return { r: lerp(a.r, b.r, u), g: lerp(a.g, b.g, u), b: lerp(a.b, b.b, u) };
}

// Canon palette anchors (tweak later, but keep family identity)
const SCING: RGB[] = [
  { r: 0.10, g: 0.35, b: 1.00 }, // blue
  { r: 0.55, g: 0.10, b: 1.00 }, // violet
  { r: 1.00, g: 0.00, b: 0.75 }, // magenta
];

const LARI: RGB[] = [
  { r: 1.00, g: 0.78, b: 0.10 }, // golden yellow
  { r: 1.00, g: 1.00, b: 0.15 }, // neon yellow
  { r: 1.00, g: 0.45, b: 0.05 }, // neon orange
  { r: 0.65, g: 1.00, b: 0.10 }, // neon lime green
];

const BANE: RGB[] = [
  { r: 1.00, g: 0.05, b: 0.05 }, // red
  { r: 1.00, g: 0.20, b: 0.20 }, // neon red
  { r: 0.75, g: 0.10, b: 1.00 }, // neon purple
  { r: 1.00, g: 1.00, b: 1.00 }, // white
];

function sampleStops(stops: RGB[], t01: number): RGB {
  const t = clamp01(t01);
  const n = stops.length;
  if (n === 1) return stops[0];
  const x = t * (n - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = stops[Math.max(0, Math.min(n - 1, i))];
  const b = stops[Math.max(0, Math.min(n - 1, i + 1))];
  return mix(a, b, f);
}

export type PhaseFamily = 'SCING' | 'LARI' | 'BANE';

export function colorFromPhase(opts: {
  family: PhaseFamily;
  phase: number; // 0..2π (wrapped elsewhere OK)
  invertedLatched: boolean;
}): RGB {
  const { family, phase, invertedLatched } = opts;
  const PI = Math.PI;
  const TAU = PI * 2;

  // normalize phase into family-local 0..1
  const p = ((phase % TAU) + TAU) % TAU;
  const t01 =
    family === 'SCING'
      ? p / TAU
      : invertedLatched
        ? (p - PI) / PI // [π,2π) -> 0..1
        : p / PI; // [0,π)  -> 0..1

  if (family === 'SCING') return sampleStops(SCING, t01);
  if (family === 'LARI') return sampleStops(LARI, t01);
  return sampleStops(BANE, t01);
}

// intensity shaping from inversion amplitude (0..aMax)
export function applyIntensity(base: RGB, a: number): RGB {
  const k = 0.75 + 0.75 * clamp01(a / 1.0);
  return { r: clamp01(base.r * k), g: clamp01(base.g * k), b: clamp01(base.b * k) };
}
