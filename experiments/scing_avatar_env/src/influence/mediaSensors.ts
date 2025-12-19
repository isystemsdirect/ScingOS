import { setAvatarState } from './InfluenceBridge'
import { clamp01, clampRange } from './AvatarStateVector'
import { PitchDetector } from 'pitchy'
import { getDevOptions, subscribeDevOptions } from '../dev/devOptionsStore'

const clamp01Local = (v: number) => Math.max(0, Math.min(1, v))

let micEnabled = getDevOptions().sensors.mic.enabled
let camEnabled = getDevOptions().sensors.cam.enabled
subscribeDevOptions(() => {
  const opt = getDevOptions()
  micEnabled = opt.sensors.mic.enabled
  camEnabled = opt.sensors.cam.enabled
})

type RunState = {
  running: boolean
  stop?: () => void
  error?: string
  audioState?: AudioContextState
  metrics?: {
    micRms: number
    micEnergy: number
    pitchHz: number
    pitchClarity: number
    cameraMotion: number
    cameraMotionNorm: number
    lastUpdateMs: number
  }
}
const runState: RunState = { running: false }

export function getMediaSensorsStatus(): {
  running: boolean
  error?: string
  audioState?: AudioContextState
} {
  return { running: runState.running, error: runState.error, audioState: runState.audioState }
}

export function getMediaSensorsMetrics(): RunState['metrics'] {
  return runState.metrics
}

function rms(buf: Float32Array) {
  let s = 0
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]
  return Math.sqrt(s / buf.length)
}

function smooth(current: number, target: number, k: number) {
  return current + (target - current) * k
}

