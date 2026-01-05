import type { PolicySnapshot } from '@scing/bane';

const KEY = 'scing_bane_policy_snapshot_v1';

export function loadSnapshot(): PolicySnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PolicySnapshot;
  } catch {
    return null;
  }
}

export function saveSnapshot(s: PolicySnapshot) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSnapshot() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
