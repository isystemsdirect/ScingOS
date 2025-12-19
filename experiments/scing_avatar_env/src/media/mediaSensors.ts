export type MediaStatus = {
  micRunning: boolean
  camRunning: boolean
  audioState: string
  error?: string
  micRms: number
  pitchHz: number
  pitchClarity: number
  camMotion: number
}

type MediaEnabled = { mic: boolean; cam: boolean }

type PitchyModule = {
  PitchDetector: {
    forFloat32Array: (size: number) => {
      findPitch: (buf: Float32Array, sampleRate: number) => [number, number]
    }
  }
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

let enabled: MediaEnabled = { mic: true, cam: true }

let status: MediaStatus = {
  micRunning: false,
  camRunning: false,
  audioState: 'idle',
  error: undefined,
  micRms: 0,
  pitchHz: 0,
  pitchClarity: 0,
  camMotion: 0,
}

let audioCtx: AudioContext | null = null
let micStream: MediaStream | null = null
let camStream: MediaStream | null = null
let analyser: AnalyserNode | null = null
let micBuf: Float32Array | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pitchDetector: any | null = null
let pitchyLoaded: 'unknown' | 'loaded' | 'missing' = 'unknown'

let micTimer: number | null = null
let pitchTimer: number | null = null
let camTimer: number | null = null
let watchdogTimer: number | null = null

let resumeHandlerAttached = false

let videoEl: HTMLVideoElement | null = null
let camCanvas: HTMLCanvasElement | null = null
let camCtx: CanvasRenderingContext2D | null = null
let camPrev: Uint8ClampedArray | null = null

let micSmoothedRms = 0
let lastMicEnableMs = 0
let lastCamEnableMs = 0

let visibilityHandlerAttached = false
let visibilityHandler: (() => void) | null = null

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function setError(err?: string) {
  status = { ...status, error: err }
}

function attachResumeOnGesture() {
  if (!audioCtx) return
  if (resumeHandlerAttached) return
  resumeHandlerAttached = true

  const onGesture = () => {
    resumeHandlerAttached = false
    if (!audioCtx) return
    if (audioCtx.state === 'suspended') {
      audioCtx
        .resume()
        .then(() => {
          status = { ...status, audioState: audioCtx?.state ?? 'unknown' }
        })
        .catch((e) => {
          setError(`AUDIO RESUME FAILED: ${e instanceof Error ? e.message : String(e)}`)
        })
    }
  }

  window.addEventListener('pointerdown', onGesture, { passive: true, once: true, capture: true })
}

function attachVisibilityHandler() {
  if (visibilityHandlerAttached) return
  visibilityHandlerAttached = true

  visibilityHandler = () => {
    if (!enabled.mic) return
    if (!audioCtx) return

    // When the tab is hidden, suspend processing to reduce power.
    // When it returns, best-effort resume (some browsers require a gesture).
    if (document.visibilityState === 'hidden') {
      if (audioCtx.state === 'running') {
        audioCtx
          .suspend()
          .then(() => {
            status = { ...status, audioState: audioCtx?.state ?? 'unknown' }
          })
          .catch(() => {
            // ignore
          })
      }
      return
    }

    if (audioCtx.state === 'suspended') {
      audioCtx
        .resume()
        .then(() => {
          status = { ...status, audioState: audioCtx?.state ?? 'unknown' }
        })
        .catch(() => {
          attachResumeOnGesture()
        })
    }
  }

  document.addEventListener('visibilitychange', visibilityHandler, { passive: true })
}

function detachVisibilityHandler() {
  if (!visibilityHandlerAttached) return
  visibilityHandlerAttached = false
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
  }
  visibilityHandler = null
}

async function loadPitchy(): Promise<PitchyModule | null> {
  if (pitchyLoaded === 'loaded') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await import('pitchy')) as any
  }
  if (pitchyLoaded === 'missing') return null

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = (await import('pitchy')) as any
    pitchyLoaded = 'loaded'
    return mod as PitchyModule
  } catch {
    pitchyLoaded = 'missing'
    return null
  }
}

function trackLive(stream: MediaStream | null, kind: 'audio' | 'video'): boolean {
  if (!stream) return false
  const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks()
  if (!tracks.length) return false
  return tracks.some((t) => t.readyState === 'live')
}