export async function startMediaSensors() {
  if (runState.running) return
  runState.running = true
  runState.error = undefined

  // --- MIC + CAMERA ---
  let stream: MediaStream
  try {
    const opt = getDevOptions()
    const wantAudio = opt.sensors.mic.enabled
    const wantVideo = opt.sensors.cam.enabled

    stream = await navigator.mediaDevices.getUserMedia({
      audio: wantAudio ? true : false,
      video: wantVideo
        ? {
            width: 640,
            height: 360,
            frameRate: 30,
          }
        : false,
    })
  } catch (e) {
    runState.running = false
    runState.error = e instanceof Error ? e.message : String(e)
    throw e
  }

  const hasAudioTrack = stream.getAudioTracks().length > 0
  const hasVideoTrack = stream.getVideoTracks().length > 0

  const ac = hasAudioTrack ? new AudioContext() : null
  runState.audioState = ac?.state
  const resume = () => {
    if (!ac) return
    if (ac.state !== 'running') {
      ac.resume().catch(() => {})
    }
  }

  if (ac) {
    // Help browsers that require a user gesture to start WebAudio.
    window.addEventListener('pointerdown', resume, { passive: true })
  }

  const analyser = ac ? ac.createAnalyser() : null
  const timeBuf = analyser ? new Float32Array(2048) : null
  const detector = timeBuf ? PitchDetector.forFloat32Array(timeBuf.length) : null

  if (ac && analyser) {
    analyser.fftSize = 2048
    const src = ac.createMediaStreamSource(stream)
    src.connect(analyser)
  }

  // --- CAMERA (simple motion score) ---
  const video = hasVideoTrack ? document.createElement('video') : null
  if (video) {
    video.autoplay = true
    video.muted = true
    video.playsInline = true
    video.srcObject = stream
    try {
      await video.play()
    } catch (e) {
      // Some browsers require a gesture; keep going and we'll draw when it starts.
      runState.error = `video.play failed: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  const canvas = hasVideoTrack ? document.createElement('canvas') : null
  const ctx = canvas ? canvas.getContext('2d', { willReadFrequently: true })! : null
  let prev: Uint8ClampedArray | null = null

  // Consolidated mic energy (smoothed 0..1)
  let micEnergy = 0.0

  // Camera-derived fields (kept deterministic/bounded)
  let load = 0.2

  let lastT = performance.now()

  const loop = () => {
    if (!runState.running) return
    const now = performance.now()
    const dt = Math.max(0.001, (now - lastT) / 1000)
    lastT = now

    resume()
    runState.audioState = ac?.state

    // MIC energy (RMS)
    let micRms = 0
    if (micEnabled && analyser && timeBuf) {
      analyser.getFloatTimeDomainData(timeBuf)
      micRms = rms(timeBuf) // ~0..1
      const eNorm = clamp01((micRms - 0.01) / 0.12) // adjust if needed
      micEnergy = smooth(micEnergy, eNorm, 0.08)
    } else {
      micEnergy = smooth(micEnergy, 0, 0.08)
    }

    // CONSOLIDATED: mic → state (bounded, deterministic)
    const e = clamp01(micEnergy) // micEnergy must be smoothed 0..1

    const camLoad = camEnabled ? load : 0

    // Presence baseline so silence still breathes (no dead state)
    // Camera motion nudges arousal/rhythm modestly (bounded).
    const arousal = clamp01(0.28 + e * 0.92 + camLoad * 0.12)

    // Rhythm rises with voice but stays bounded (prevents “buzz”)
    const rhythm = clamp01(0.35 + Math.pow(e, 0.75) * 0.85 + camLoad * 0.10)

    // Focus + cognitiveLoad respond to camera load (deterministic, visible)
    const focus = clamp01Local(0.55 + camLoad * 0.35)
    const cognitiveLoad = clamp01Local(0.45 + camLoad * 0.30)

    // Valence: keep neutral for now (we’ll wire prosody/pitch later)
    const valence = 0.0

    setAvatarState({
      arousal,
      rhythm,
      focus,
      cognitiveLoad,
      valence,
      entropy: 0.04, // base target; integrator adds micro-entropy deterministically
    })

    // MIC pitch proxy (for HUD only right now)
    let freq = 0
    let c = 0
    if (micEnabled && detector && timeBuf && ac) {
      const r = detector.findPitch(timeBuf, ac.sampleRate)
      freq = r[0]
      c = clamp01(r[1])
    }

    // CAMERA motion score (frame delta on small buffer)
    if (!camEnabled) {
      load = smooth(load, 0, 0.08)
      prev = null
    } else if (canvas && ctx && video) {
      const w = 96,
        h = 54
      canvas.width = w
      canvas.height = h
      try {
        ctx.drawImage(video, 0, 0, w, h)
        const img = ctx.getImageData(0, 0, w, h).data
        if (prev) {
          let diff = 0
          for (let i = 0; i < img.length; i += 4) {
            diff += Math.abs(img[i] - prev[i]) // red channel is enough
          }
          const motion = diff / (w * h) / 255
          const motionNorm = clamp01((motion - 0.01) / 0.12)
          load = smooth(load, motionNorm, 0.05)
        }
        prev = new Uint8ClampedArray(img)
      } catch {
        // If video isn't ready yet, keep values stable.
        load = smooth(load, 0, 0.05)
        prev = null
      }
    } else {
      load = smooth(load, 0, 0.05)
      prev = null
    }

    runState.metrics = {
      micRms,
      micEnergy,
      pitchHz: Number.isFinite(freq) ? freq : 0,
      pitchClarity: c,
      cameraMotion: prev ? 1 : 0,
      cameraMotionNorm: prev ? load : 0,
      lastUpdateMs: now,
    }

    // Keep deterministic valence neutral for now (pitch wiring later)
    // (clampRange import retained for future extensions)
    void dt
    void clampRange

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)

  runState.stop = () => {
    runState.running = false
    try { stream.getTracks().forEach((t) => t.stop()) } catch {}
    try { ac?.close() } catch {}
    try { window.removeEventListener('pointerdown', resume) } catch {}
  }
}

export function stopMediaSensors() {
  runState.stop?.()
}
