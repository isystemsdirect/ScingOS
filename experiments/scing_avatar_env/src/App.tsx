import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Scene3D from './visual/Scene3D'
import { AVATAR_CENTER_Y, CAMERA_Z } from './visual/scale'
import ScingAvatarLiveHud from './hud/ScingAvatarLiveHud'
import DevOptionsPanel from './dev/DevOptionsPanel'

import './styles.css'
import './ui/devpanel.css'

import { getDevOptions, setDevOptions, subscribeDevOptions, type DevOptions } from './dev/devOptionsStore'
import { LAYER_AVATAR } from './visual/layers'
import { getMediaStatus, setMediaEnabled, startMediaSensors, stopMediaSensors } from './sensors/mediaSensors'
import { resetAvatarStateToDefaults, setAvatarState } from './influence/InfluenceBridge'
import Floor from './visual/Floor'
import { FloorShine } from './visual/FloorShine'

// If you already have sensor start logic elsewhere, keep it.
// This CB does not force sensors on/off; it focuses on visual definition.

type RuntimeCrash = {
  kind: 'error' | 'unhandledrejection' | 'webglcontextlost' | 'webglcontextrestored'
  message: string
  detail?: string
  ts: number
}

const LAST_CRASH_KEY = 'scing_avatar_env_last_crash_v1'

function tryPersistCrash(c: RuntimeCrash | null) {
  if (!c) return
  try {
    window.localStorage.setItem(LAST_CRASH_KEY, JSON.stringify(c))
  } catch {
    // ignore
  }
}

function tryLoadLastCrash(): RuntimeCrash | null {
  try {
    const raw = window.localStorage.getItem(LAST_CRASH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<RuntimeCrash>
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.kind !== 'string' || typeof parsed.message !== 'string' || typeof parsed.ts !== 'number') return null
    const kind = parsed.kind as RuntimeCrash['kind']
    if (!['error', 'unhandledrejection', 'webglcontextlost', 'webglcontextrestored'].includes(kind)) return null
    return {
      kind,
      message: parsed.message,
      detail: typeof parsed.detail === 'string' ? parsed.detail : undefined,
      ts: parsed.ts,
    }
  } catch {
    return null
  }
}

class ErrorBoundary extends Component<
  { onError: (message: string, detail?: string) => void; children: any },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any) {
    const message = error && typeof error.message === 'string' ? error.message : 'Render error'
    const detail = error && typeof error.stack === 'string' ? error.stack : undefined
    this.props.onError(message, detail)
  }

  render() {
    // Avoid an infinite error loop that can lead to a blank page.
    if (this.state.hasError) return null
    return this.props.children
  }
}

function RotatingLightRig(props: { opt: DevOptions; lightTarget: THREE.Object3D }) {
  const { opt, lightTarget } = props

  const lightRefs = [
    useRef<THREE.SpotLight>(null),
    useRef<THREE.SpotLight>(null),
    useRef<THREE.SpotLight>(null),
    useRef<THREE.SpotLight>(null),
  ] as const

  const targets = useMemo(() => {
    return [new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D()] as const
  }, [])

  const tmpV = useMemo(() => new THREE.Vector3(), [])
  const tmpAxis = useMemo(() => new THREE.Vector3(), [])
  const tmpQuat = useMemo(() => new THREE.Quaternion(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    for (let i = 0; i < 4; i++) {
      const s = opt.lights.spots[i]
      const ref = lightRefs[i].current
      const tgt = targets[i]

      // Update per-light target object position.
      tgt.position.set(s.target[0], s.target[1], s.target[2])
      tgt.updateMatrixWorld()

      if (!ref) continue

      // Layers: avatar-only or global.
      if (s.layerAvatarOnly) {
        ref.layers.set(LAYER_AVATAR)
      } else {
        ref.layers.enableAll()
      }

      // Apply rotation about the target along selected axis.
      const basePos = tmpV.set(s.position[0], s.position[1], s.position[2])
      if (s.rotationEnabled && s.rotationRate !== 0) {
        tmpAxis.set(0, 0, 0)
        if (s.rotationAxis === 'x') tmpAxis.set(1, 0, 0)
        if (s.rotationAxis === 'y') tmpAxis.set(0, 1, 0)
        if (s.rotationAxis === 'z') tmpAxis.set(0, 0, 1)

        tmpQuat.setFromAxisAngle(tmpAxis, s.rotationRate * t)
        basePos.sub(tgt.position).applyQuaternion(tmpQuat).add(tgt.position)
      }

      ref.position.copy(basePos)
      ref.target = tgt
      ref.updateMatrixWorld()
    }
  })

  return (
    <>
      {/* Per-light targets */}
      {targets.map((t, i) => (
        <primitive key={i} object={t} />
      ))}

      {/* 4-spot rig with full per-light controls */}
      {opt.lights.spots.map((s, i) => (
        <spotLight
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          ref={lightRefs[i]}
          color={s.color}
          position={[s.position[0], s.position[1], s.position[2]]}
          target={targets[i]}
          intensity={opt.lights.enabled && s.enabled ? s.intensity : 0}
          distance={s.distance}
          angle={s.angle}
          penumbra={s.penumbra}
          decay={s.decay}
          castShadow={s.castShadow}
          onUpdate={(o) => {
            if (s.layerAvatarOnly) o.layers.set(LAYER_AVATAR)
            else o.layers.enableAll()
          }}
        />
      ))}
    </>
  )
}

