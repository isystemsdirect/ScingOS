import type { BaneStore } from '../storage/baneStore';
import type { OperatorAuth, OperatorResult } from './operatorTypes';
import { requireCapability } from './authorize';
import { lockIdentity, unlockIdentity } from '../runtime/riskLedger';

export function makeBaneOperatorApi(store: BaneStore) {
  return {
    async getRecentAudits(auth: OperatorAuth, limit = 50): Promise<OperatorResult<unknown[]>> {
      const ok = requireCapability(auth, 'bane:operator');
      if (!ok.ok) return ok;
      try {
        const rows = await store.getRecentAudits(Math.max(1, Math.min(200, limit)));
        return { ok: true, data: rows };
      } catch {
        return { ok: false, code: 'ERROR', message: 'Failed to read audits.' };
      }
    },

    async unlockIdentity(auth: OperatorAuth, identityId: string): Promise<OperatorResult<{ identityId: string }>> {
      const ok = requireCapability(auth, 'bane:operator');
      if (!ok.ok) return ok;
      try {
        unlockIdentity(identityId);
        return { ok: true, data: { identityId } };
      } catch {
        return { ok: false, code: 'ERROR', message: 'Failed to unlock identity.' };
      }
    },

    async forceLockIdentity(
      auth: OperatorAuth,
      identityId: string,
      ttlMs: number
    ): Promise<OperatorResult<{ identityId: string; ttlMs: number }>> {
      const ok = requireCapability(auth, 'bane:operator');
      if (!ok.ok) return ok;
      const bounded = Math.max(5_000, Math.min(24 * 60 * 60 * 1000, ttlMs));
      try {
        lockIdentity(identityId, bounded);
        return { ok: true, data: { identityId, ttlMs: bounded } };
      } catch {
        return { ok: false, code: 'ERROR', message: 'Failed to lock identity.' };
      }
    },
  };
}
