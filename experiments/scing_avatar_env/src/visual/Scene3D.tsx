import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'

import { FlameMaterial } from './FlameMaterial'
import type { FlameMaterialImpl } from './FlameMaterial'
import { LAYER_AVATAR } from './layers'
import { AVATAR_RADIUS_UNITS, FLOOR_Y } from './scale'
import Starfield from './Starfield'
import Floor from './Floor'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import { setRenderStats } from '../influence/renderStats'

extend({ FlameMaterial })

// deterministic smooth (no tweens)
function smoothDamp(current: number, target: number, smoothing: number, dt: number): number {
  const k = 1 - Math.exp(-smoothing * dt)
  return current + (target - current) * k
}

// deterministic micro-entropy (no Math.random)
function pseudoNoise(t: number): number {
  const a = Math.sin(t * 12.9898) * 43758.5453
  const f = a - Math.floor(a)
  return f * 2 - 1 // [-1, 1]
}

export default function Scene3D() {
  const { gl } = useThree()
  const { camera } = useThree()
  const opt = useDevOptionsStore()

  useEffect(() => {
    // Render avatar layer on the main camera (so avatar-only lighting/reflection layers cannot hide it).
    camera.layers.enable(LAYER_AVATAR)
  }, [camera])

  const avatarCenterY = FLOOR_Y + AVATAR_RADIUS_UNITS + opt.reflectionHeight

  const forceFailsafeRef = useRef(false)
  useEffect(() => {
    // TEMP (experiments-only): deterministic failsafe proof toggle.
    if (!import.meta.env.DEV) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'f') return
      forceFailsafeRef.current = !forceFailsafeRef.current
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const geometry = useMemo(() => {
    // Always render something: public/models may be empty in this sandbox.
    return new THREE.SphereGeometry(AVATAR_RADIUS_UNITS, 192, 192)
  }, [])

  // Two-layer material (core + skin)
  const coreRef = useRef<FlameMaterialImpl>(null!)
  const skinRef = useRef<FlameMaterialImpl>(null!)
  const failsafeMeshRef = useRef<THREE.Mesh>(null)
  const toneMapFixedRef = useRef(false)

  const healthRef = useRef({ frames: 0, avatarDrawOk: true })

  // local unified time/state
  const tRef = useRef(0)
  const uRef = useRef({
    arousal: 0.55,
    valence: 0.0,
    cognitiveLoad: 0.35,
    rhythm: 0.55,
    entropy: 0.04,
    focus: 0.55,
  })

  useFrame((_, dt) => {
    tRef.current += dt
    const t = tRef.current

    healthRef.current.frames += 1

    if (!toneMapFixedRef.current) {
      // Ensure reflection reads true emissive/silhouette (not tonemapped away)
      if (coreRef.current) coreRef.current.toneMapped = false
      if (skinRef.current) skinRef.current.toneMapped = false
      toneMapFixedRef.current = true
    }

    // Demo drive (deterministic): strong, obvious breathing + presence
    // Replace later with real sensor bridge; for now, VISUAL UPGRADE is primary.
    let driveArousal = 0.62 + 0.28 * Math.sin(t * 0.85)
    const driveFocus = 0.58 + 0.22 * Math.sin(t * 0.31 + 2.1)
    let driveRhythm = 0.52 + 0.28 * Math.sin(t * 0.95 + 0.4)
    const driveLoad = 0.42 + 0.22 * Math.sin(t * 0.23 + 1.4)
    let driveVal = 0.32 * Math.sin(t * 0.14)

    uRef.current.arousal = smoothDamp(uRef.current.arousal, driveArousal, 10, dt)
    uRef.current.focus = smoothDamp(uRef.current.focus, driveFocus, 10, dt)
    uRef.current.rhythm = smoothDamp(uRef.current.rhythm, driveRhythm, 10, dt)
    uRef.current.cognitiveLoad = smoothDamp(uRef.current.cognitiveLoad, driveLoad, 10, dt)
    uRef.current.valence = smoothDamp(uRef.current.valence, driveVal, 10, dt)

    // deterministic micro-entropy injection, bounded
    const eBase = smoothDamp(uRef.current.entropy, 0.04, 6, dt)
    const ePerturb = pseudoNoise(t * 0.7) * 0.001
    uRef.current.entropy = Math.max(0.02, Math.min(0.08, eBase + ePerturb))

    const applyUniforms = (m: FlameMaterialImpl | null, layer: number) => {
      if (!m) return
      m.uniforms.time.value = t
      m.uniforms.arousal.value = uRef.current.arousal
      m.uniforms.valence.value = uRef.current.valence
      m.uniforms.cognitiveLoad.value = uRef.current.cognitiveLoad
      m.uniforms.rhythm.value = uRef.current.rhythm
      m.uniforms.entropy.value = uRef.current.entropy
      m.uniforms.focus.value = uRef.current.focus

      // Material control plane (dev options)
      m.uniforms.rimStrength.value = opt.rimStrength
      m.uniforms.chromaEnabled.value = opt.chromaWorkstationEnabled ? 1.0 : 0.0
      m.uniforms.chromaIntensity.value = opt.chromaWorkstationIntensity
      m.uniforms.chromaPalette.value = opt.chromaWorkstationPalette === 'NeonGlassBulbs' ? 1.0 : 0.0

      // Liquid metal flame controls (bounded)
      m.uniforms.metalness.value = 0.95
      if (layer < 0.5) {
        m.uniforms.roughness.value = 0.18
        m.uniforms.highlightBoost.value = 1.25
        m.uniforms.lightning.value = 0.45
        m.uniforms.lightningSpeed.value = 0.85
        m.uniforms.lightningWidth.value = 0.55
      } else {
        m.uniforms.roughness.value = 0.22
        m.uniforms.highlightBoost.value = 1.15
        m.uniforms.lightning.value = 0.32
        m.uniforms.lightningSpeed.value = 0.85
        m.uniforms.lightningWidth.value = 0.55
      }

      m.uniforms.layer.value = layer
    }

    applyUniforms(coreRef.current, 0)
    applyUniforms(skinRef.current, 1)

    // Deterministic health check + failsafe policy:
    // - During the first few frames, assume OK to avoid boot flicker.
    // - After warmup, consider OK only if both materials exist and their time uniform is sane.
    let avatarDrawOk = true
    if (healthRef.current.frames > 8) {
      const core = coreRef.current
      const skin = skinRef.current
      const coreTime = core?.uniforms?.time?.value
      const skinTime = skin?.uniforms?.time?.value
      avatarDrawOk = !!core && !!skin && Number.isFinite(coreTime) && Number.isFinite(skinTime) && Number.isFinite(t)
    }
    healthRef.current.avatarDrawOk = avatarDrawOk
    const failsafeForced = import.meta.env.DEV && forceFailsafeRef.current
    const failsafeOn = opt.showAvatar && (!avatarDrawOk || failsafeForced)

    if (failsafeMeshRef.current) {
      failsafeMeshRef.current.visible = failsafeOn
    }

    // Renderer stats proof-of-draw (no external deps; deterministic)
    const info = gl.info
    setRenderStats({
      calls: info.render.calls,
      triangles: info.render.triangles,
      lines: info.render.lines,
      points: info.render.points,
      avatarDrawOk,
      failsafeOn,
      failsafeForced,
    })
  })

  return (
    <>
      {opt.showStarfield ? <Starfield /> : null}

      {/* Depth cue: subtle studio fog (big depth upgrade) */}
      <fog attach="fog" args={['#05020b', 2.8, 10.5]} />

      {/* Avatar group */}
      {opt.showAvatar && (
        <group position={[0, avatarCenterY, 0]}>
          {/* CORE */}
          {opt.showMesh ? (
            <mesh geometry={geometry} scale={1.0} layers={LAYER_AVATAR}>
            <flameMaterial ref={coreRef} />
            </mesh>
          ) : null}

          {/* SKIN (slightly larger) */}
          {opt.showMesh ? (
            <mesh geometry={geometry} scale={1.03} layers={LAYER_AVATAR}>
              <flameMaterial ref={skinRef} />
            </mesh>
          ) : null}

          {/* FAILSAFE: deterministic visible mesh if shader pipeline isn't healthy */}
          <mesh ref={failsafeMeshRef} geometry={geometry} scale={1.005} visible={false} layers={LAYER_AVATAR}>
            <meshStandardMaterial
              color="#d1ccff"
              emissive="#6b3dff"
              emissiveIntensity={1.25}
              metalness={0.0}
              roughness={0.35}
            />
          </mesh>

          {/* WIREFRAME OVERLAY (definition aid) */}
          {opt.showWireframe && (
            <mesh geometry={geometry} scale={1.035} layers={LAYER_AVATAR}>
              <meshBasicMaterial wireframe opacity={0.18} transparent color="#8a5cff" />
            </mesh>
          )}
        </group>
      )}

      <Floor floorY={FLOOR_Y} size={18} />

      {/* Post: cinematic presence */}
      <EffectComposer>
        <Bloom intensity={opt.bloomIntensity} luminanceThreshold={0.35} luminanceSmoothing={0.85} />
        {opt.chromaWorkstationEnabled ? (
          <ChromaticAberration
            offset={[0.001 + 0.0025 * opt.chromaWorkstationIntensity, 0.0006 + 0.0016 * opt.chromaWorkstationIntensity]}
            radialModulation
          />
        ) : null}
        <Vignette offset={0.22} darkness={0.68} />
      </EffectComposer>

      {/* Camera controls: NO focus lock, fully manual */}
      {opt.allowCameraControls ? (
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          target={[0, avatarCenterY, 0]}
          minDistance={0.9}
          maxDistance={800.0}
          enableDamping
          dampingFactor={0.08}
          autoRotate={opt.autorotateCamera}
        />
      ) : null}
    </>
  )
}
