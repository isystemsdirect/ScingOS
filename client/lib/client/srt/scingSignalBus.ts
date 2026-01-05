import type { ScingSignals } from "../../shared/srt/scingSignals";

type Listener = (s: ScingSignals) => void;

const listeners = new Set<Listener>();
let last: ScingSignals | null = null;

export function publishScingSignals(s: ScingSignals) {
  last = s;
  for (const fn of listeners) fn(s);
}

export function subscribeScingSignals(fn: Listener) {
  listeners.add(fn);
  // immediate replay of last (safe, bounded)
  if (last) fn(last);
  return () => listeners.delete(fn);
}

export function getLastScingSignals() {
  return last;
}
