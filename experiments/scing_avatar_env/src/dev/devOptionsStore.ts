type Subscriber = () => void

export type DevOptions = {
  // overlays
  devPanelVisible: boolean
  hudVisible: boolean

  // visibility toggles
  avatarVisible: boolean
  meshWireVisible: boolean
  starfieldVisible: boolean

  // sensors
  micEnabled: boolean
  cameraEnabled: boolean

  // floor echo
  floorEchoEnabled: boolean
  floorEchoStrength: number // 0..1
  floorEchoBlur: number // 0..1
  floorEchoSquash: number // 0..1
  floorEchoRadius: number // 0..1

  // material
  specIntensity: number // 0..2
  veinIntensity: number // 0..2
  glassThickness: number // 0..1
  filamentStrength: number // 0..1

  // contour lights (avatar-only)
  keyLightIntensity: number // 0..1
  rimLightIntensity: number // 0..1
  fillLightIntensity: number // 0..1

  // chroma workstation (no device calls in this CB)
  chromaWorkstationEnabled: boolean
  chromaHost: string
  chromaPort: number
  chromaUpdateHz: number
  chromaMapArousalToBrightness: boolean
  chromaMapFocusToBlue: boolean
  chromaValenceHueShift: number
}

const LS_KEY = 'scing_avatar_env_dev_options_store_v2'

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function safeParse(raw: string | null): Partial<DevOptions> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Partial<DevOptions>) : null
  } catch {
    return null
  }
}

const DEFAULTS: DevOptions = {
  devPanelVisible: true,
  hudVisible: true,

  avatarVisible: true,
  meshWireVisible: false,
  starfieldVisible: true,

  micEnabled: true,
  cameraEnabled: true,

  floorEchoEnabled: true,
  floorEchoStrength: 0.18,
  floorEchoBlur: 0.65,
  floorEchoSquash: 0.55,
  floorEchoRadius: 0.7,

  specIntensity: 1.0,
  veinIntensity: 1.0,
  glassThickness: 0.55,
  filamentStrength: 0.45,

  keyLightIntensity: 0.55,
  rimLightIntensity: 0.75,
  fillLightIntensity: 0.25,

  chromaWorkstationEnabled: false,
  chromaHost: '127.0.0.1',
  chromaPort: 6742,
  chromaUpdateHz: 20,
  chromaMapArousalToBrightness: true,
  chromaMapFocusToBlue: true,
  chromaValenceHueShift: 0.15,
}

function sanitize(next: DevOptions): DevOptions {
  // Avoid persisting a completely empty scene (common "I see nothing" foot-gun).
  // If the user turned everything off, keep at least the avatar visible.
  if (!next.avatarVisible && !next.starfieldVisible && !next.meshWireVisible) {
    return { ...next, avatarVisible: true }
  }
  return next
}

function load(): DevOptions {
  if (typeof window === 'undefined') return { ...DEFAULTS }
  try {
    const parsed = safeParse(window.localStorage.getItem(LS_KEY))
    return sanitize({ ...DEFAULTS, ...(parsed ?? {}) })
  } catch {
    // If storage is blocked/disabled, fall back safely.
    return { ...DEFAULTS }
  }
}

function persist(next: DevOptions) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

let state: DevOptions = load()
const subs = new Set<Subscriber>()

export function getDevOptions(): DevOptions {
  return state
}

export function subscribeDevOptions(fn: Subscriber) {
  subs.add(fn)
  return () => subs.delete(fn)
}

function notify() {
  persist(state)
  subs.forEach((fn) => fn())
}

export function setDevOptions(patch: Partial<DevOptions>) {
  const next: DevOptions = { ...state, ...patch }

  next.floorEchoStrength = clamp(next.floorEchoStrength, 0, 1)
  next.floorEchoBlur = clamp(next.floorEchoBlur, 0, 1)
  next.floorEchoSquash = clamp(next.floorEchoSquash, 0, 1)
  next.floorEchoRadius = clamp(next.floorEchoRadius, 0, 1)

  next.specIntensity = clamp(next.specIntensity, 0, 2)
  next.veinIntensity = clamp(next.veinIntensity, 0, 2)
  next.glassThickness = clamp(next.glassThickness, 0, 1)
  next.filamentStrength = clamp(next.filamentStrength, 0, 1)

  next.keyLightIntensity = clamp(next.keyLightIntensity, 0, 1)
  next.rimLightIntensity = clamp(next.rimLightIntensity, 0, 1)
  next.fillLightIntensity = clamp(next.fillLightIntensity, 0, 1)

  next.chromaPort = Math.floor(clamp(next.chromaPort, 1, 65535))
  next.chromaUpdateHz = Math.floor(clamp(next.chromaUpdateHz, 5, 60))
  next.chromaValenceHueShift = clamp(next.chromaValenceHueShift, -1, 1)

  state = sanitize(next)
  notify()
}

export function toggle<K extends keyof DevOptions>(key: K) {
  setDevOptions({ [key]: !state[key] } as Partial<DevOptions>)
}

export function resetDevOptions() {
  state = { ...DEFAULTS }
  notify()
}
