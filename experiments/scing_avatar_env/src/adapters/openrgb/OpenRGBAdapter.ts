import { OpenRGBClient, utils } from 'openrgb-sdk'
import type { AvatarStateVector } from '../../influence/AvatarStateVector'
import { clamp01, clampRange } from '../../influence/AvatarStateVector'
import { getAvatarState } from '../../influence/InfluenceBridge'

/** Minimal capability gate contract (BANE). Implement using your real BANE layer. */
export interface CapabilityGate {
  require(capability: string): Promise<void>
}

export type RGB01 = { r: number; g: number; b: number }

function linear01ToGamma8(x01: number, gamma = 2.2): number {
  const x = clamp01(x01)
  const corrected = Math.pow(x, 1 / gamma)
  const v = Math.round(corrected * 255)
  return Math.max(0, Math.min(255, v))
}

type OpenRgbDeviceParam = Parameters<OpenRGBClient['updateLeds']>[0]
type OpenRgbColor = ReturnType<typeof utils.color>

type ListedDevice = {
  name: string
  ledCount: number
  controller: OpenRgbDeviceParam
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function getControllerName(controller: unknown): string {
  if (!isRecord(controller)) return ''
  const n = controller['name']
  return typeof n === 'string' ? n : ''
}

function getControllerLedCount(controller: unknown): number {
  if (!isRecord(controller)) return 0
  const leds = controller['leds']
  return Array.isArray(leds) ? leds.length : 0
}

function listControllers(controllersUnknown: unknown): ListedDevice[] {
  if (!Array.isArray(controllersUnknown)) return []

  const out: ListedDevice[] = []
  for (const c of controllersUnknown) {
    const name = getControllerName(c)
    const ledCount = getControllerLedCount(c)
    if (!name) continue

    // Narrow to the SDK's expected device param via a type assertion (no `any`).
    out.push({ name, ledCount, controller: c as OpenRgbDeviceParam })
  }
  return out
}

export async function runOpenRgbInfluenceLoop(params: {
  bane: CapabilityGate
  address?: string
  port?: number
  clientName?: string
  preferredDeviceName?: string
  intervalMs?: number
  gamma?: number
  sampleAvatarState?: () => AvatarStateVector
  mapAvatarStateToRgb?: (v: AvatarStateVector) => RGB01
}): Promise<void> {
  const {
    bane,
    address = 'localhost',
    port = 6742,
    clientName = 'ScingAvatar',
    preferredDeviceName,
    intervalMs = 50,
    gamma = 2.2,
    sampleAvatarState = defaultSampleAvatarState,
    mapAvatarStateToRgb = defaultMapAvatarStateToRgb,
  } = params

  // Fail-closed: do not actuate unless authorized.
  await bane.require('device.rgb.write')

  const client = new OpenRGBClient({ address, port, name: clientName })
  await client.connect()

  const controllersUnknown: unknown = await client.getAllControllerData()
  const devices = listControllers(controllersUnknown)

  if (devices.length === 0) {
    throw new Error('No OpenRGB controllers detected')
  }

  const selected = selectDevice(devices, preferredDeviceName)
  if (selected.ledCount <= 0) {
    throw new Error('Selected OpenRGB device has no LEDs')
  }

  let running = true
  const stop = () => {
    running = false
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)

  await runNoOverlapLoop({
    intervalMs,
    isRunning: () => running,
    onError: (err) => {
      // Keep running by default; callers can change behavior.
      console.error('[OpenRGBAdapter] tick error:', err)
    },
    tick: async () => {
      const state = sampleAvatarState()

      const rgb01 = mapAvatarStateToRgb(state)

      const r8 = linear01ToGamma8(rgb01.r, gamma)
      const g8 = linear01ToGamma8(rgb01.g, gamma)
      const b8 = linear01ToGamma8(rgb01.b, gamma)

      const color: OpenRgbColor = utils.color(r8, g8, b8)
      const colors: OpenRgbColor[] = Array.from({ length: selected.ledCount }, () => color)

      await client.updateLeds(selected.controller, colors)
    },
  })
}

function selectDevice(devices: ListedDevice[], preferredName?: string): ListedDevice {
  const preferred = preferredName?.trim().toLowerCase()
  if (preferred) {
    const match = devices.find((d) => d.name.toLowerCase() === preferred)
    if (match) return match
  }

  const withLeds = devices.find((d) => d.ledCount > 0)
  return withLeds ?? devices[0]
}

async function runNoOverlapLoop(params: {
  intervalMs: number
  isRunning: () => boolean
  tick: () => Promise<void>
  onError?: (err: unknown) => void
}): Promise<void> {
  const { intervalMs, isRunning, tick, onError } = params

  while (isRunning()) {
    const start = Date.now()
    try {
      await tick()
    } catch (err) {
      onError?.(err)
    } finally {
      const elapsed = Date.now() - start
      const sleepMs = Math.max(0, intervalMs - elapsed)
      await new Promise<void>((resolve) => setTimeout(resolve, sleepMs))
    }
  }
}

function defaultSampleAvatarState(): AvatarStateVector {
  // If nothing drives the bridge yet, fall back to current bridge state.
  // This keeps OpenRGB optional and consistent with the single state boundary.
  const v = getAvatarState()
  return {
    arousal: clamp01(v.arousal),
    valence: clampRange(v.valence, -1, 1),
    cognitiveLoad: clamp01(v.cognitiveLoad),
    rhythm: clamp01(v.rhythm),
    entropy: clampRange(v.entropy, 0.02, 0.08),
    focus: clamp01(v.focus),
  }
}

function defaultMapAvatarStateToRgb(v: AvatarStateVector): RGB01 {
  // Mapping requirement:
  // r ~ arousal
  // g ~ (1 - cognitiveLoad)
  // b ~ focus
  // Optional: valence as subtle bounded hue bias.
  const r = clamp01(v.arousal)
  const g = clamp01(1 - v.cognitiveLoad)
  const b = clamp01(v.focus)

  const bias = clampRange(v.valence, -1, 1) * 0.06
  return {
    r: clamp01(r + bias),
    g: clamp01(g),
    b: clamp01(b - bias),
  }
}