async function startMic(): Promise<void> {
  if (!enabled.mic) return
  if (micStream && trackLive(micStream, 'audio')) return

  lastMicEnableMs = nowMs()
  setError(undefined)

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    })
  } catch (e) {
    setError(`MIC ERROR: ${e instanceof Error ? e.message : String(e)}`)
    micStream = null
    return
  }

  try {
    audioCtx = new AudioContext()
    status = { ...status, audioState: audioCtx.state }

    attachVisibilityHandler()

    if (audioCtx.state !== 'running') {
      attachResumeOnGesture()
    }

    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    micBuf = new Float32Array(analyser.fftSize)

    const src = audioCtx.createMediaStreamSource(micStream)
    src.connect(analyser)

    const pitchy = await loadPitchy()
    if (pitchy && micBuf) {
      pitchDetector = pitchy.PitchDetector.forFloat32Array(micBuf.length)
    } else {
      pitchDetector = null
    }

    if (micTimer == null) {
      // 20–30 Hz RMS update
      micTimer = window.setInterval(sampleMicRms, 40)
    }

    if (pitchTimer == null) {
      // 20–30 Hz pitch update
      pitchTimer = window.setInterval(samplePitch, 40)
    }
  } catch (e) {
    setError(`MIC INIT ERROR: ${e instanceof Error ? e.message : String(e)}`)
  }
}

function stopMic() {
  if (micTimer != null) {
    window.clearInterval(micTimer)
    micTimer = null
  }
  if (pitchTimer != null) {
    window.clearInterval(pitchTimer)
    pitchTimer = null
  }

  try {
    analyser?.disconnect()
  } catch {
    // ignore
  }

  analyser = null
  micBuf = null
  pitchDetector = null

  try {
    micStream?.getTracks().forEach((t) => t.stop())
  } catch {
    // ignore
  }
  micStream = null

  try {
    audioCtx?.close()
  } catch {
    // ignore
  }
  audioCtx = null
  resumeHandlerAttached = false
  detachVisibilityHandler()

  micSmoothedRms = 0
  status = {
    ...status,
    micRms: 0,
    pitchHz: 0,
    pitchClarity: 0,
    audioState: enabled.mic ? status.audioState : 'idle',
  }
}

function sampleMicRms() {
  if (!enabled.mic || !analyser || !micBuf) {
    micSmoothedRms = micSmoothedRms * 0.85
    status = { ...status, micRms: micSmoothedRms }
    return
  }

  status = { ...status, audioState: audioCtx?.state ?? 'unknown' }

  if (audioCtx && audioCtx.state !== 'running') {
    attachResumeOnGesture()
    return
  }

  analyser.getFloatTimeDomainData(micBuf as unknown as Float32Array<ArrayBuffer>)

  let s = 0
  for (let i = 0; i < micBuf.length; i++) {
    const x = micBuf[i]
    s += x * x
  }
  const rms = Math.sqrt(s / micBuf.length)

  // Exponential smoothing alpha ~ 0.15
  const alpha = 0.15
  micSmoothedRms = micSmoothedRms + (rms - micSmoothedRms) * alpha

  status = { ...status, micRms: clamp01(micSmoothedRms) }
}

function samplePitch() {
  if (!enabled.mic || !pitchDetector || !micBuf || !audioCtx) {
    status = { ...status, pitchHz: 0, pitchClarity: 0 }
    return
  }

  if (audioCtx.state !== 'running') {
    status = { ...status, pitchHz: 0, pitchClarity: 0 }
    attachResumeOnGesture()
    return
  }

  try {
    const r = pitchDetector.findPitch(micBuf, audioCtx.sampleRate)
    const hz = Number.isFinite(r[0]) ? r[0] : 0
    const clarity = clamp01(r[1])
    status = { ...status, pitchHz: hz, pitchClarity: clarity }
  } catch {
    status = { ...status, pitchHz: 0, pitchClarity: 0 }
  }
}

async function startCam(): Promise<void> {
  if (!enabled.cam) return
  if (camStream && trackLive(camStream, 'video')) return

  lastCamEnableMs = nowMs()
  setError(undefined)

  try {
    camStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  } catch (e) {
    setError(`CAM ERROR: ${e instanceof Error ? e.message : String(e)}`)
    camStream = null
    return
  }

  try {
    videoEl = document.createElement('video')
    videoEl.autoplay = true
    videoEl.muted = true
    videoEl.playsInline = true
    videoEl.srcObject = camStream

    // hidden element; we only sample frames.
    videoEl.style.position = 'fixed'
    videoEl.style.left = '-99999px'
    videoEl.style.top = '-99999px'
    videoEl.style.width = '1px'
    videoEl.style.height = '1px'
    document.body.appendChild(videoEl)

    try {
      await videoEl.play()
    } catch (e) {
      setError(`CAM PLAY ERROR: ${e instanceof Error ? e.message : String(e)}`)
    }

    camCanvas = document.createElement('canvas')
    camCtx = camCanvas.getContext('2d', { willReadFrequently: true })
    camPrev = null

    if (camTimer == null) {
      // 10–15 Hz sampling (66–100ms)
      camTimer = window.setInterval(sampleCamMotion, 80)
    }
  } catch (e) {
    setError(`CAM INIT ERROR: ${e instanceof Error ? e.message : String(e)}`)
  }
}

