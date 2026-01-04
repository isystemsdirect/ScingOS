import type { NextApiRequest, NextApiResponse } from 'next';
import { baneHttpGuard } from '@scing/bane/server/baneGuards';

type NeuralMode = 'think' | 'speak' | 'alert' | 'idle';

type NeuralEvent = {
  ts: number;
  source: string;
  mode: NeuralMode;
  intensity: number;
  channels: {
    lari: number;
    bane: number;
    io: number;
  };
  payload?: {
    text?: string;
    sessionId?: string;
    tags?: string[];
  };
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function makeEvent(ts: number): NeuralEvent {
  const phase = (ts / 1000) % (Math.PI * 2);
  const intensity = clamp01(0.55 + 0.35 * Math.sin(phase));

  const modes: NeuralMode[] = ['think', 'speak', 'alert', 'idle'];
  const mode = modes[Math.floor((ts / 2500) % modes.length)];

  const channels = {
    lari: mode === 'think' ? 1 : mode === 'idle' ? 0.35 : 0.15,
    bane: mode === 'alert' ? 1 : 0.1,
    io: mode === 'speak' ? 0.75 : 0.25,
  };

  return {
    ts,
    source: 'neural-backend-stub',
    mode,
    intensity,
    channels,
    payload: {
      text: mode === 'speak' ? 'demo: speaking' : mode === 'think' ? 'demo: thinking' : undefined,
      tags: ['demo', `mode:${mode}`],
    },
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const host = typeof req.headers.host === 'string' ? req.headers.host : 'localhost';
  const path = req.url ? new URL(req.url, `http://${host}`).pathname : '/api/neural/poll';
  const identityId = typeof req.headers['x-bane-identity'] === 'string' ? req.headers['x-bane-identity'] : undefined;
  const capsHeader = typeof req.headers['x-bane-capabilities'] === 'string' ? req.headers['x-bane-capabilities'] : '';
  const capabilities = capsHeader
    ? capsHeader
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const decision = baneHttpGuard({
    path,
    bodyText: '',
    identityId,
    capabilities,
    sessionIntegrity: identityId
      ? { nonceOk: true, signatureOk: true, tokenFresh: true }
      : { nonceOk: false, signatureOk: false, tokenFresh: false },
  });

  if (!decision.ok) {
    res.setHeader('x-bane-trace-id', decision.traceId);
    if (decision.retryAfterMs) res.setHeader('retry-after', String(Math.ceil(decision.retryAfterMs / 1000)));
    res.status(decision.status).json({ ok: false, message: decision.message, traceId: decision.traceId });
    return;
  }

  res.setHeader('x-bane-trace-id', decision.traceId);

  const ts = Date.now();
  res.status(200).json(makeEvent(ts));
}
