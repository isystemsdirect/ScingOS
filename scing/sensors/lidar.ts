export type LidarReading = { proximity: number; depthGradient: number }
export function lidarFlux(r: LidarReading): number[] {
  return [r.proximity * 0.20, r.depthGradient * 0.12]
}
