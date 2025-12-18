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
