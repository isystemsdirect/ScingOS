import type { ArtifactRecord } from '@scing/evidence';

const QKEY = 'scing_evidence_queue_v1';

export type QueuedItem =
  | { kind: 'artifactRecord'; inspectionId: string; artifactId: string; record: ArtifactRecord }
  | {
      kind: 'finalize';
      orgId: string;
      inspectionId: string;
      artifactId: string;
      contentHash: string;
      signature?: any;
      signer: 'device' | 'server';
    };

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadQueue(): QueuedItem[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(QKEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveQueue(items: QueuedItem[]) {
  if (!isBrowser()) return;
  localStorage.setItem(QKEY, JSON.stringify(items));
}

export function enqueue(item: QueuedItem) {
  const q = loadQueue();
  q.push(item);
  saveQueue(q);
}

export function dequeue(): QueuedItem | null {
  const q = loadQueue();
  const item = q.shift() ?? null;
  saveQueue(q);
  return item;
}

export function clearQueue() {
  if (!isBrowser()) return;
  localStorage.removeItem(QKEY);
}
