import type { ObsEvent } from './obsTypes';
import { peekObs, dropObs } from './obsClientQueue';

export async function flushObs(writeFn: (evt: ObsEvent) => Promise<void>, limit: number = 50) {
  const batch = peekObs(limit);
  if (batch.length === 0) return { ok: true, flushed: 0 };

  const okIds: string[] = [];
  for (const evt of batch) {
    try {
      await writeFn({ ...evt, flushedAt: new Date().toISOString() });
      okIds.push(evt.eventId);
    } catch {
      // stop on first failure to avoid hammering; keep remaining queued
      break;
    }
  }
  if (okIds.length) dropObs(okIds);
  return { ok: true, flushed: okIds.length };
}
