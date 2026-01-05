export type AvatarStateVector = {
  arousal: number // 0..1
  valence: number // -1..1
  cognitiveLoad: number // 0..1
  rhythm: number // 0..1
  entropy: number // 0..1 (internally clamped to 0.02..0.08)
  focus: number // 0..1
}

export function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(1, x))
}

export function clampRange(x: number, min: number, max: number): number {
  if (!Number.isFinite(x)) return min
  return Math.max(min, Math.min(max, x))
}

export function clampValence(x: number): number {
  return clampRange(x, -1, 1)
}

export function clampEntropy(x: number): number {
  return clampRange(x, 0.02, 0.08)
}
