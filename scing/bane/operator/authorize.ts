import type { OperatorAuth, OperatorResult } from './operatorTypes';

export function requireCapability(auth: OperatorAuth | undefined, cap: string): OperatorResult<true> {
  if (!auth?.identityId) return { ok: false, code: 'UNAUTHORIZED', message: 'Authentication required.' };
  if (!auth.capabilities?.includes(cap)) return { ok: false, code: 'FORBIDDEN', message: 'Insufficient capability.' };
  return { ok: true, data: true };
}
