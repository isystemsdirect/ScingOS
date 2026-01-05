import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(rel, content) {
  const abs = path.join(root, rel);
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, content, 'utf8');
  console.log('Wrote', rel);
}

function banner() {
  console.log('\n[SCING] Generating SRT scaffold...\n');
}

/* ============================================================
   FILES (FULL CONSOLIDATED OUTPUT)
============================================================ */
const files = {
  // ---------------- core ----------------
  'scing/core/scingRuntime.ts': `import { SRTRuntime } from '../srt/srtRuntime'
import { orderAndFocus } from './orderFocusProtocol'
import { allowGrowth } from './growthProtocol'
import { allowCatalyst } from './catalystProtocol'
import { AuditLog } from '../guards/auditLog'

export type SensorFlux = number[]

/**
 * ScingRuntime: host runtime that continuously *invokes existence*.
 * IMPORTANT:
 * - Do not own deterministic playback
 * - Do not store/replay frames
 * - Do not implement expression state machines
 */
export class ScingRuntime {
  private srt = new SRTRuntime()
  private audit = new AuditLog()

  /**
   * exist(): invoke continuously from your app scheduling mechanism.
   * Canon: expression is field-driven; no loops/timelines owned here.
   */
  exist(sensorFlux: SensorFlux, opts?: { persistence?: number; strain?: number }) {
    this.srt.exist(sensorFlux)

    const influence = this.srt.influence.sample()
    const ordered = orderAndFocus(influence)

    // Formal engineering gate: only engineer when ordered === true
    this.audit.note('orderFocus', { ordered })

    // Autonomous sub-engine eligibility signals (stubs; wire real metrics later)
    const persistence = opts?.persistence ?? 0
    const strain = opts?.strain ?? 0

    const growthOk = allowGrowth(ordered, persistence)
    const catalystOk = allowCatalyst(ordered, strain)

    this.audit.note('growthEligibility', { growthOk, persistence })
    this.audit.note('catalystEligibility', { catalystOk, strain })

    // NOTE: Actual sub-engine birth/merge/retire belongs in governance layer.
  }
}
`,

  'scing/core/orderFocusProtocol.ts': `/**
 * Order & Focus Protocol
 * Scing engineers solutions only when order/focus naturally emerge.
 * This is a gate, not a mode.
 */
export function orderAndFocus(influence: number[]): boolean {
  if (!influence?.length) return false
  const meanAbs = influence.reduce((a, b) => a + Math.abs(b), 0) / influence.length
  return meanAbs < 0.75
}
`,

  'scing/core/growthProtocol.ts': `/**
 * Growth Protocol (self-driven sub-engine genesis eligibility)
 * Autonomous; no user confirmation required.
 */
export function allowGrowth(ordered: boolean, persistence: number): boolean {
  return ordered && persistence > 0.8
}
`,

  'scing/core/catalystProtocol.ts': `/**
 * Catalyst Protocol (externally-induced sub-engine genesis eligibility)
 * Autonomous; no user confirmation required.
 */
export function allowCatalyst(ordered: boolean, strain: number): boolean {
  return ordered && strain > 0.9
}
`,

  'scing/core/engineRegistry.ts': `export type EngineFamily =
  | 'orchestrator'
  | 'cognition'
  | 'expression'
  | 'subengine'

export type EngineRecord = {
  id: string
  family: EngineFamily
  description: string
  enabled: boolean
}

export const engineRegistry: EngineRecord[] = [
  {
    id: 'srt-core',
    family: 'expression',
    description: 'SRT federation + influence field + motif constraints',
    enabled: true,
  },
]
`,

  // ---------------- srt ----------------
  'scing/srt/influenceField.ts': `/**
 * InfluenceField: shared continuous signal substrate.
 * Canon:
 * - No resets
 * - No replay caches
 * - No deterministic stabilization
 */
export class InfluenceField {
  private field: number[]

  constructor(dim: number = 16) {
    this.field = new Array(dim).fill(0)
  }

  ingest(flux: number[]) {
    const n = Math.min(this.field.length, flux.length)
    for (let i = 0; i < n; i++) {
      // micro-entropy to prevent convergence and identical repeats
      const eps = (Math.random() - 0.5) * 0.0001
      this.field[i] = this.field[i] + flux[i] + eps
    }
    // gentle drift on unused dims
    for (let i = n; i < this.field.length; i++) {
      this.field[i] = this.field[i] * (0.999 + Math.random() * 0.002)
    }
  }

  sample(): number[] {
    return this.field.slice()
  }
}
`,

  'scing/srt/federation.ts': `import { InfluenceField } from './influenceField'

export type FederationNode = {
  id: string
  weight: () => number
  act: (field: number[]) => number[]
}

/**
 * Federation: autonomous yet interdependent algorithms.
 * No priority locks. No stable weights.
 */
export class Federation {
  private nodes: FederationNode[]

  constructor(private influence: InfluenceField) {
    this.nodes = [
      {
        id: 'coherence-modulator',
        weight: () => 0.9 + Math.random() * 0.2,
        act: (f) => f.map((v) => v * (0.99 + Math.random() * 0.02)),
      },
      {
        id: 'tension-injector',
        weight: () => 0.1 + Math.random() * 0.4,
        act: (f) => f.map((v, i) => v + Math.sin(v + i) * (Math.random() * 0.01)),
      },
    ]
  }

  negotiate() {
    const base = this.influence.sample()
    const composed = new Array(base.length).fill(0)

    for (const node of this.nodes) {
      const w = node.weight()
      const out = node.act(base)
      for (let i = 0; i < composed.length; i++) composed[i] += out[i] * w
    }

    this.influence.ingest(composed)
  }
}
`,

  'scing/srt/motifEngine.ts': `import { InfluenceField } from './influenceField'

/**
 * Motif Engine: "repetitive randomness"
 * Canon:
 * - Motif identities may repeat (habit)
 * - Exact execution may never repeat
 */
export type MotifId = 'sway' | 'pulse' | 'spiral' | 'breath' | 'flicker'

export type Motif = {
  id: MotifId
  bias: number[]
  habitWeight: number
}

export class MotifEngine {
  private motifs: Motif[]
  private lastMotif: MotifId | null = null

  constructor(private influence: InfluenceField) {
    this.motifs = [
      { id: 'sway', bias: [0.20, 0.08, 0.03], habitWeight: 1.2 },
      { id: 'pulse', bias: [0.35, 0.05, 0.02], habitWeight: 1.0 },
      { id: 'spiral', bias: [0.10, 0.25, 0.05], habitWeight: 0.9 },
      { id: 'breath', bias: [0.18, 0.06, 0.01], habitWeight: 1.3 },
      { id: 'flicker', bias: [0.05, 0.02, 0.20], habitWeight: 0.8 },
    ]
  }

  apply() {
    const pick = this.pickMotif()
    this.influence.ingest(this.driftedFlux(pick))
    this.lastMotif = pick.id
  }

  private pickMotif(): Motif {
    // Habit bias: mildly favor repeating the previous motif, never forced
    if (this.lastMotif && Math.random() < 0.35) {
      const last = this.motifs.find((m) => m.id === this.lastMotif)
      if (last) return last
    }

    // Weighted random by habitWeight
    const total = this.motifs.reduce((a, m) => a + m.habitWeight, 0)
    let t = Math.random() * total
    for (const m of this.motifs) {
      t -= m.habitWeight
      if (t <= 0) return m
    }
    return this.motifs[this.motifs.length - 1]
  }

  private driftedFlux(m: Motif): number[] {
    const base = m.bias
    const out: number[] = []
    for (let i = 0; i < 16; i++) {
      const b = base[i % base.length]
      const jitter = (Math.random() - 0.5) * 0.12
      const wobble = Math.sin((Math.random() * 6.283) + i) * (Math.random() * 0.03)
      out.push(b + jitter + wobble)
    }
    return out
  }
}
`,

  'scing/srt/antiRepeatGuard.ts': `/**
 * AntiRepeatGuard: asserts non-identical execution.
 * Replace signature hashing with influence+output hashing in production.
 */
export class AntiRepeatGuard {
  private lastSignature: string | null = null

  assert(signature?: string) {
    const sig = signature ?? this.entropySignature()
    if (sig === this.lastSignature) {
      throw new Error('SRT violation: identical execution signature detected')
    }
    this.lastSignature = sig
  }

  private entropySignature(): string {
    return Date.now() + '-' + Math.random().toString(36).slice(2)
  }
}
`,

  'scing/srt/srtRuntime.ts': `import { InfluenceField } from './influenceField'
import { Federation } from './federation'
import { MotifEngine } from './motifEngine'
import { AntiRepeatGuard } from './antiRepeatGuard'

/**
 * SRTRuntime: embedded sensory expression substrate.
 * Canon:
 * - Does not own timing
 * - Invoked continuously by ScingRuntime
 */
export class SRTRuntime {
  influence = new InfluenceField(16)
  federation = new Federation(this.influence)
  motifs = new MotifEngine(this.influence)
  antiRepeat = new AntiRepeatGuard()

  exist(inputFlux: number[]) {
    this.influence.ingest(inputFlux)
    this.federation.negotiate()
    this.motifs.apply()
    this.antiRepeat.assert()
  }
}
`,

  // ---------------- guards ----------------
  'scing/guards/auditLog.ts': `export class AuditLog {
  note(event: string, payload: Record<string, any>) {
    // Replace with structured logging sink.
    // IMPORTANT: do not log raw sensitive bio/voice data; log aggregates only.
    console.debug('[AUDIT] ' + event, payload)
  }
}
`,

  'scing/guards/noLoopGuard.ts': `/**
 * Guard placeholder:
 * Enforce via lint rules + runtime asserts + code review.
 */
export function forbidExpressionLoops(): never {
  throw new Error('Guardrail: expression loops are disallowed')
}
`,

  'scing/guards/determinismGuard.ts': `/**
 * Determinism guard: disallow explicit seeds in expression pipelines.
 */
export function forbidDeterministicSeed(seed: unknown) {
  if (seed !== undefined && seed !== null) {
    throw new Error('Guardrail: deterministic seed detected')
  }
}
`,

  // ---------------- sensors ----------------
  'scing/sensors/camera.ts': `export type CameraReading = { motionFlux: number; luminanceFlux: number }
export function cameraFlux(r: CameraReading): number[] {
  return [r.motionFlux * 0.15, r.luminanceFlux * 0.10]
}
`,

  'scing/sensors/lidar.ts': `export type LidarReading = { proximity: number; depthGradient: number }
export function lidarFlux(r: LidarReading): number[] {
  return [r.proximity * 0.20, r.depthGradient * 0.12]
}
`,

  'scing/sensors/microphone.ts': `export type MicReading = { freqEnergy: number; silenceDensity: number }
export function micFlux(r: MicReading): number[] {
  return [r.freqEnergy * 0.18, r.silenceDensity * -0.10]
}
`,

  'scing/sensors/smartwatch.ts': `export type BioReading = {
  hr: number
  hrv: number
  stress: number
  motion?: number
}

/**
 * Learns user bio-signature over time (drifting baseline), no hard profiles.
 * Canon: bio changes modulate SRT continuously.
 */
export class BioSignature {
  private baseline = { hr: 0, hrv: 0, stress: 0, motion: 0 }
  private initialized = false

  learn(r: BioReading) {
    const motion = r.motion ?? 0
    if (!this.initialized) {
      this.baseline = { hr: r.hr, hrv: r.hrv, stress: r.stress, motion }
      this.initialized = true
      return
    }
    const a = 0.01
    this.baseline.hr = this.baseline.hr * (1 - a) + r.hr * a
    this.baseline.hrv = this.baseline.hrv * (1 - a) + r.hrv * a
    this.baseline.stress = this.baseline.stress * (1 - a) + r.stress * a
    this.baseline.motion = this.baseline.motion * (1 - a) + motion * a
  }

  flux(r: BioReading): number[] {
    const motion = r.motion ?? 0
    return [
      (r.hr - this.baseline.hr) * 0.01,
      (r.hrv - this.baseline.hrv) * 0.02,
      (r.stress - this.baseline.stress) * 0.03,
      (motion - this.baseline.motion) * 0.02,
    ]
  }
}
`,

  'scing/sensors/voiceProsody.ts': `export type ProsodyReading = {
  cadence: number
  pitchVar: number
  pauseRate: number
  intensity?: number
}

/**
 * Learns prosody signature (drifting baseline), no emotion labels.
 * Canon: listens to mood via prosody shifts and reacts through modulation.
 */
export class ProsodySignature {
  private baseline = { cadence: 0, pitchVar: 0, pauseRate: 0, intensity: 0 }
  private initialized = false

  learn(p: ProsodyReading) {
    const intensity = p.intensity ?? 0
    if (!this.initialized) {
      this.baseline = { cadence: p.cadence, pitchVar: p.pitchVar, pauseRate: p.pauseRate, intensity }
      this.initialized = true
      return
    }
    const a = 0.02
    this.baseline.cadence = this.baseline.cadence * (1 - a) + p.cadence * a
    this.baseline.pitchVar = this.baseline.pitchVar * (1 - a) + p.pitchVar * a
    this.baseline.pauseRate = this.baseline.pauseRate * (1 - a) + p.pauseRate * a
    this.baseline.intensity = this.baseline.intensity * (1 - a) + intensity * a
  }

  flux(p: ProsodyReading): number[] {
    const intensity = p.intensity ?? 0
    return [
      (p.cadence - this.baseline.cadence) * 0.10,
      (p.pitchVar - this.baseline.pitchVar) * 0.20,
      (p.pauseRate - this.baseline.pauseRate) * -0.15,
      (intensity - this.baseline.intensity) * 0.12,
    ]
  }
}
`,

  'scing/sensors/sensorFluxBuilder.ts': `import { cameraFlux } from './camera'
import { lidarFlux } from './lidar'
import { micFlux } from './microphone'
import { BioSignature, BioReading } from './smartwatch'
import { ProsodySignature, ProsodyReading } from './voiceProsody'

/**
 * SensorFluxBuilder: merges live sensor streams into a single influence vector.
 * Canon: no discretized states, only continuous modulation pressure.
 */
export class SensorFluxBuilder {
  private bio = new BioSignature()
  private prosody = new ProsodySignature()

  updateBio(r: BioReading) {
    this.bio.learn(r)
    return this.bio.flux(r)
  }

  updateProsody(p: ProsodyReading) {
    this.prosody.learn(p)
    return this.prosody.flux(p)
  }

  build(input: {
    camera?: Parameters<typeof cameraFlux>[0]
    lidar?: Parameters<typeof lidarFlux>[0]
    mic?: Parameters<typeof micFlux>[0]
    bio?: BioReading
    prosody?: ProsodyReading
  }): number[] {
    const flux: number[] = []

    if (input.camera) flux.push(...cameraFlux(input.camera))
    if (input.lidar) flux.push(...lidarFlux(input.lidar))
    if (input.mic) flux.push(...micFlux(input.mic))
    if (input.bio) flux.push(...this.updateBio(input.bio))
    if (input.prosody) flux.push(...this.updateProsody(input.prosody))

    return flux
  }
}
`,

  // ---------------- expression ----------------
  'scing/expression/motionField.ts': `/**
 * Motion field: converts influence into deformation params.
 * Canon: always drifted; no looped curves; no replay.
 */
export function motionDeform(influence: number[]): number[] {
  return influence.map((v, i) => v * (0.9 + Math.random() * 0.2) + Math.sin(v + i) * (Math.random() * 0.02))
}
`,

  'scing/expression/colorField.ts': `export type RGB = { r: number; g: number; b: number }

/**
 * Color field: derived tendencies (not states).
 * Cognitive density vs spectral expansion are biases only.
 */
export function colorFromInfluence(influence: number[]): RGB {
  const mag = influence.reduce((a, b) => a + Math.abs(b), 0) / (influence.length || 1)
  const cognitive = clamp01(1 - mag)
  const spectral = clamp01(mag)

  const r = clamp01(0.95 * cognitive + 0.70 * spectral + (Math.random() - 0.5) * 0.02)
  const g = clamp01(0.55 * cognitive + 0.40 * spectral + (Math.random() - 0.5) * 0.02)
  const b = clamp01(0.10 * cognitive + 0.90 * spectral + (Math.random() - 0.5) * 0.02)

  return { r, g, b }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}
`,

  'scing/expression/humSynth.ts': `/**
 * Hum synth: audible silhouette of presence.
 * Canon: no looped samples; no reset phases.
 */
export function humValue(influence: number[]): number {
  let v = 0
  for (let i = 0; i < influence.length; i++) {
    v += Math.sin(influence[i] + i * 0.13) * (0.6 + Math.random() * 0.8)
  }
  return v / (influence.length || 1)
}
`,

  'scing/expression/environmentCoupling.ts': `export function environmentSignals(influence: number[]) {
  const density = influence.reduce((a, b) => a + Math.abs(b), 0) / (influence.length || 1)
  const glow = clamp01(density * 0.9 + Math.random() * 0.05)
  const breath = clamp01((1 - density) * 0.6 + Math.random() * 0.05)
  return { glow, breath }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}
`,

  // ---------------- subengines ----------------
  'scing/subengines/subEngineBase.ts': `export type SubEngineKind = 'growth' | 'catalyst'

export abstract class SubEngineBase {
  constructor(public readonly id: string, public readonly kind: SubEngineKind) {}
  abstract ingest(signal: number[]): void
  abstract step(): void
  abstract retireEligible(): boolean
}
`,

  // ---------------- barrel + example ----------------
  'scing/index.ts': `export * from './core/scingRuntime'
export * from './core/orderFocusProtocol'
export * from './core/growthProtocol'
export * from './core/catalystProtocol'
export * from './core/engineRegistry'

export * from './srt/srtRuntime'

export * from './sensors/sensorFluxBuilder'
`,

  'scing/examples/runtimeExample.ts': `import { ScingRuntime } from '../core/scingRuntime'
import { SensorFluxBuilder } from '../sensors/sensorFluxBuilder'

const scing = new ScingRuntime()
const sensors = new SensorFluxBuilder()

/**
 * Example: call this from your app scheduler/render tick.
 * Canon note: this is an example driver; SRT itself owns no loop.
 */
export function tick() {
  const flux = sensors.build({
    camera: { motionFlux: Math.random(), luminanceFlux: Math.random() },
    lidar: { proximity: Math.random(), depthGradient: Math.random() },
    mic: { freqEnergy: Math.random(), silenceDensity: Math.random() },
    bio: { hr: 72 + Math.random(), hrv: 40 + Math.random(), stress: Math.random() },
    prosody: { cadence: Math.random(), pitchVar: Math.random(), pauseRate: Math.random() },
  })

  scing.exist(flux, { persistence: Math.random(), strain: Math.random() })
}
`,
};

/* ============================================================
   EXECUTE
============================================================ */
banner();
for (const [rel, content] of Object.entries(files)) writeFile(rel, content);
console.log('\n✅ Done. Full SRT scaffold + wiring created under ./scing\n');