function stopCam() {
  if (camTimer != null) {
    window.clearInterval(camTimer)
    camTimer = null
  }

  try {
    camStream?.getTracks().forEach((t) => t.stop())
  } catch {
    // ignore
  }
  camStream = null

  try {
    const parent = videoEl?.parentNode
    if (parent) parent.removeChild(videoEl as Node)
  } catch {
    // ignore
  }

  videoEl = null
  camCanvas = null
  camCtx = null
  camPrev = null

  status = { ...status, camMotion: 0 }
}

function sampleCamMotion() {
  if (!enabled.cam || !videoEl || !camCanvas || !camCtx) {
    status = { ...status, camMotion: 0 }
    camPrev = null
    return
  }

  const w = 96
  const h = 54
  camCanvas.width = w
  camCanvas.height = h

  // If video isn't ready yet, keep stable and wait.
  if (videoEl.readyState < 2 || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
    status = { ...status, camMotion: 0 }
    camPrev = null
    return
  }

  try {
    camCtx.drawImage(videoEl, 0, 0, w, h)
    const data = camCtx.getImageData(0, 0, w, h).data

    if (!camPrev) {
      camPrev = new Uint8ClampedArray(data)
      status = { ...status, camMotion: 0 }
      return
    }

    let diff = 0
    for (let i = 0; i < data.length; i += 4) {
      diff += Math.abs(data[i] - camPrev[i])
    }

    camPrev = new Uint8ClampedArray(data)

    const pixels = w * h
    const avg = diff / pixels / 255 // 0..1

    // Boost a bit for visibility while staying deterministic & bounded.
    const motion = clamp01(avg * 3.0)

    status = { ...status, camMotion: motion }
  } catch (e) {
    setError(`CAM SAMPLE ERROR: ${e instanceof Error ? e.message : String(e)}`)
    status = { ...status, camMotion: 0 }
    camPrev = null
  }
}

function sampleWatchdog() {
  const micLive = enabled.mic && trackLive(micStream, 'audio')
  const camLive = enabled.cam && trackLive(camStream, 'video')

  status = {
    ...status,
    micRunning: micLive,
    camRunning: camLive,
    audioState: audioCtx?.state ?? (enabled.mic ? 'suspended' : 'idle'),
  }

  const t = nowMs()
  const micDead = enabled.mic && !micLive && t - lastMicEnableMs > 3000
  const camDead = enabled.cam && !camLive && t - lastCamEnableMs > 3000

  // Failsafe should never overwrite a real permission/device error.
  const existing = status.error
  const canOverride = !existing || existing.toUpperCase().includes('NOT ACTIVE')
  if (!canOverride) return

  if (micDead && camDead) setError('MIC NOT ACTIVE; CAM NOT ACTIVE')
  else if (micDead) setError('MIC NOT ACTIVE')
  else if (camDead) setError('CAM NOT ACTIVE')
}

function ensureWatchdog() {
  if (watchdogTimer != null) return
  watchdogTimer = window.setInterval(sampleWatchdog, 250)
}

function maybeStopWatchdog() {
  if (enabled.mic || enabled.cam) return
  if (watchdogTimer != null) {
    window.clearInterval(watchdogTimer)
    watchdogTimer = null
  }
}

export function getMediaStatus(): MediaStatus {
  return { ...status }
}

export async function startMediaSensors(): Promise<void>
export async function startMediaSensors(opts?: { mic: boolean; cam: boolean }): Promise<void>
export async function startMediaSensors(opts?: { mic: boolean; cam: boolean }): Promise<void> {
  if (opts) enabled = { mic: !!opts.mic, cam: !!opts.cam }

  ensureWatchdog()

  // Start requested streams independently so one failure doesn't block the other.
  if (enabled.mic) await startMic()
  else stopMic()

  if (enabled.cam) await startCam()
  else stopCam()

  maybeStopWatchdog()
}

export function stopMediaSensors(): void {
  enabled = { mic: false, cam: false }
  stopMic()
  stopCam()
  maybeStopWatchdog()
  setError(undefined)
  status = {
    ...status,
    micRunning: false,
    camRunning: false,
    audioState: 'idle',
    micRms: 0,
    pitchHz: 0,
    pitchClarity: 0,
    camMotion: 0,
  }
}

export function setMediaEnabled(v: { mic?: boolean; cam?: boolean }): void {
  const next: MediaEnabled = {
    mic: v.mic ?? enabled.mic,
    cam: v.cam ?? enabled.cam,
  }

  const micChanged = next.mic !== enabled.mic
  const camChanged = next.cam !== enabled.cam

  enabled = next

  if (enabled.mic && micChanged) {
    void startMic()
  }
  if (!enabled.mic && micChanged) {
    stopMic()
  }

  if (enabled.cam && camChanged) {
    void startCam()
  }
  if (!enabled.cam && camChanged) {
    stopCam()
  }

  if (enabled.mic || enabled.cam) ensureWatchdog()
  else maybeStopWatchdog()
}
