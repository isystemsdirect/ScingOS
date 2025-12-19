export type PhaseChannel = 'SCING' | 'LARI' | 'BANE'

export type PhasePalette = {
  channel: PhaseChannel
  colors: Array<[number, number, number]>
}

// Canon phase palettes
export const SCING_PALETTE: PhasePalette = {
  channel: 'SCING',
  colors: [
    [0.0, 0.65, 1.0], // blue
    [0.55, 0.15, 1.0], // violet
    [1.0, 0.0, 0.75], // magenta
  ],
}

export const LARI_PALETTE: PhasePalette = {
  channel: 'LARI',
  colors: [
    [1.0, 0.70, 0.05], // golden yellow
    [1.0, 1.0, 0.10], // neon yellow
    [1.0, 0.35, 0.00], // neon orange
    [0.55, 1.0, 0.10], // neon lime
  ],
}

export const BANE_PALETTE: PhasePalette = {
  channel: 'BANE',
  colors: [
    [0.90, 0.00, 0.05], // red
    [1.0, 0.10, 0.10], // neon red
    [0.70, 0.10, 1.0], // neon purple
    [1.0, 1.0, 1.0], // white punctuations
  ],
}

export function getPalette(channel: PhaseChannel): PhasePalette {
  if (channel === 'LARI') return LARI_PALETTE
  if (channel === 'BANE') return BANE_PALETTE
  return SCING_PALETTE
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

/**
 * Deterministic phase driver from avatar state vector.
 * Source: (arousal + cognitiveLoad + rhythm) with a small focus influence.
 */
export function phaseSignalFromState(v: {
  arousal: number
  cognitiveLoad: number
  rhythm: number
  focus: number
}): number {
  const raw = (v.arousal + v.cognitiveLoad + v.rhythm) / 3
  const shaped = clamp01(raw * (0.85 + 0.30 * clamp01(v.focus)))
  return shaped
}

/**
 * Given a channel palette and a 0..1 signal, return two adjacent phase colors and a mix.
 */
export function phaseABFromSignal(p: PhasePalette, signal01: number): {
  phaseA: [number, number, number]
  phaseB: [number, number, number]
  phaseMix: number
} {
  const s = clamp01(signal01)
  const n = p.colors.length

  if (n <= 1) {
    const c = p.colors[0] ?? ([1, 1, 1] as [number, number, number])
    return { phaseA: c, phaseB: c, phaseMix: 0 }
  }

  const x = s * n
  const i0 = Math.floor(x) % n
  const i1 = (i0 + 1) % n
  const mix = x - Math.floor(x)

  return { phaseA: p.colors[i0], phaseB: p.colors[i1], phaseMix: mix }
}
