import type { CaptureRecord, CaptureRequest } from './deviceTypes';

export type QueuedCapture = {
  queuedAt: string;
  request: CaptureRequest;
  record: CaptureRecord;
};

export type CaptureStore = {
  enqueue: (item: QueuedCapture) => Promise<void> | void;
  listPending: () => Promise<QueuedCapture[]> | QueuedCapture[];
  markDone: (captureId: string) => Promise<void> | void;
};

export function createInMemoryCaptureStore(): CaptureStore {
  const pending: QueuedCapture[] = [];

  return {
    enqueue: (item) => {
      pending.push(item);
    },
    listPending: () => [...pending],
    markDone: (captureId: string) => {
      const idx = pending.findIndex((p) => p.record.captureId === captureId);
      if (idx >= 0) pending.splice(idx, 1);
    },
  };
}
