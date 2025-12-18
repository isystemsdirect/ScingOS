type Subscriber = () => void

export type DevOptions = {
  hudVisible: boolean
  devPanelVisible: boolean

  avatarVisible: boolean
  meshVisible: boolean
  starfieldVisible: boolean

  micEnabled: boolean
  cameraEnabled: boolean

  // Stage 2 placeholders (implemented later)
  floorReflectionEnabled: boolean
  floorReflectionStrength: number
  floorReflectionBlur: number

  // Stage 3 placeholders
  chromaWorkstationEnabled: boolean
  chromaIntensity: number
  chromaUpdateHz: number
  chromaDevice: 'openrgb' | 'razer' | 'logitech' | 'none'
}

const LS_KEY = 'scing_avatar_env_dev_options_store_stage1_v1'

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
  hudVisible: true,
  devPanelVisible: true,

  avatarVisible: true,
  meshVisible: false,
  starfieldVisible: true,

  micEnabled: true,
  cameraEnabled: true,

  floorReflectionEnabled: true,
  floorReflectionStrength: 0.35,
  floorReflectionBlur: 0.55,

  chromaWorkstationEnabled: false,
  chromaIntensity: 0.75,
  chromaUpdateHz: 20,
  chromaDevice: 'none',
}

function sanitize(next: DevOptions): DevOptions {
  // Boot-safe: never allow a "nothing visible" boot.
  // If the user persisted "avatar off" or "hud off", force them on at boot.
  const bootSafe = { ...next }
  if (!bootSafe.avatarVisible) bootSafe.avatarVisible = true
  if (!bootSafe.hudVisible) bootSafe.hudVisible = true
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

  next.floorReflectionStrength = clamp(next.floorReflectionStrength, 0, 0.8)
  next.floorReflectionBlur = clamp(next.floorReflectionBlur, 0, 1)

  next.chromaIntensity = clamp(next.chromaIntensity, 0, 1)
  next.chromaUpdateHz = Math.max(1, Math.min(120, Math.floor(next.chromaUpdateHz)))

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

export function resetDefaults() {
  resetDevOptions()
}
