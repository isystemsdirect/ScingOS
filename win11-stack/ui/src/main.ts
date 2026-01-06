type HealthResponse = {
  status: string;
  serviceName: string;
  uptimeSeconds: number;
};

const DEFAULT_BASE = 'http://127.0.0.1:3333';

function resolveBaseUrl(): string {
  // If served by the backend at /ui, use same origin.
  if (typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
    return window.location.origin;
  }
  return DEFAULT_BASE;
}

const state = {
  baseUrl: resolveBaseUrl(),
  ws: null as WebSocket | null,
  es: null as EventSource | null,
  lastMessageAt: null as Date | null,
  healthTimer: null as number | null
};

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
    const res = await fetch(`${state.baseUrl}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as HealthResponse;
    setPill('service', json.status);
    setText('uptime', String(json.uptimeSeconds));
  } catch {
    setPill('service', 'down');
    setText('uptime', '-');
  }
}

function stopStreams() {
  if (state.ws) {
    try { state.ws.close(); } catch { /* ignore */ }
    state.ws = null;
  }
  if (state.es) {
    try { state.es.close(); } catch { /* ignore */ }
    state.es = null;
  }
  setPill('transport', 'disconnected');
}

function connectWsThenSse() {
  stopStreams();

  const wsUrl = state.baseUrl.replace(/^http/, 'ws') + '/ws/neural';
  try {
    const ws = new WebSocket(wsUrl);
    state.ws = ws;

    ws.onopen = () => {
      setPill('transport', 'ws');
    };
    ws.onmessage = () => {
      state.lastMessageAt = new Date();
      setText('lastMsg', isoOrDash(state.lastMessageAt));
    };
    ws.onclose = () => {
      if (state.ws === ws) state.ws = null;
      // fallback to SSE
      connectSse();
    };
    ws.onerror = () => {
      // SSE fallback will trigger on close; ensure close happens.
      try { ws.close(); } catch { /* ignore */ }
    };
  } catch {
    connectSse();
  }
}

function connectSse() {
  if (state.es) return;

  try {
    const es = new EventSource(`${state.baseUrl}/sse/neural`);
    state.es = es;

    es.onopen = () => {
      setPill('transport', 'sse');
    };
    es.onmessage = () => {
      state.lastMessageAt = new Date();
      setText('lastMsg', isoOrDash(state.lastMessageAt));
    };
    es.onerror = () => {
      try { es.close(); } catch { /* ignore */ }
      if (state.es === es) state.es = null;
      setPill('transport', 'disconnected');
    };
  } catch {
    setPill('transport', 'disconnected');
  }
}

async function snapshotDiagnostics() {
  const pretty = (v: unknown) => JSON.stringify(v, null, 2);

  try {
    const [versionRes, compatRes] = await Promise.all([
      fetch(`${state.baseUrl}/version`, { cache: 'no-store' }),
      fetch(`${state.baseUrl}/compat`, { cache: 'no-store' })
    ]);

    const versionJson = versionRes.ok ? await versionRes.json() : { error: String(versionRes.status) };
    const compatJson = compatRes.ok ? await compatRes.json() : { error: String(compatRes.status) };

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
