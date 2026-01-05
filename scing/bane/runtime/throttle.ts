export type ThrottleDecision =
  | { action: 'none' }
  | { action: 'delay'; delayMs: number }
  | { action: 'block'; retryAfterMs: number };

type ThrottleState = {
  strikes: number;
  lastAt: number;
};

const state = new Map<string, ThrottleState>();

function key(identityId?: string, ipHash?: string): string {
  return identityId ? `id:${identityId}` : ipHash ? `ip:${ipHash}` : 'anon';
}

export function noteHostileAttempt(params: { identityId?: string; ipHash?: string; now?: number }): ThrottleState {
  const now = params.now ?? Date.now();
  const k = key(params.identityId, params.ipHash);
  const prev = state.get(k);

  const strikes = (prev?.strikes ?? 0) + 1;
  const next: ThrottleState = { strikes, lastAt: now };
  state.set(k, next);
  return next;
}

export function decideThrottle(params: { identityId?: string; ipHash?: string; now?: number }): ThrottleDecision {
  const now = params.now ?? Date.now();
  const k = key(params.identityId, params.ipHash);
  const s = state.get(k);
  if (!s) return { action: 'none' };

  const delayMs = Math.min(250 * Math.pow(2, Math.max(0, s.strikes - 1)), 8000);

  const delta = now - s.lastAt;
  if (delta < 250 && s.strikes >= 3) {
    return { action: 'block', retryAfterMs: 15_000 };
  }

  return delayMs >= 500 ? { action: 'delay', delayMs } : { action: 'none' };
}
