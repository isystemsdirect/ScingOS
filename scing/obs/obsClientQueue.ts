import type { ObsEvent } from './obsTypes';

const KEY = 'scing_obs_queue_v1';

function load(): ObsEvent[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(arr: ObsEvent[]) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-500)));
  } catch {
    // offline-safe: best-effort only
  }
}

export function enqueueObs(evt: ObsEvent) {
  const arr = load();
  arr.push(evt);
  save(arr);
}

export function peekObs(limit: number = 100): ObsEvent[] {
  return load().slice(0, limit);
}

export function dropObs(ids: string[]) {
  const arr = load().filter((e) => !ids.includes(e.eventId));
  save(arr);
}