export default function App() {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())
  const [crash, setCrash] = useState<RuntimeCrash | null>(null)
  const [glCanvas, setGlCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  useEffect(() => {
    // Restore last crash (survives reload), so we can diagnose even if the app dies quickly.
    const last = tryLoadLastCrash()
    if (last) setCrash(last)
  }, [])

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const detail = (e.error && typeof (e.error as any).stack === 'string') ? (e.error as any).stack : undefined
      const c: RuntimeCrash = { kind: 'error', message: e.message || 'Unknown error', detail, ts: Date.now() }
      tryPersistCrash(c)
      setCrash(c)
    }

    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason
      const message =
        typeof reason === 'string'
          ? reason
          : reason && typeof reason?.message === 'string'
            ? reason.message
            : 'Unhandled promise rejection'
      const detail = reason && typeof reason?.stack === 'string' ? reason.stack : undefined
      const c: RuntimeCrash = { kind: 'unhandledrejection', message, detail, ts: Date.now() }
      tryPersistCrash(c)
      setCrash(c)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  useEffect(() => {
    if (!glCanvas) return

    const onLost = (e: Event) => {
      // Prevent default so we can at least display a message.
      try {
        ;(e as any).preventDefault?.()
      } catch {
        // ignore
      }
      const c: RuntimeCrash = { kind: 'webglcontextlost', message: 'WebGL context lost', ts: Date.now() }
      tryPersistCrash(c)
      setCrash(c)
    }

    const onRestored = () => {
      const c: RuntimeCrash = { kind: 'webglcontextrestored', message: 'WebGL context restored', ts: Date.now() }
      tryPersistCrash(c)
      setCrash(c)
    }

    glCanvas.addEventListener('webglcontextlost', onLost as any, false)
    glCanvas.addEventListener('webglcontextrestored', onRestored as any, false)
    return () => {
      glCanvas.removeEventListener('webglcontextlost', onLost as any)
      glCanvas.removeEventListener('webglcontextrestored', onRestored as any)
    }
  }, [glCanvas])

  const lightTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, AVATAR_CENTER_Y, 0)
    return o
  }, [])

  const floorShineCenter = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useEffect(() => {
    // Hard reset runtime state to known-visible defaults (runtime only; no persistence).
    resetAvatarStateToDefaults()
    // Prevent persisted "avatar off" from blanking the scene on boot (boot-only enforcement).
    setDevOptions({ avatar: { enabled: true }, ui: { hudVisible: true } } as any)
  }, [])

  useEffect(() => {
    let lastMic = getDevOptions().sensors.mic.enabled
    let lastCam = getDevOptions().sensors.cam.enabled

    // Start sensors on boot using dev toggles.
    setMediaEnabled({ mic: lastMic, cam: lastCam })
    void startMediaSensors()

    const unsub = subscribeDevOptions(() => {
      const o = getDevOptions()
      if (o.sensors.mic.enabled === lastMic && o.sensors.cam.enabled === lastCam) return

      // Apply desired state immediately.
      setMediaEnabled({ mic: o.sensors.mic.enabled, cam: o.sensors.cam.enabled })

      // If enabling, start streams (exact request set determined by the current toggles).
      if ((o.sensors.mic.enabled && !lastMic) || (o.sensors.cam.enabled && !lastCam)) {
        void startMediaSensors()
      }

      // If disabling both, fully stop.
      if (!o.sensors.mic.enabled && !o.sensors.cam.enabled) {
        stopMediaSensors()
      }

      lastMic = o.sensors.mic.enabled
      lastCam = o.sensors.cam.enabled
    })

    return () => {
      unsub()
      stopMediaSensors()
    }
  }, [])

  useEffect(() => {
    // Sensor-driven avatar state driver (deterministic; no Math.random).
    const id = window.setInterval(() => {
      const s = getMediaStatus()
      const t = performance.now() * 0.001

      const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

      const mic = clamp01(s.micRms)
      const camMotion = clamp01(s.camMotion)

      const arousal = clamp01(mic * 1.35)

      // Rhythm rises with voice and gets a tiny deterministic phase nudge from pitch.
      let rhythm = clamp01(mic * 1.1)
      if (s.pitchHz > 0 && s.pitchClarity > 0) {
        const phase = Math.sin(t * 1.9 + s.pitchHz * 0.01)
        rhythm = clamp01(rhythm + phase * 0.05 * clamp01(s.pitchClarity))
      }

      const focus = clamp01(0.55 + 0.35 * (1 - camMotion))
      const cognitiveLoad = clamp01(0.35 + 0.65 * camMotion)

      // Small bounded oscillation from pitch clarity (no randomness).
      const valence = clamp01(s.pitchClarity) * 0.22 * Math.sin(t * 0.33)

      setAvatarState({
        arousal,
        rhythm,
        focus,
        cognitiveLoad,
        valence,
        entropy: 0.04,
      })
    }, 50)

    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      {/* HUD: locked top-left (toggleable) */}
      <ScingAvatarLiveHud />

      {crash ? (
        <div
          style={{
            position: 'fixed',
            left: 12,
            bottom: 12,
            zIndex: 1000,
            maxWidth: 'min(760px, calc(100vw - 24px))',
            background: 'rgba(8, 6, 14, 0.92)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 12,
            padding: 12,
            color: 'rgba(255,255,255,0.92)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 12,
            lineHeight: 1.35,
            pointerEvents: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>RUNTIME CRASH CAPTURE</div>
          <div style={{ opacity: 0.9, marginBottom: 8 }}>
            {crash.kind}: {crash.message}
          </div>
          <div style={{ opacity: 0.7, marginBottom: 8 }}>
            ts: {new Date(crash.ts).toISOString()}
          </div>
          {crash.detail ? <div style={{ opacity: 0.85 }}>{crash.detail}</div> : null}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => {
                try {
                  window.localStorage.removeItem(LAST_CRASH_KEY)
                } catch {
                  // ignore
                }
                setCrash(null)
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.92)',
                cursor: 'pointer',
              }}
            >
              Dismiss + Clear
            </button>
          </div>
        </div>
      ) : null}

      {/* Dev panel: locked top-right (<= 20% viewport) */}
      <DevOptionsPanel />

      <ErrorBoundary
        onError={(message, detail) => {
          const c: RuntimeCrash = { kind: 'error', message, detail, ts: Date.now() }
          tryPersistCrash(c)
          setCrash(c)
        }}
      >
        <Canvas
          camera={{ position: [0, AVATAR_CENTER_Y, CAMERA_Z], fov: 38, near: 0.05, far: 5000 }}
          dpr={1}
          gl={{
            antialias: false,
            preserveDrawingBuffer: false,
            powerPreference: 'low-power',
          }}
          onCreated={({ camera, gl }) => {
            camera.lookAt(0, AVATAR_CENTER_Y, 0)
            camera.updateMatrixWorld()

            // Capture context-loss events (for crash diagnosis without console access).
            try {
              setGlCanvas(gl.domElement as HTMLCanvasElement)
            } catch {
              // ignore
            }
          }}
        >
          {/* Background: deep studio black-purple */}
          <color attach="background" args={['#05020b']} />

          {/* Ambient must stay extremely low to preserve contrast */}
          <ambientLight intensity={opt.lights.ambientEnabled ? opt.lights.ambientIntensity : 0} />

          {/* Shared spotlight target at avatar center (hover height accounted for) */}
          <primitive object={lightTarget} />

          <RotatingLightRig opt={opt} lightTarget={lightTarget} />

          {/* Infinite floor + reflection plane (reflection independent from floor visibility) */}
          <Floor floorY={opt.floor.floorY} size={18} />

          {/* Separate floor shine system (condensed hotspot) */}
          <FloorShine
            enabled={opt.floorShine.floorShineEnabled}
            floorY={opt.floor.floorY}
            followWorldPoint={opt.floorShine.floorShineFollowAvatar ? floorShineCenter : null}
            radius={opt.floorShine.floorShineRadius}
            intensity={opt.floorShine.floorShineIntensity}
            falloff={opt.floorShine.floorShineFalloff}
            radiusScale={
              opt.lights.spots.reduce((acc, s) => (s.enabled ? acc + s.radiusHint : acc), 0) /
              Math.max(1, opt.lights.spots.filter((s) => s.enabled).length)
            }
          />

          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </>
  )
}
