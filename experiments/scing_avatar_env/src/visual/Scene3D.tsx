import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import { FlameMaterial } from './FlameMaterial'
import type { FlameMaterialImpl } from './FlameMaterial'
import { LAYER_AVATAR } from './layers'
import { AVATAR_RADIUS_UNITS, FLOOR_Y } from './scale'
import Starfield from './Starfield'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import { setRenderStats } from '../influence/renderStats'
import AvatarReflectionTarget, { type AvatarReflectionTargetResult } from './reflection/AvatarReflectionTarget'
import FloorReflectionPlane from './reflection/FloorReflectionPlane'

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

  const [reflection, setReflection] = useState<AvatarReflectionTargetResult | null>(null)

  const setAvatarLayer = (o: THREE.Object3D) => {
    o.layers.set(LAYER_AVATAR)
  }

  useEffect(() => {
    // Render avatar layer on the main camera (so avatar-only lighting/reflection layers cannot hide it).
    camera.layers.enable(LAYER_AVATAR)
  }, [camera])

  // Stage 2 hover theory (locked): clearance = 0.33 * radius.
  const hoverHeight = 0.33 * AVATAR_RADIUS_UNITS
  const avatarCenterY = FLOOR_Y + AVATAR_RADIUS_UNITS + hoverHeight

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

      // Stage 2: keep controls stable and non-overbearing.
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
    const failsafeOn = opt.avatarVisible && (!avatarDrawOk || failsafeForced)

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
      {opt.starfieldVisible ? <Starfield /> : null}

      {/* Avatar-only capture target (used by the floor reflection plane) */}
      <AvatarReflectionTarget
        enabled={opt.floorReflectionEnabled}
        size={1024}
        planeY={FLOOR_Y}
        onReady={setReflection}
      />

      {/* Floor: black plane with subtle avatar-only reflection */}
      <FloorReflectionPlane
        enabled={opt.floorReflectionEnabled}
        texture={reflection?.texture ?? null}
        targetSize={reflection?.size ?? 1024}
        size={18}
        strength={opt.floorReflectionStrength}
        blur={opt.floorReflectionBlur}
        height={opt.floorReflectionHeight}
      />

      {/* Avatar group */}
      {opt.avatarVisible && (
        <group position={[0, avatarCenterY, 0]}>
          {/* CORE */}
          {/* Solid avatar mesh always renders when avatarVisible is ON */}
          {
            <mesh geometry={geometry} scale={1.0} onUpdate={setAvatarLayer}>
              <flameMaterial ref={coreRef} />
            </mesh>
          }

          {
            <mesh geometry={geometry} scale={1.03} onUpdate={setAvatarLayer}>
              <flameMaterial ref={skinRef} />
            </mesh>
          }

          {/* FAILSAFE: deterministic visible mesh if shader pipeline isn't healthy */}
          <mesh ref={failsafeMeshRef} geometry={geometry} scale={1.005} visible={false} onUpdate={setAvatarLayer}>
            {/* Unlit failsafe so reflection capture stays avatar-only (no lighting contamination). */}
            <meshBasicMaterial color="#d1ccff" />
          </mesh>

          {/* WIREFRAME OVERLAY (meshVisible toggle) */}
          {opt.meshVisible ? (
            <mesh geometry={geometry} scale={1.035} onUpdate={setAvatarLayer}>
              <meshBasicMaterial wireframe opacity={0.18} transparent color="#8a5cff" />
            </mesh>
          ) : null}
        </group>
      )}

      {/* Camera controls: NO focus lock, fully manual */}
      {opt.cameraEnabled ? (
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
          autoRotate={false}
        />
      ) : null}
    </>
  )
}
