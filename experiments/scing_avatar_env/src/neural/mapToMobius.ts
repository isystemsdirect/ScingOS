import type { NeuralEvent } from './types';
import type { NeuralSignal } from '../../../../mobius/signal';

const clamp01 = (n: unknown) => {
  const x = typeof n === 'number' ? n : 0;
  return Math.max(0, Math.min(1, x));
};

function tagsFromPayload(evt: NeuralEvent): string[] {
  const tags: string[] = [];

  if (evt.mode) tags.push(`mode:${evt.mode}`);
  if (evt.source) tags.push(`source:${evt.source}`);

  const payloadTags = evt.payload && (evt.payload as any).tags;
  if (Array.isArray(payloadTags)) {
    for (const t of payloadTags) {
      if (typeof t === 'string' && t.trim()) tags.push(t.trim());
    }
  }

  return tags;
}

export function neuralEventToSignal(evt: NeuralEvent): NeuralSignal {
  const intensity = clamp01(evt.intensity);
  const lari = clamp01(evt.channels?.lari);
  const bane = clamp01(evt.channels?.bane);
  const io = clamp01(evt.channels?.io);

  // Minimal canonical mapping into the Mobius `NeuralSignal` contract:
  // - We preserve the full event under `content` so nothing is lost.
  // - We add normalized fields for quick consumption.
  return {
    role: evt.mode === 'alert' ? 'critique' : 'propose',
    content: {
      ts: typeof evt.ts === 'number' ? evt.ts : Date.now(),
      mode: evt.mode,
      intensity,
      channels: { lari, bane, io },
      payload: evt.payload ?? {},
      raw: evt,
    },
    tags: tagsFromPayload(evt),
    annotations: {
      source: evt.source ?? 'neural-backend',
    },
  };
}
