// Deterministic “gaze” direction derived from focus + time.
// No randomness. Stable, smooth, bounded.
export type Vec3 = [number, number, number];

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function norm(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

// focus: 0..1, time: seconds
export function gazeFromFocus(focus: number, time: number): Vec3 {
  // Base direction slowly precesses so it’s never static
  const pre = 0.22 + 0.55 * focus; // speed increases with focus
  const a = time * pre;

  // Deterministic direction field (no random)
  const x = Math.sin(a) * (0.35 + 0.45 * focus);
  const y = Math.cos(a * 0.73) * (0.18 + 0.22 * focus);
  const z = 0.65; // forward bias so it reads as “facing you”

  return norm([x, y, z]);
}

export function gazeStrength(focus: number): number {
  // ensures effect is present but bounded even at focus=1
  return clamp(0.06 + 0.14 * focus, 0.06, 0.20);
}
