import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Scene3D from './visual/Scene3D'
import { AVATAR_CENTER_Y, CAMERA_Z } from './visual/scale'
import ScingAvatarLiveHud from './hud/ScingAvatarLiveHud'
import DevOptionsPanel from './ui/DevOptionsPanel'

import './styles.css'
import './ui/devPanelTheme.css'

import { getDevOptions, subscribeDevOptions, type DevOptions } from './state/devOptionsStore'
import { LAYER_AVATAR } from './visual/layers'
import { getMediaStatus, setMediaEnabled, startMediaSensors, stopMediaSensors } from './sensors/mediaSensors'
import { resetAvatarStateToDefaults, setAvatarState, setMobiusTelemetry } from './influence/InfluenceBridge'
import Floor from './visual/Floor'
import { FloorShine } from './visual/FloorShine'
import { useLightRig } from './visual/lightRig/useLightRig'

import type { MobiusState } from '../../../mobius/types'
import type { NeuralSignal } from '../../../mobius/signal'
import { tickMobius } from '../../../mobius/runtime'
import { applyIntensity, colorFromPhase } from '../../../mobius/palettes'

import { connectNeural } from './neural/client'
import { neuralEventToSignal } from './neural/mapToMobius'
import type { NeuralEvent, NeuralTransport } from './neural/types'

const mobiusInitial: MobiusState<NeuralSignal> = {
  signal: { role: 'propose', content: {}, tags: [], annotations: {} },
  phase: 0,
  invertedLatched: false,
  inversionAmplitude: 0,
}

// If you already have sensor start logic elsewhere, keep it.
// This CB does not force sensors on/off; it focuses on visual definition.

type RuntimeCrash = {
  kind: 'error' | 'unhandledrejection' | 'webglcontextlost' | 'webglcontextrestored'
  message: string
  detail?: string
  ts: number
}

function FrameHeartbeat() {
  useFrame(() => {
    try {
      window.__scing_avatar_env_last_frame_ms = performance.now()
    } catch {
      // ignore
    }
  })
  return null
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
  { onError: (message: string, detail?: string) => void; children: any; fallback?: React.ReactNode },
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
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}

function RotatingLightRig(props: { opt: DevOptions }) {
  const { opt } = props
  const { lightRefs, targets } = useLightRig(opt)

  return (
    <>
      {targets.map((t, i) => (
        <primitive key={i} object={t} />
      ))}

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
          onUpdate={(o) => o.layers.set(LAYER_AVATAR)}
        />
      ))}
    </>
  )
}

