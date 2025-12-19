type Subscriber = () => void

export type DevOptions = {
  hudVisible: boolean
  devPanelVisible: boolean

  avatarVisible: boolean
  meshVisible: boolean
  // Starfield
  starfieldEnabled: boolean

  micEnabled: boolean
  camEnabled: boolean

  // Stage 2 placeholders (implemented later)
  floorReflectionEnabled: boolean
  floorReflectionStrength: number
  floorReflectionBlur: number
  floorReflectionHeight: number

  // Stage 3 tune: condensed reflection controls (authoritative)
  floorReflectEnabled: boolean
  floorReflectStrength: number
  floorReflectRadius: number
  floorReflectFalloff: number
  floorReflectBlur: number
  floorReflectY: number

  // NEXT PHASE: condensed contact reflection controls (authoritative)
  floorReflectIntensity: number
  floorReflectSharpness: number

  // Canon phase palettes
  paletteMode: 'SCING' | 'LARI' | 'BANE'

  // Stage 3 lighting rig
  lightRigEnabled: boolean
  lightRigIntensity: number

  // Chroma Workstation (NEXT PHASE)
  chromaEnabled: boolean
  chromaChannel: 'SCING' | 'LARI' | 'BANE'
  chromaRate: number
  chromaIntensity: number
  chromaPhaseBias: number

  // Legacy placeholders (kept for compatibility; unused by this CB)
  chromaWorkstationEnabled: boolean
  chromaUpdateHz: number
  chromaDevice: 'openrgb' | 'razer' | 'logitech' | 'none'
}

const LS_KEY = 'scing_avatar_env_dev_options_store_stage1_v1'

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
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
  starfieldEnabled: true,

  micEnabled: true,
  camEnabled: true,

  floorReflectionEnabled: true,
  floorReflectionStrength: 0.28,
  floorReflectionBlur: 0.62,
  floorReflectionHeight: 0.33,

  floorReflectEnabled: true,
  floorReflectStrength: 0.55,
  floorReflectRadius: 0.38,
  floorReflectFalloff: 3.25,
  floorReflectBlur: 0.0,
  floorReflectY: -0.33,

  floorReflectIntensity: 0.55,
  floorReflectSharpness: 3.25,

  paletteMode: 'SCING',

  lightRigEnabled: true,
  lightRigIntensity: 1.0,

  chromaEnabled: false,
  chromaChannel: 'SCING',
  chromaRate: 1.0,
  chromaIntensity: 0.75,
  chromaPhaseBias: 0.0,

  chromaWorkstationEnabled: false,
  chromaUpdateHz: 20,
  chromaDevice: 'none',
}

function sanitize(next: DevOptions): DevOptions {
  // Keep this as a narrow sanitizer only (no behavioral overrides).
  // Boot-time defaults are enforced in App.tsx.
  return next
}

