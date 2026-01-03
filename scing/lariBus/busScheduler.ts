import type { EngineContract, EngineInput } from './busTypes';

export type ScheduledJob = {
  engineId: string;
  everyMs: number;
  lastRunAt: number;
  makeInput: () => EngineInput;
};

export function buildDefaultSchedule(engines: EngineContract[]): ScheduledJob[] {
  // Conservative defaults; engines can ignore tick inputs they don’t need
  return engines
    .filter((e) => e.engineId !== 'BANE' && e.engineId !== 'SCING')
    .map((e) => ({
      engineId: e.engineId,
      everyMs: 500,
      lastRunAt: 0,
      makeInput: () => ({ kind: 'tick', dtMs: 500 }),
    }));
}
