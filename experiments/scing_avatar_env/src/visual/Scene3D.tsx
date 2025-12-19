import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import { FlameMaterial } from './FlameMaterial'
import type { FlameMaterialImpl } from './FlameMaterial'
import { LAYER_AVATAR } from './layers'
import { AVATAR_RADIUS_UNITS, FLOOR_Y } from './scale'
import Starfield from './Starfield'
import { useDevOptionsStore } from '../dev/useDevOptionsStore'
import { setRenderStats } from '../influence/renderStats'
import FloorReflection from './FloorReflection'
import { getAvatarState, getPhaseSignal } from '../influence/InfluenceBridge'
import { getPalette, phaseABFromSignal } from '../influence/phasePalettes'

extend({ FlameMaterial })

// deterministic smooth (no tweens)
function smoothDamp(current: number, target: number, smoothing: number, dt: number): number {
  const k = 1 - Math.exp(-smoothing * dt)
  return current + (target - current) * k
}

type AnyUniforms = Record<string, { value: unknown } | undefined>

function setU(uniforms: AnyUniforms | undefined, key: string, v: unknown) {
  const u = uniforms?.[key]
  if (!u) return
  u.value = v
}

function applyUniforms(
  mat: any,
  payload: {
    time: number
    layer?: number
    arousal: number
    valence: number
    cognitiveLoad: number
    rhythm: number
    entropy: number
    focus: number
    // optional textures if present:
    albedoTex?: any
    normalTex?: any
  },
) {
  const uniforms: AnyUniforms | undefined = mat?.uniforms

  // Core required (guarded)
  setU(uniforms, 'time', payload.time)
  setU(uniforms, 'arousal', payload.arousal)
  setU(uniforms, 'valence', payload.valence)
  setU(uniforms, 'cognitiveLoad', payload.cognitiveLoad)
  setU(uniforms, 'rhythm', payload.rhythm)
  setU(uniforms, 'entropy', payload.entropy)
  setU(uniforms, 'focus', payload.focus)

  // Optional (guarded)
  if (payload.layer !== undefined) setU(uniforms, 'layer', payload.layer)
  if (payload.albedoTex) setU(uniforms, 'albedoTex', payload.albedoTex)
  if (payload.normalTex) setU(uniforms, 'normalTex', payload.normalTex)

  // Palette mode support (if/when present)
  // setU(uniforms, 'paletteMode', paletteModeInt)
}

