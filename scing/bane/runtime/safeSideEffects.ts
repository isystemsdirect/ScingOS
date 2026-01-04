import type { BaneInput, BaneOutput, BaneRuntimeConfig } from '../types';
import { toAuditRecord } from '../storage/toAuditRecord';

export function safeSideEffects(config: BaneRuntimeConfig, input: BaneInput, out: BaneOutput) {
  // Store: never block, never throw
  try {
    const store = config.store;
    if (store) {
      const rec = toAuditRecord(input, out);
      void store.appendAudit(rec).catch(() => {});
      void store
        .appendEvent({
          type: 'BANE_DECISION',
          traceId: out.traceId,
          at: Date.now(),
          data: {
            verdict: out.verdict,
            severity: out.severity,
            enforcementLevel: out.enforcementLevel,
          },
        })
        .catch(() => {});
    }
  } catch {
    // swallow
  }
}