export default function App() {
  const [opt, setOpt] = useState<DevOptions>(() => getDevOptions())
  const [crash, setCrash] = useState<RuntimeCrash | null>(null)
  const [glCanvas, setGlCanvas] = useState<HTMLCanvasElement | null>(null)

  const [neuralStatus, setNeuralStatus] = useState<{ connected: boolean; error?: string } | null>(null)
  const lastRemoteEventRef = useRef<{ evt: NeuralEvent; receivedAt: number } | null>(null)

  const transport = useMemo(() => {
    const raw = (import.meta as any)?.env?.VITE_NEURAL_TRANSPORT
    const t = (typeof raw === 'string' ? raw.trim() : '') as NeuralTransport
    return t === 'poll' || t === 'sse' || t === 'ws' ? t : 'sse'
  }, [])

  const url = useMemo(() => {
    const raw = (import.meta as any)?.env?.VITE_NEURAL_URL
    return typeof raw === 'string' ? raw.trim() : ''
  }, [])

  const mobiusRef = useRef<MobiusState<NeuralSignal>>(mobiusInitial)
  const lastMobiusTRef = useRef<number>(performance.now() * 0.001)

  useEffect(() => subscribeDevOptions(() => setOpt(getDevOptions())), [])

  useEffect(() => {
    try {
      window.__scing_avatar_env_app_mounted = true
    } catch {
      // ignore
    }
  }, [])

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

  useEffect(() => {
    if (!url) {
      setNeuralStatus({ connected: false, error: 'Missing VITE_NEURAL_URL' })
      return
    }

    const unsub = connectNeural(
      { url, transport, pollIntervalMs: 500 },
      (evt) => {
        lastRemoteEventRef.current = { evt, receivedAt: Date.now() }

        // Feed Mobius semantics channel without changing the tick loop.
        try {
          mobiusRef.current = {
            ...mobiusRef.current,
            signal: neuralEventToSignal(evt),
          }
        } catch {
          // ignore
        }
      },
      (s) => setNeuralStatus(s),
    )

    return () => unsub()
  }, [transport, url])

  const lightTarget = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.set(0, AVATAR_CENTER_Y, 0)
    return o
  }, [])

  const floorShineCenter = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useEffect(() => {
    // Hard reset runtime state to known-visible defaults (runtime only; no persistence).
    resetAvatarStateToDefaults()
  }, [])

  useEffect(() => {
    let last = { source: getDevOptions().sensors.source, mic: getDevOptions().sensors.mic.enabled, cam: getDevOptions().sensors.cam.enabled }

    const apply = (o: DevOptions) => {
      const wantLive = o.sensors.source === 'live'
      const wantMic = wantLive && o.sensors.mic.enabled
      const wantCam = wantLive && o.sensors.cam.enabled

      setMediaEnabled({ mic: wantMic, cam: wantCam })

      if (wantMic || wantCam) {
        void startMediaSensors()
      } else {
        // Hard disengage: stop everything when not explicitly live-enabled.
        stopMediaSensors()
      }
    }

    apply(getDevOptions())

    const unsub = subscribeDevOptions(() => {
      const o = getDevOptions()
      if (o.sensors.source === last.source && o.sensors.mic.enabled === last.mic && o.sensors.cam.enabled === last.cam) return
      apply(o)
      last = { source: o.sensors.source, mic: o.sensors.mic.enabled, cam: o.sensors.cam.enabled }
    })

    return () => {
      unsub()
      stopMediaSensors()
    }
  }, [])

  useEffect(() => {
    // Sensor-driven avatar state driver (deterministic; no Math.random).
    const smoothed = { mic: 0, cam: 0, pitchHz: 0, pitchClarity: 0 }

    const id = window.setInterval(() => {
      const o = getDevOptions()
      const s = getMediaStatus()
      const t = performance.now() * 0.001

      const dt = Math.max(0, t - lastMobiusTRef.current)
      lastMobiusTRef.current = t

      const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

      const smoothingHz = 1 + clamp01(o.sensors.sensorSmoothing) * 20
      const k = 1 - Math.exp(-smoothingHz * dt)

      let rawMic = 0
      let rawCam = 0
      let rawPitchHz = 0
      let rawPitchClarity = 0

      if (o.sensors.source === 'sim') {
        // Deterministic simulation for safe demos (no capture).
        const micWave = 0.5 + 0.5 * Math.sin(t * 1.7)
        const camWave = 0.5 + 0.5 * Math.sin(t * 0.9 + 2.0)
        rawMic = clamp01(micWave * 0.85)
        rawCam = clamp01(camWave * 0.75)

        if (o.sensors.mic.pitchDetect) {
          rawPitchHz = 220 + 90 * Math.sin(t * 0.5 + 1.0)
          rawPitchClarity = clamp01(0.65 + 0.35 * Math.sin(t * 0.33 + 3.0))
        }
      } else {
        rawMic = clamp01(s.micRms)
        rawCam = clamp01(s.camMotion)
        rawPitchHz = s.pitchHz
        rawPitchClarity = clamp01(s.pitchClarity)
      }

      rawMic = clamp01(rawMic * o.sensors.mic.gain)
      rawCam = clamp01(rawCam * o.sensors.cam.motionSensitivity)
      rawPitchClarity = clamp01(rawPitchClarity * o.sensors.pitchSensitivity)

      smoothed.mic = smoothed.mic + (rawMic - smoothed.mic) * k
      smoothed.cam = smoothed.cam + (rawCam - smoothed.cam) * k
      smoothed.pitchHz = smoothed.pitchHz + (rawPitchHz - smoothed.pitchHz) * k
      smoothed.pitchClarity = smoothed.pitchClarity + (rawPitchClarity - smoothed.pitchClarity) * k

      const mic = clamp01(smoothed.mic)
      const camMotion = clamp01(smoothed.cam)

      const arousal = clamp01(mic * 1.35)

      // Rhythm rises with voice and gets a tiny deterministic phase nudge from pitch.
      let rhythm = clamp01(mic * 1.1)
      if (smoothed.pitchHz > 0 && smoothed.pitchClarity > 0) {
        const phase = Math.sin(t * 1.9 + smoothed.pitchHz * 0.01)
        rhythm = clamp01(rhythm + phase * 0.05 * clamp01(smoothed.pitchClarity))
      }

      const focus = clamp01(0.55 + 0.35 * (1 - camMotion))
      const cognitiveLoad = clamp01(0.35 + 0.65 * camMotion)

      // Small bounded oscillation from pitch clarity (no randomness).
      const valence = clamp01(smoothed.pitchClarity) * 0.22 * Math.sin(t * 0.33)

      // Remote neural events can override the *inputs* that drive avatar state + Mobius traversal.
      // Priority: remote signal if present, else local sensors.
      const remote = lastRemoteEventRef.current
      const remoteActive = Boolean(url && remote && Date.now() - remote.receivedAt < 5_000)

      const remoteIntensity = remoteActive ? clamp01(typeof remote!.evt.intensity === 'number' ? remote!.evt.intensity : 0) : 0
      const remoteLari = remoteActive ? clamp01(typeof remote!.evt.channels?.lari === 'number' ? remote!.evt.channels.lari : 0) : 0
      const remoteBane = remoteActive ? clamp01(typeof remote!.evt.channels?.bane === 'number' ? remote!.evt.channels.bane : 0) : 0
      const remoteIo = remoteActive ? clamp01(typeof remote!.evt.channels?.io === 'number' ? remote!.evt.channels.io : 0) : 0

      const baseArousal = remoteActive
        ? clamp01(
            typeof remote!.evt.intensity === 'number'
              ? remoteIntensity
              : remote!.evt.mode === 'alert'
                ? 1
                : remote!.evt.mode === 'speak'
                  ? 0.65
                  : remote!.evt.mode === 'think'
                    ? 0.45
                    : 0.25,
          )
        : arousal

      const baseRhythm = remoteActive
        ? clamp01(remote!.evt.mode === 'speak' ? 0.35 + 0.75 * remoteIntensity : 0.12 + 0.25 * remoteIntensity)
        : rhythm

      let baseFocus = remoteActive
        ? clamp01(remote!.evt.mode === 'alert' ? 0.25 : remote!.evt.mode === 'think' ? 0.78 : 0.6)
        : focus

      let baseCognitiveLoad = remoteActive
        ? clamp01(remote!.evt.mode === 'alert' ? 0.92 : remote!.evt.mode === 'think' ? 0.65 : 0.4)
        : cognitiveLoad

      // Channels bias the Mobius gating in predictable ways:
      // - BANE: lower focus + raise load
      // - LARI: raise focus + lower load
      if (remoteActive) {
        baseFocus = clamp01(baseFocus + 0.35 * remoteLari - 0.45 * remoteBane)
        baseCognitiveLoad = clamp01(baseCognitiveLoad + 0.55 * remoteBane - 0.35 * remoteLari)
      }

      const baseValence = remoteActive ? clamp01(remoteIo) * 0.22 * Math.sin(t * 0.33) : valence

      setAvatarState({
        arousal: baseArousal,
        rhythm: baseRhythm,
        focus: baseFocus,
        cognitiveLoad: baseCognitiveLoad,
        valence: baseValence,
        entropy: 0.04,
      })

      if (!o.mobius.mobiusEnabled) {
        setMobiusTelemetry(null)
        return
      }

      const r = tickMobius(
        mobiusRef.current,
        {
          rhythm: baseRhythm,
          cognitiveLoad: baseCognitiveLoad,
          focus: baseFocus,
          dt,
        },
        {
          k: o.mobius.phaseSpeed,
          eps: o.mobius.epsBand,
          aMax: o.mobius.aMax,
          w1: o.mobius.w1,
          w2: o.mobius.w2,
        },
      )
      mobiusRef.current = r.state

      // Palette override + emissive selector.
      const forcedFamily =
        o.mobius.paletteMode === 'forceSCING'
          ? 'SCING'
          : o.mobius.paletteMode === 'forceLARI'
            ? 'LARI'
            : o.mobius.paletteMode === 'forceBANE'
              ? 'BANE'
              : r.telem.family

      const forcedBase = colorFromPhase({
        family: forcedFamily,
        phase: r.telem.phase,
        invertedLatched: r.telem.invertedLatched,
      })
      const forcedEmissive =
        o.mobius.emissiveFrom === 'baseColor' ? forcedBase : applyIntensity(forcedBase, r.telem.inversionAmplitude)

      setMobiusTelemetry({
        ...r.telem,
        family: forcedFamily,
        baseColor: forcedBase,
        emissiveColor: forcedEmissive,
      })
    }, 50)

    return () => window.clearInterval(id)
  }, [])

  return (
    <>
      <ErrorBoundary
        onError={(message, detail) => {
          const c: RuntimeCrash = { kind: 'error', message, detail, ts: Date.now() }
          tryPersistCrash(c)
          setCrash(c)
        }}
      >
        {/* HUD: locked top-left (toggleable) */}
        {opt.ui.hudVisible ? <ScingAvatarLiveHud /> : null}
      </ErrorBoundary>

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

      <ErrorBoundary
        onError={(message, detail) => {
          const c: RuntimeCrash = { kind: 'error', message, detail, ts: Date.now() }
          tryPersistCrash(c)
          setCrash(c)
        }}
      >
        {/* Dev panel: locked top-right (<= 20% viewport) */}
        <DevOptionsPanel />
      </ErrorBoundary>

      {import.meta.env.DEV && url ? (
        <div
          style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            zIndex: 999,
            background: 'rgba(8, 6, 14, 0.72)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 10,
            padding: '8px 10px',
            color: 'rgba(255,255,255,0.9)',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 11,
            lineHeight: 1.25,
            pointerEvents: 'none',
            maxWidth: 520,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 2 }}>NEURAL</div>
          <div style={{ opacity: 0.9 }}>
            {neuralStatus?.connected ? 'CONNECTED' : 'DISCONNECTED'}
            {neuralStatus?.error ? ` (${neuralStatus.error})` : ''}
          </div>
          <div style={{ opacity: 0.65, marginTop: 4, wordBreak: 'break-all' }}>
            {transport}: {url}
          </div>
        </div>
      ) : null}

      <ErrorBoundary
        onError={(message, detail) => {
          const c: RuntimeCrash = { kind: 'error', message, detail, ts: Date.now() }
          tryPersistCrash(c)
          setCrash(c)
        }}
        fallback={
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: '#05020b',
              color: 'rgba(255,255,255,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: 12,
              padding: 16,
              textAlign: 'center',
            }}
          >
            Renderer crashed. See “RUNTIME CRASH CAPTURE”.
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, AVATAR_CENTER_Y, CAMERA_Z], fov: opt.camera.cameraFov, near: 0.05, far: 5000 }}
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
          <FrameHeartbeat />
          {/* Background: deep studio black-purple */}
          <color attach="background" args={['#05020b']} />

          {/* Ambient must stay extremely low to preserve contrast */}
          <ambientLight intensity={opt.lights.ambientEnabled ? opt.lights.ambientIntensity : 0} />

          {/* Shared spotlight target at avatar center (hover height accounted for) */}
          <primitive object={lightTarget} />

          <RotatingLightRig opt={opt} />

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
