export type MicReading = { freqEnergy: number; silenceDensity: number };
export function micFlux(r: MicReading): number[] {
  return [r.freqEnergy * 0.18, r.silenceDensity * -0.1];
}
