import type { AvatarIntent, AvatarIntentType } from './intentTypes';

export type AvatarIntentHandler = (intent: AvatarIntent) => void;

const handlers = new Set<AvatarIntentHandler>();

function createCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `corr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function subscribeAvatarIntents(handler: AvatarIntentHandler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function dispatchAvatarIntent(type: AvatarIntentType, meta?: Record<string, any>): AvatarIntent {
  const intent: AvatarIntent = {
    correlationId: createCorrelationId(),
    type,
    ts: Date.now(),
    meta,
  };

  for (const h of handlers) {
    try {
      h(intent);
    } catch {
      // ignore handler faults to keep intent bus fail-open
    }
  }

  return intent;
}
