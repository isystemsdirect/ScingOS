import { ScingRuntime } from '../core/scingRuntime'
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
