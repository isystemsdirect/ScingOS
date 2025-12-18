import type { AvatarStateVector } from '../influence/AvatarStateVector'
import { clamp01, clampRange, clampValence } from '../influence/AvatarStateVector'

export function sampleStubSensors(time: number): Partial<AvatarStateVector> {
  // Deterministic time-based stub.
  // Entropy is intentionally NOT set here.
  const arousal = clamp01(0.55 + 0.35 * Math.sin(time * 0.9))
  const rhythm = clamp01(0.5 + 0.45 * Math.sin(time * 1.6 + 0.8))
  const cognitiveLoad = clamp01(0.45 + 0.25 * Math.sin(time * 0.2 + 1.7))

  const valenceRaw = 0.35 * Math.sin(time * 0.12 + 0.4)
  const valence = clampValence(clampRange(valenceRaw, -0.4, 0.4))

  const focus = clamp01(0.5 + 0.08 * Math.sin(time * 0.35 + 2.2))

  return {
    arousal,
    rhythm,
    cognitiveLoad,
    valence,
    focus,
  }
}
