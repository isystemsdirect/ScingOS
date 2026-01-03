import type { NextApiRequest, NextApiResponse } from 'next';

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

export const config = {
  api: {
    bodyParser: false,
  },
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

function writeEvent(res: NextApiResponse, evt: NeuralEvent) {
  res.write(`data: ${JSON.stringify(evt)}\n\n`);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  // Flush headers early.
  res.flushHeaders?.();

  // Avoid server-side timeouts killing the stream.
  try {
    req.socket.setTimeout(0);
  } catch {
    // ignore
  }

  // Initial event.
  writeEvent(res, makeEvent(Date.now()));

  // Emit every 500–1000ms (jittered).
  let closed = false;
  const timers = new Set<NodeJS.Timeout>();

  const schedule = () => {
    if (closed) return;

    const delay = 500 + Math.floor((Date.now() % 500));
    const t = setTimeout(() => {
      if (closed) return;

      // Comment line as keep-alive for proxies.
      res.write(`: ping ${Date.now()}\n\n`);
      writeEvent(res, makeEvent(Date.now()));
      schedule();
    }, delay);

    timers.add(t);
  };

  schedule();

  const onClose = () => {
    closed = true;
    for (const t of timers) clearTimeout(t);
    timers.clear();
    res.end();
  };

  req.on('close', onClose);
}
