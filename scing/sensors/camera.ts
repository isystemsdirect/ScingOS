export type CameraReading = { motionFlux: number; luminanceFlux: number }
export function cameraFlux(r: CameraReading): number[] {
  return [r.motionFlux * 0.15, r.luminanceFlux * 0.10]
}
