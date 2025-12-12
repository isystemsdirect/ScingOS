
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
