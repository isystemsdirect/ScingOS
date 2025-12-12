export type SubEngineKind = 'growth' | 'catalyst'

export abstract class SubEngineBase {
  constructor(public readonly id: string, public readonly kind: SubEngineKind) {}
  abstract ingest(signal: number[]): void
  abstract step(): void
  abstract retireEligible(): boolean
}
