type Subscriber = () => void

export type DevOptions = {
  showAvatar: boolean
  showHud: boolean
  showDevPanel: boolean
  showWireframe: boolean
  showMesh: boolean
  showStarfield: boolean

  enableMic: boolean
  enableCamera: boolean

  allowCameraControls: boolean
  autorotateCamera: boolean

  reflectionEnabled: boolean
  reflectionStrength: number // 0..1
  reflectionBlur: number // 0..1
  reflectionHeight: number // 0..1
  floorRoughness: number // 0..1
  floorMetalness: number // 0..1

  bloomIntensity: number // 0..2
  rimStrength: number // 0..1

  studioLightsEnabled: boolean
  studioLightsAffectOnlyAvatar: boolean

  chromaWorkstationEnabled: boolean
  chromaWorkstationIntensity: number // 0..1
  chromaWorkstationPalette: 'SpectraFlameDarkV2' | 'NeonGlassBulbs'
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
  showAvatar: true,
  showHud: true,
  showDevPanel: true,
  showWireframe: false,
  showMesh: true,
  showStarfield: true,

  enableMic: true,
  enableCamera: false,

  allowCameraControls: true,
  autorotateCamera: false,

  reflectionEnabled: true,
  reflectionStrength: 0.18,
  reflectionBlur: 0.55,
  reflectionHeight: 0.33,
  floorRoughness: 0.65,
  floorMetalness: 0.15,

  bloomIntensity: 0.85,
  rimStrength: 0.22,

  studioLightsEnabled: true,
  studioLightsAffectOnlyAvatar: true,

  chromaWorkstationEnabled: false,
  chromaWorkstationIntensity: 0.35,
  chromaWorkstationPalette: 'SpectraFlameDarkV2',
}

function sanitize(next: DevOptions): DevOptions {
  // Boot-safe: never allow a "nothing visible" boot.
  // If the user persisted "avatar off" or "hud off", force them on at boot.
  const bootSafe = { ...next }
  if (!bootSafe.showAvatar) bootSafe.showAvatar = true
  if (!bootSafe.showHud) bootSafe.showHud = true
  return bootSafe
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

  next.reflectionStrength = clamp(next.reflectionStrength, 0, 1)
  next.reflectionBlur = clamp(next.reflectionBlur, 0, 1)
  next.reflectionHeight = clamp(next.reflectionHeight, 0, 1)
  next.floorRoughness = clamp(next.floorRoughness, 0, 1)
  next.floorMetalness = clamp(next.floorMetalness, 0, 1)

  next.bloomIntensity = clamp(next.bloomIntensity, 0, 2)
  next.rimStrength = clamp(next.rimStrength, 0, 1)

  next.chromaWorkstationIntensity = clamp(next.chromaWorkstationIntensity, 0, 1)

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
