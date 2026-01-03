import type { NeuralClientOptions, NeuralEvent, NeuralUnsubscribe } from './types';

function safeJsonParse(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

export function connectNeural(
  opts: NeuralClientOptions,
  onEvent: (evt: NeuralEvent) => void,
  onStatus?: (s: { connected: boolean; error?: string }) => void
): NeuralUnsubscribe {
  const { url, transport } = opts;

  if (!url) {
    onStatus?.({ connected: false, error: 'Missing VITE_NEURAL_URL' });
    return () => {};
  }

  if (transport === 'sse') {
    const es = new EventSource(url);
    es.onopen = () => onStatus?.({ connected: true });
    es.onerror = () => onStatus?.({ connected: false, error: 'SSE error' });
    es.onmessage = (m) => {
      const parsed = safeJsonParse(m.data);
      if (parsed && typeof parsed === 'object') onEvent(parsed as NeuralEvent);
    };
    return () => es.close();
  }

  if (transport === 'ws') {
    const ws = new WebSocket(url);
    ws.onopen = () => onStatus?.({ connected: true });
    ws.onerror = () => onStatus?.({ connected: false, error: 'WS error' });
    ws.onclose = () => onStatus?.({ connected: false, error: 'WS closed' });
    ws.onmessage = (m) => {
      const text = typeof m.data === 'string' ? m.data : '';
      const parsed = safeJsonParse(text);
      if (parsed && typeof parsed === 'object') onEvent(parsed as NeuralEvent);
    };
    return () => ws.close();
  }

  // poll
  const pollIntervalMs = opts.pollIntervalMs ?? 500;
  let alive = true;

  const tick = async () => {
    while (alive) {
      try {
        const res = await fetch(url, { headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as unknown;
        if (data && typeof data === 'object') onEvent(data as NeuralEvent);
        onStatus?.({ connected: true });
      } catch (e) {
        onStatus?.({
          connected: false,
          error: e instanceof Error ? e.message : 'poll error',
        });
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  };

  void tick();
  return () => {
    alive = false;
  };
}
