export type RGB = { r: number; g: number; b: number }

/**
 * Color field: derived tendencies (not states).
 * Cognitive density vs spectral expansion are *biases* only.
 */
export function colorFromInfluence(influence: number[]): RGB {
  const mag = influence.reduce((a, b) => a + Math.abs(b), 0) / (influence.length || 1)
  const cognitive = clamp01(1 - mag)
  const spectral = clamp01(mag)

  const r = clamp01(0.95 * cognitive + 0.70 * spectral + (Math.random() - 0.5) * 0.02)
  const g = clamp01(0.55 * cognitive + 0.40 * spectral + (Math.random() - 0.5) * 0.02)
  const b = clamp01(0.10 * cognitive + 0.90 * spectral + (Math.random() - 0.5) * 0.02)

  return { r, g, b }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}