function load(): DevOptions {
  if (typeof window === 'undefined') return { ...DEFAULTS }
  try {
    const parsed = safeParse(window.localStorage.getItem(LS_KEY))
    const merged = { ...DEFAULTS, ...(parsed ?? {}) } as any

    // Migrate legacy starfield key.
    if (typeof merged.starfieldEnabled !== 'boolean' && typeof merged.starfieldVisible === 'boolean') {
      merged.starfieldEnabled = merged.starfieldVisible
    }

    // Migrate chroma legacy key.
    if (typeof merged.chromaEnabled !== 'boolean' && typeof merged.chromaWorkstationEnabled === 'boolean') {
      merged.chromaEnabled = merged.chromaWorkstationEnabled
    }

    // Migrate legacy camera key.
    if (typeof merged.camEnabled !== 'boolean' && typeof merged.cameraEnabled === 'boolean') {
      merged.camEnabled = merged.cameraEnabled
    }

    // Migrate legacy Stage 2 reflection fields into condensed reflection controls when present.
    if (typeof merged.floorReflectEnabled !== 'boolean' && typeof merged.floorReflectionEnabled === 'boolean') {
      merged.floorReflectEnabled = merged.floorReflectionEnabled
    }
    if (typeof merged.floorReflectStrength !== 'number' && typeof merged.floorReflectionStrength === 'number') {
      merged.floorReflectStrength = merged.floorReflectionStrength
    }
    if (typeof merged.floorReflectBlur !== 'number' && typeof merged.floorReflectionBlur === 'number') {
      // Old blur was 0..1; new is 0..0.35
      merged.floorReflectBlur = clamp(merged.floorReflectionBlur * 0.35, 0, 0.35)
    }

    // Migrate condensed reflection -> NEXT PHASE contact reflection controls.
    if (typeof merged.floorReflectIntensity !== 'number' && typeof merged.floorReflectStrength === 'number') {
      merged.floorReflectIntensity = merged.floorReflectStrength
    }
    if (typeof merged.floorReflectSharpness !== 'number' && typeof merged.floorReflectFalloff === 'number') {
      merged.floorReflectSharpness = merged.floorReflectFalloff
    }

    // Coerce/clamp numeric fields so persisted null/NaN cannot crash rendering.
    merged.floorReflectionStrength = clamp(num(merged.floorReflectionStrength, DEFAULTS.floorReflectionStrength), 0, 0.8)
    merged.floorReflectionBlur = clamp(num(merged.floorReflectionBlur, DEFAULTS.floorReflectionBlur), 0, 1)
    merged.floorReflectionHeight = clamp(num(merged.floorReflectionHeight, DEFAULTS.floorReflectionHeight), 0, 1)

    merged.floorReflectStrength = clamp(num(merged.floorReflectStrength, DEFAULTS.floorReflectStrength), 0.0, 1.25)
    merged.floorReflectRadius = clamp(num(merged.floorReflectRadius, DEFAULTS.floorReflectRadius), 0.10, 0.90)
    merged.floorReflectFalloff = clamp(num(merged.floorReflectFalloff, DEFAULTS.floorReflectFalloff), 1.0, 6.0)
    merged.floorReflectBlur = clamp(num(merged.floorReflectBlur, DEFAULTS.floorReflectBlur), 0.0, 0.35)
    merged.floorReflectY = num(merged.floorReflectY, DEFAULTS.floorReflectY)

    merged.floorReflectIntensity = clamp(num(merged.floorReflectIntensity, DEFAULTS.floorReflectIntensity), 0.0, 1.0)
    merged.floorReflectSharpness = clamp(num(merged.floorReflectSharpness, DEFAULTS.floorReflectSharpness), 1.0, 6.0)

    merged.lightRigIntensity = clamp(num(merged.lightRigIntensity, DEFAULTS.lightRigIntensity), 0.25, 1.75)

    merged.chromaRate = clamp(num(merged.chromaRate, DEFAULTS.chromaRate), 0.2, 2.5)
    merged.chromaIntensity = clamp(num(merged.chromaIntensity, DEFAULTS.chromaIntensity), 0.2, 1.8)
    merged.chromaPhaseBias = clamp(num(merged.chromaPhaseBias, DEFAULTS.chromaPhaseBias), -1.0, 1.0)

    return sanitize(merged as DevOptions)
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
  return () => {
    subs.delete(fn)
  }
}

function notify() {
  persist(state)
  subs.forEach((fn) => fn())
}

export function setDevOptions(patch: Partial<DevOptions>) {
  // Provide light migration from legacy patch keys.
  const p: any = { ...(patch as any) }

  // Legacy camera key support.
  if (typeof p.camEnabled !== 'boolean' && typeof p.cameraEnabled === 'boolean') {
    p.camEnabled = p.cameraEnabled
  }
  if (typeof p.floorReflectEnabled !== 'boolean' && typeof p.floorReflectionEnabled === 'boolean') {
    p.floorReflectEnabled = p.floorReflectionEnabled
  }
  if (typeof p.floorReflectStrength !== 'number' && typeof p.floorReflectionStrength === 'number') {
    p.floorReflectStrength = p.floorReflectionStrength
  }
  if (typeof p.floorReflectBlur !== 'number' && typeof p.floorReflectionBlur === 'number') {
    p.floorReflectBlur = clamp(p.floorReflectionBlur * 0.35, 0, 0.35)
  }

  // Legacy starfield key support.
  if (typeof p.starfieldEnabled !== 'boolean' && typeof p.starfieldVisible === 'boolean') {
    p.starfieldEnabled = p.starfieldVisible
  }

  // Legacy chroma key support.
  if (typeof p.chromaEnabled !== 'boolean' && typeof p.chromaWorkstationEnabled === 'boolean') {
    p.chromaEnabled = p.chromaWorkstationEnabled
  }

  const next: DevOptions = { ...state, ...(p as Partial<DevOptions>) }

  next.floorReflectionStrength = clamp(next.floorReflectionStrength, 0, 0.8)
  next.floorReflectionBlur = clamp(next.floorReflectionBlur, 0, 1)
  next.floorReflectionHeight = clamp(next.floorReflectionHeight, 0, 1)

  next.floorReflectStrength = clamp(next.floorReflectStrength, 0.0, 1.25)
  next.floorReflectRadius = clamp(next.floorReflectRadius, 0.1, 0.9)
  next.floorReflectFalloff = clamp(next.floorReflectFalloff, 1.0, 6.0)
  next.floorReflectBlur = clamp(next.floorReflectBlur, 0.0, 0.35)
  // floorReflectY: no hard clamp; keep numeric sanity only
  if (!Number.isFinite(next.floorReflectY)) next.floorReflectY = DEFAULTS.floorReflectY

  next.floorReflectIntensity = clamp(next.floorReflectIntensity, 0.0, 1.0)
  next.floorReflectSharpness = clamp(next.floorReflectSharpness, 1.0, 6.0)

  next.lightRigIntensity = clamp(next.lightRigIntensity, 0.25, 1.75)

  next.chromaRate = clamp(next.chromaRate, 0.2, 2.5)
  next.chromaIntensity = clamp(next.chromaIntensity, 0.2, 1.8)
  next.chromaPhaseBias = clamp(next.chromaPhaseBias, -1.0, 1.0)
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
