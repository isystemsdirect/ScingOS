import { createClient } from '@scingos/sdk';

const state = {
  baseUrl: (typeof window !== 'undefined' && window.location?.origin?.startsWith('http'))
    ? window.location.origin
    : 'http://127.0.0.1:3333',
  lastMessageAt: null as Date | null,
  healthTimer: null as number | null,
  stream: null as { close: () => void } | null
};

const client = createClient({ baseUrl: state.baseUrl });

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el;
}

function setText(id: string, text: string) {
  $(id).textContent = text;
}

function setPill(id: string, text: string) {
  setText(id, text);
}

function isoOrDash(d: Date | null): string {
  return d ? d.toISOString() : '-';
}

async function pollHealth() {
  try {
    const json: any = await client.health.check();
    setPill('service', String(json?.status ?? 'ok'));
    setText('uptime', String(json?.uptimeSeconds ?? '-'));
  } catch {
    setPill('service', 'down');
    setText('uptime', '-');
  }
}

function stopStreams() {
  state.stream?.close();
  state.stream = null;
  setPill('transport', 'disconnected');
}

function connectWsThenSse() {
  stopStreams();

  state.stream = client.stream.connectAuto({
    prefer: 'ws',
    fallback: 'sse',
    preferJson: true,
    onStatus: (s: any) => setPill('transport', s.transport),
    onEvent: () => {
      state.lastMessageAt = new Date();
      setText('lastMsg', isoOrDash(state.lastMessageAt));
    }
  });
}

async function snapshotDiagnostics() {
  const pretty = (v: unknown) => JSON.stringify(v, null, 2);

  try {
    const [versionJson, compatJson] = await Promise.all([
      client.version.get(),
      client.compat.get()
    ]);

    setText('version', pretty(versionJson));
    setText('compat', pretty(compatJson));
  } catch (err) {
    setText('version', pretty({ error: 'failed' }));
    setText('compat', pretty({ error: 'failed' }));
  }
}

function start() {
  setText('baseUrl', state.baseUrl);
  setText('lastMsg', isoOrDash(state.lastMessageAt));

  $('btnReconnect').addEventListener('click', () => connectWsThenSse());
  $('btnDiagnostics').addEventListener('click', () => void snapshotDiagnostics());

  if (state.healthTimer) window.clearInterval(state.healthTimer);
  state.healthTimer = window.setInterval(() => void pollHealth(), 1500);
  void pollHealth();
  connectWsThenSse();
}

start();