export default function Scene3D() {
  const { gl } = useThree()
  const { camera } = useThree()
  const opt = useDevOptionsStore()

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

  const floorEnabled = !!opt.floorReflectEnabled
  const floorY = 0
  const floorIntensity = opt.floorReflectIntensity
  const floorRadius = opt.floorReflectRadius
  const floorSharpness = opt.floorReflectSharpness
  const floorSize = 1.4

  useEffect(() => {
    // Ensure the avatar starts centered even before OrbitControls runs.
    camera.lookAt(0, avatarCenterY, 0)
    camera.updateMatrixWorld()
  }, [camera, avatarCenterY])

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
    phaseSignal: 0.5,
  })

  const phaseA = useMemo(() => new THREE.Vector3(), [])
  const phaseB = useMemo(() => new THREE.Vector3(), [])
  const phaseColor = useMemo(() => new THREE.Color(), [])
  const phaseColorTmp = useMemo(() => new THREE.Color(), [])

  const floorStrengthRef = useRef(0)

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

    // Drive visuals from the live avatar state (sensor-driven via App.tsx).
    const s = getAvatarState()
    uRef.current.arousal = smoothDamp(uRef.current.arousal, s.arousal, 12, dt)
    uRef.current.focus = smoothDamp(uRef.current.focus, s.focus, 12, dt)
    uRef.current.rhythm = smoothDamp(uRef.current.rhythm, s.rhythm, 12, dt)
    uRef.current.cognitiveLoad = smoothDamp(uRef.current.cognitiveLoad, s.cognitiveLoad, 12, dt)
    uRef.current.valence = smoothDamp(uRef.current.valence, s.valence, 8, dt)
    uRef.current.entropy = smoothDamp(uRef.current.entropy, s.entropy, 6, dt)

    // Phase selection derived from state + dev override (with smoothing).
    const chromaEnabled = opt.chromaEnabled
    const channel = (chromaEnabled ? opt.chromaChannel : opt.paletteMode)
    const palette = getPalette(channel)

    let phaseSignal = getPhaseSignal()
    if (chromaEnabled) {
      const rate = opt.chromaRate
      const bias = opt.chromaPhaseBias
      phaseSignal = 0.5 + 0.5 * Math.sin(t * rate + bias)
    }
    uRef.current.phaseSignal = smoothDamp(uRef.current.phaseSignal, phaseSignal, 8, dt)

    const phases = phaseABFromSignal(palette, uRef.current.phaseSignal)
    phaseA.set(phases.phaseA[0], phases.phaseA[1], phases.phaseA[2])
    phaseB.set(phases.phaseB[0], phases.phaseB[1], phases.phaseB[2])
    phaseColor.setRGB(phases.phaseA[0], phases.phaseA[1], phases.phaseA[2])
    phaseColorTmp.setRGB(phases.phaseB[0], phases.phaseB[1], phases.phaseB[2])
    phaseColor.lerp(phaseColorTmp, phases.phaseMix)

    // Floor reflection strength is NON-DECAYING (no warmup/time curves).
    // When enabled, it cannot silently collapse to ~0.
    const clamp01Local = (v: number) => Math.max(0, Math.min(1, v))
    const energy = clamp01Local(
      0.55 * uRef.current.arousal +
        0.25 * uRef.current.focus +
        0.20 * uRef.current.rhythm,
    )
    const reflectionEps = 0.025
    const reflectionStrength = floorEnabled
      ? Math.max(reflectionEps, clamp01Local(floorIntensity) * (0.35 + 0.65 * energy))
      : 0.0
    floorStrengthRef.current = reflectionStrength

    applyUniforms(coreRef.current, {
      time: t,
      layer: 0,
      arousal: uRef.current.arousal,
      valence: uRef.current.valence,
      cognitiveLoad: uRef.current.cognitiveLoad,
      rhythm: uRef.current.rhythm,
      entropy: uRef.current.entropy,
      focus: uRef.current.focus,
    })

    // Phase uniforms (CB-required)
    setU((coreRef.current as any)?.uniforms, 'phaseA', phaseA)
    setU((coreRef.current as any)?.uniforms, 'phaseB', phaseB)
    setU((coreRef.current as any)?.uniforms, 'phaseMix', phases.phaseMix)
    setU((coreRef.current as any)?.uniforms, 'chromaEnabled', chromaEnabled ? 1.0 : 0.0)
    setU((coreRef.current as any)?.uniforms, 'chromaIntensity', opt.chromaIntensity)

    applyUniforms(skinRef.current, {
      time: t,
      layer: 1,
      arousal: uRef.current.arousal,
      valence: uRef.current.valence,
      cognitiveLoad: uRef.current.cognitiveLoad,
      rhythm: uRef.current.rhythm,
      entropy: uRef.current.entropy,
      focus: uRef.current.focus,
    })

    setU((skinRef.current as any)?.uniforms, 'phaseA', phaseA)
    setU((skinRef.current as any)?.uniforms, 'phaseB', phaseB)
    setU((skinRef.current as any)?.uniforms, 'phaseMix', phases.phaseMix)
    setU((skinRef.current as any)?.uniforms, 'chromaEnabled', chromaEnabled ? 1.0 : 0.0)
    setU((skinRef.current as any)?.uniforms, 'chromaIntensity', opt.chromaIntensity)

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
      floorStrength: reflectionStrength,
    })
  })

  return (
    <>
      {opt.starfieldEnabled ? <Starfield /> : null}

      {/* Condensed avatar-emission-only floor reflection (ignores room lights entirely) */}
      <FloorReflection
        enabled={floorEnabled}
        y={floorY}
        size={floorSize}
        avatarColor={phaseColor}
        avatarIntensityRef={floorStrengthRef}
        avatarIntensity={0}
        hoverHeight={hoverHeight}
        radius={floorRadius}
        sharpness={floorSharpness}
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
    </>
  )
}
