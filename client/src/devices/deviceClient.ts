import { createDeviceRouter } from '@scing/devices/deviceRouter';
import type { CaptureStore, QueuedCapture } from '@scing/devices/captureStore';
import type { DeviceRouter } from '@scing/devices/deviceRouter';

const DEVICE_ID_KEY = 'scing.deviceId.v1';
const CAPTURE_QUEUE_KEY = 'scing.captureQueue.v1';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const fresh = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, fresh);
    return fresh;
  } catch {
    return 'unknown';
  }
}

function loadQueue(): QueuedCapture[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CAPTURE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedCapture[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(items: QueuedCapture[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CAPTURE_QUEUE_KEY, JSON.stringify(items.slice(-200)));
  } catch {
    // ignore
  }
}

export function createLocalStorageCaptureStore(): CaptureStore {
  return {
    enqueue: (item) => {
      const q = loadQueue();
      q.push(item);
      saveQueue(q);
    },
    listPending: () => loadQueue(),
    markDone: (captureId: string) => {
      const q = loadQueue();
      const next = q.filter((i) => i.record.captureId !== captureId);
      saveQueue(next);
    },
  };
}

export function createClientDeviceRouter(): DeviceRouter {
  const captureStore = createLocalStorageCaptureStore();
  const router = createDeviceRouter({ captureStore });

  // Providers can be registered here (camera/telemetry/etc). For now, router will
  // queue captures when no provider is available.

  return router;
}
