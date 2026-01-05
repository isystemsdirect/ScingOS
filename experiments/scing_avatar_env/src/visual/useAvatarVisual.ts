import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getAvatarState } from '../influence/InfluenceBridge'
import { integrateEntropy } from '../influence/EntropyIntegrator'
import type { FlameMaterialImpl } from './FlameMaterial'

type MaterialRef = React.RefObject<FlameMaterialImpl | null>

export function useAvatarVisual(materialRef: MaterialRef): void {
  const t = useRef(0)
  const smoothed = useRef({ arousal: 0, valence: 0, cognitiveLoad: 0, rhythm: 0, entropy: 0.04, focus: 0.5 })

  function smoothDamp(current: number, target: number, smoothing: number, delta: number): number {
    const k = 1 - Math.exp(-smoothing * Math.max(0, delta))
    return current + (target - current) * k
  }

  useFrame((_, delta) => {
    t.current += delta

    const material = materialRef.current
    if (!material) return

    const state = getAvatarState()

    const smoothing = 10
    const s = smoothed.current

    s.arousal = smoothDamp(s.arousal, state.arousal, smoothing, delta)
    s.valence = smoothDamp(s.valence, state.valence, smoothing, delta)
    s.cognitiveLoad = smoothDamp(s.cognitiveLoad, state.cognitiveLoad, smoothing, delta)
    s.rhythm = smoothDamp(s.rhythm, state.rhythm, smoothing, delta)
    s.focus = smoothDamp(s.focus, state.focus, smoothing, delta)

    // Entropy is local to uniforms (bridge stays pure).
    const entropyTarget = integrateEntropy(state.entropy, t.current)
    s.entropy = smoothDamp(s.entropy, entropyTarget, smoothing, delta)

    material.uniforms.time.value = t.current
    material.uniforms.arousal.value = s.arousal
    material.uniforms.valence.value = s.valence
    material.uniforms.cognitiveLoad.value = s.cognitiveLoad
    material.uniforms.rhythm.value = s.rhythm
    material.uniforms.entropy.value = s.entropy
    material.uniforms.focus.value = s.focus
  })
}
