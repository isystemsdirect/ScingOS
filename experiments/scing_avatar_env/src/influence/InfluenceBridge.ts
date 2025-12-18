import type { AvatarStateVector } from './AvatarStateVector'
import { clamp01, clampEntropy, clampValence } from './AvatarStateVector'

let currentAvatarState: AvatarStateVector = {
  arousal: 0,
  valence: 0,
  cognitiveLoad: 0,
  rhythm: 0,
  entropy: 0.04,
  focus: 0.5,
}

export function resetAvatarStateToDefaults(): void {
  // Boot-safe defaults (runtime only; no persistence).
  currentAvatarState = {
    arousal: 0.55,
    cognitiveLoad: 0.45,
    rhythm: 0.5,
    focus: 0.55,
    valence: 0.2,
    entropy: 0.04,
  }
}

export function setAvatarState(patch: Partial<AvatarStateVector>): AvatarStateVector {
  currentAvatarState = {
    arousal: clamp01(patch.arousal ?? currentAvatarState.arousal),
    valence: clampValence(patch.valence ?? currentAvatarState.valence),
    cognitiveLoad: clamp01(patch.cognitiveLoad ?? currentAvatarState.cognitiveLoad),
    rhythm: clamp01(patch.rhythm ?? currentAvatarState.rhythm),
    entropy: clampEntropy(patch.entropy ?? currentAvatarState.entropy),
    focus: clamp01(patch.focus ?? currentAvatarState.focus),
  }

  return currentAvatarState
}

export function getAvatarState(): AvatarStateVector {
  return currentAvatarState
}
