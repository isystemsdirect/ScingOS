export type DevOptions = {
  showDevPanel: boolean
  showHud: boolean

  showAvatar: boolean
  showMeshWire: boolean
  showStarfield: boolean

  enableOrbitControls: boolean
  autoRotate: boolean

  micEnabled: boolean
  camEnabled: boolean

  // POST FX tuning
  bloomIntensity: number
  bloomThreshold: number
  chromaOffset: number
  vignetteDarkness: number
  vignetteOffset: number

  // Lighting tuning (multipliers)
  lightKey: number
  lightFill: number
  lightRim: number

  reflection: DevReflectionOptions

  chromaWorkstation: ChromaWorkstationOptions
}

export type DevReflectionOptions = {
  enabled: boolean
  mirror: number // 0.0 – 1.0
  strength: number // perceptual intensity scalar
  distortion: number // organic wobble
  blurX: number
  blurY: number
}

export const defaultReflectionOptions: DevReflectionOptions = {
  enabled: true,
  mirror: 0.22,
  strength: 0.65,
  distortion: 0.16,
  blurX: 220,
  blurY: 90,
}

export type ChromaWorkstationOptions = {
  enabled: boolean
  masterIntensity: number // 0..1
  brightnessCap: number // 0..1
  hueShift: number // -1..1
  waveSpeed: number // 0..3
  strobe: number // 0..1
  updateHz: number // 5..60
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function clampReflection(next: Partial<DevReflectionOptions>): Partial<DevReflectionOptions> {
  const out: Partial<DevReflectionOptions> = { ...next }
  if (typeof out.mirror === 'number') out.mirror = clamp(out.mirror, 0, 1)
  if (typeof out.strength === 'number') out.strength = clamp(out.strength, 0, 2)
  if (typeof out.distortion === 'number') out.distortion = clamp(out.distortion, 0, 0.5)
  if (typeof out.blurX === 'number') out.blurX = clamp(out.blurX, 0, 2000)
  if (typeof out.blurY === 'number') out.blurY = clamp(out.blurY, 0, 2000)
  return out
}

function clampChromaWorkstation(next: Partial<ChromaWorkstationOptions>): Partial<ChromaWorkstationOptions> {
  const out: Partial<ChromaWorkstationOptions> = { ...next }
  if (typeof out.masterIntensity === 'number') out.masterIntensity = clamp(out.masterIntensity, 0, 1)
  if (typeof out.brightnessCap === 'number') out.brightnessCap = clamp(out.brightnessCap, 0, 1)
  if (typeof out.hueShift === 'number') out.hueShift = clamp(out.hueShift, -1, 1)
  if (typeof out.waveSpeed === 'number') out.waveSpeed = clamp(out.waveSpeed, 0, 3)
  if (typeof out.strobe === 'number') out.strobe = clamp(out.strobe, 0, 1)
  if (typeof out.updateHz === 'number') out.updateHz = clamp(out.updateHz, 5, 60)
  return out
}

const DEFAULTS: DevOptions = {
  showDevPanel: true,
  showHud: true,

  showAvatar: true,
  showMeshWire: true,
  showStarfield: true,

  enableOrbitControls: true,
  autoRotate: false,

  micEnabled: true,
  camEnabled: true,

  bloomIntensity: 0.9,
  bloomThreshold: 0.15,
  chromaOffset: 0.0018,
  vignetteDarkness: 0.55,
  vignetteOffset: 0.15,

  lightKey: 0.95,
  lightFill: 0.35,
  lightRim: 0.65,

  reflection: defaultReflectionOptions,

  chromaWorkstation: {
    enabled: false,
    masterIntensity: 0.65,
    brightnessCap: 0.85,
    hueShift: 0.0,
    waveSpeed: 1.0,
    strobe: 0.0,
    updateHz: 20,
  },
}

const LS_KEY = 'scing_avatar_env_dev_options_v1'

function safeParse(raw: string | null): Partial<DevOptions> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Partial<DevOptions>) : null
  } catch {
    return null
  }
}

function load(): DevOptions {
  if (typeof window === 'undefined') return { ...DEFAULTS }
  const parsed = safeParse(window.localStorage.getItem(LS_KEY))
  return { ...DEFAULTS, ...(parsed ?? {}) }
}

function persist(next: DevOptions) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

let opt: DevOptions = load()
const subs = new Set<() => void>()

export function getDevOptions(): DevOptions {
  return opt
}

export function setDevOptions(patch: Partial<DevOptions>) {
  const next: DevOptions = {
    ...opt,
    ...patch,
    reflection: {
      ...opt.reflection,
      ...(patch.reflection ? clampReflection(patch.reflection) : null),
    },
    chromaWorkstation: {
      ...opt.chromaWorkstation,
      ...(patch.chromaWorkstation ? clampChromaWorkstation(patch.chromaWorkstation) : null),
    },
  }

  opt = next
  persist(opt)
  subs.forEach((fn) => fn())
}

export function setChromaWorkstation(patch: Partial<ChromaWorkstationOptions>) {
  setDevOptions({ chromaWorkstation: { ...opt.chromaWorkstation, ...clampChromaWorkstation(patch) } })
}

export function toggleDevOption<K extends keyof DevOptions>(key: K) {
  setDevOptions({ [key]: !opt[key] } as Partial<DevOptions>)
}

export function subscribeDevOptions(fn: () => void) {
  subs.add(fn)
  return () => {
    subs.delete(fn)
  }
}

export function resetDevOptions() {
  opt = { ...DEFAULTS }
  persist(opt)
  subs.forEach((fn) => fn())
}

export function exportDevOptionsJSON(): string {
  return JSON.stringify(opt, null, 2)
}

export function importDevOptionsJSON(json: string) {
  let parsed: Partial<DevOptions> | null = null
  try {
    parsed = JSON.parse(json) as Partial<DevOptions>
  } catch {
    return
  }
  if (!parsed || typeof parsed !== 'object') return
  setDevOptions(parsed)
}

export const CINEMATIC_PRESET: Partial<DevOptions> = {
  bloomIntensity: 1.05,
  bloomThreshold: 0.12,
  chromaOffset: 0.0022,
  vignetteDarkness: 0.62,
  vignetteOffset: 0.15,

  lightKey: 1.0,
  lightFill: 1.0,
  lightRim: 1.0,
}

export function applyCinematicPreset() {
  setDevOptions(CINEMATIC_PRESET)
}
