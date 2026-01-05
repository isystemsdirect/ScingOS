import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = (p, c) => {
  const a = path.join(root, p);
  fs.mkdirSync(path.dirname(a), { recursive: true });
  fs.writeFileSync(a, c, 'utf8');
  console.log('Wrote', p);
};

/* ===============================
   SensorFlux Builder
================================ */
write(
  'scing/sensors/sensorFluxBuilder.ts',
  `
import { cameraFlux } from './camera'
import { lidarFlux } from './lidar'
import { micFlux } from './microphone'
import { BioSignature, BioReading } from './smartwatch'
import { ProsodySignature, ProsodyReading } from './voiceProsody'

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
`
);

/* ===============================
   Barrel Export
================================ */
write(
  'scing/index.ts',
  `
export * from './core/scingRuntime'
export * from './core/orderFocusProtocol'
export * from './core/growthProtocol'
export * from './core/catalystProtocol'

export * from './srt/srtRuntime'

export * from './sensors/sensorFluxBuilder'
`
);

/* ===============================
   Minimal Runtime Example
================================ */
write(
  'scing/examples/runtimeExample.ts',
  `
import { ScingRuntime } from '../core/scingRuntime'
import { SensorFluxBuilder } from '../sensors/sensorFluxBuilder'

const scing = new ScingRuntime()
const sensors = new SensorFluxBuilder()

// Example invocation — call from your app scheduler / render tick
export function tick() {
  const flux = sensors.build({
    camera: { motionFlux: Math.random(), luminanceFlux: Math.random() },
    lidar: { proximity: Math.random(), depthGradient: Math.random() },
    mic: { freqEnergy: Math.random(), silenceDensity: Math.random() },
    bio: { hr: 72 + Math.random(), hrv: 40 + Math.random(), stress: Math.random() },
    prosody: { cadence: Math.random(), pitchVar: Math.random(), pauseRate: Math.random() },
  })

  scing.exist(flux, {
    persistence: Math.random(),
    strain: Math.random(),
  })
}
`
);

console.log('\n✅ VSCI CB complete: SensorFlux + wiring added\n');
