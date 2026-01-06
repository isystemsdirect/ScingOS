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

const root = document.documentElement;

function setVisual(vars: Partial<{ pulse: number; glow: number; hue: string; sat: number }>) {
  if (vars.pulse !== undefined) root.style.setProperty('--pulse', String(vars.pulse));
  if (vars.glow !== undefined) root.style.setProperty('--glow', String(vars.glow));
  if (vars.hue !== undefined) root.style.setProperty('--hue', vars.hue);
  if (vars.sat !== undefined) root.style.setProperty('--sat', String(vars.sat));
}

function bump(pulse = 1.06, glow = 1.0) {
  setVisual({ pulse, glow });
  window.setTimeout(() => setVisual({ pulse: 1.0, glow: 0.85 }), 180);
}

function applyEventMood(type: string) {
  const t = (type || '').toLowerCase();

  if (t.startsWith('bane.') || t.includes('alert') || t.includes('security')) {
    setVisual({ hue: '320deg', sat: 1.25 });
    bump(1.08, 1.10);
    return;
  }

  if (t.startsWith('lari.') || t.includes('think') || t.includes('plan')) {
    setVisual({ hue: '38deg', sat: 1.18 });
    bump(1.05, 0.98);
    return;
  }

  if (t.includes('heartbeat')) {
    setVisual({ hue: '45deg', sat: 1.12 });
    bump(1.03, 0.92);
    return;
  }

  if (t.includes('neural') || t.startsWith('srt.') || t.startsWith('scing.')) {
    setVisual({ hue: '210deg', sat: 1.15 });
    bump(1.06, 1.02);
    return;
  }

  setVisual({ hue: '38deg', sat: 1.15 });
}

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

function getAdminToken(): string | null {
  const el = document.getElementById('adminToken') as HTMLInputElement | null;
  const v = (el?.value ?? '').trim();
  return v ? v : null;
}

async function devFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers ?? undefined);
  if (token) headers.set('X-Scing-Admin-Token', token);
  return fetch(state.baseUrl.replace(/\/$/, '') + path, { ...init, headers });
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
  setVisual({ glow: 0.55, pulse: 1.0 });
}

function connectWsThenSse() {
  stopStreams();

  state.stream = client.stream.connectAuto({
    prefer: 'ws',
    fallback: 'sse',
    preferJson: true,
    onStatus: (s: any) => {
      const transport = String(s?.transport ?? 'disconnected');
      setPill('transport', transport);
      if (transport === 'ws' || transport === 'sse') setVisual({ glow: 0.85 });
      else setVisual({ glow: 0.55, pulse: 1.0 });
    },
    onEvent: (ev: any) => {
      state.lastMessageAt = new Date();
      setText('lastMsg', isoOrDash(state.lastMessageAt));

      const j: any = ev?.json;
      const payload = j?.payload ?? null;
      const envelopeType = String(
        payload?.type ??
          payload?.eventType ??
          j?.type ??
          j?.eventType ??
          '-'
      );

      setText('lastEventType', envelopeType);
      applyEventMood(envelopeType);

      const display = payload ?? j ?? { raw: ev?.raw ?? '' };
      setText('lastEvent', JSON.stringify(display, null, 2));
    }
  });
}

function clearPluginUi() {
  const list = document.getElementById('pluginsList');
  if (list) list.textContent = '';
  setText('pluginLogs', '-');
}

function renderPlugins(plugins: any[]) {
  const list = document.getElementById('pluginsList');
  if (!list) return;
  list.textContent = '';

  const addRow = (k: string, v: HTMLElement | string) => {
    const kEl = document.createElement('div');
    kEl.className = 'k';
    kEl.textContent = k;
    list.appendChild(kEl);

    const vEl = document.createElement('div');
    if (typeof v === 'string') vEl.textContent = v;
    else vEl.appendChild(v);
    list.appendChild(vEl);
  };

  if (!plugins.length) {
    addRow('Plugins', '(none installed)');
    return;
  }

  for (const p of plugins) {
    const row = document.createElement('div');
    row.className = 'row';

    const title = document.createElement('span');
    title.textContent = `${p.id} — ${p.name} (${p.status})`;
    row.appendChild(title);

    const btnEnable = document.createElement('button');
    btnEnable.type = 'button';
    btnEnable.textContent = 'Enable';
    btnEnable.onclick = async () => {
      const res = await devFetch(`/plugins/enable/${encodeURIComponent(p.id)}`, { method: 'POST' });
      if (!res.ok) setText('pluginLogs', await res.text());
      await refreshPlugins();
    };

    const btnDisable = document.createElement('button');
    btnDisable.type = 'button';
    btnDisable.textContent = 'Disable';
    btnDisable.onclick = async () => {
      const res = await devFetch(`/plugins/disable/${encodeURIComponent(p.id)}`, { method: 'POST' });
      if (!res.ok) setText('pluginLogs', await res.text());
      await refreshPlugins();
    };

    const btnLogs = document.createElement('button');
    btnLogs.type = 'button';
    btnLogs.textContent = 'View logs';
    btnLogs.onclick = async () => {
      const res = await devFetch(`/plugins/logs/${encodeURIComponent(p.id)}?lines=200`, { method: 'GET' });
      setText('pluginLogs', await res.text());
    };

    if (String(p.status).toLowerCase() === 'enabled') row.appendChild(btnDisable);
    else row.appendChild(btnEnable);
    row.appendChild(btnLogs);

    addRow('Plugin', row);
  }
}

async function refreshPlugins() {
  try {
    const res = await devFetch('/plugins', { method: 'GET' });
    if (!res.ok) {
      setText('pluginLogs', await res.text());
      clearPluginUi();
      return;
    }

    const json = await res.json();
    renderPlugins(Array.isArray(json) ? json : []);
  } catch (err) {
    clearPluginUi();
    setText('pluginLogs', String(err));
  }
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
  setText('lastEventType', '-');
  setText('lastEvent', '-');

  $('btnReconnect').addEventListener('click', () => connectWsThenSse());
  $('btnDiagnostics').addEventListener('click', () => void snapshotDiagnostics());
  $('btnPluginsRefresh').addEventListener('click', () => void refreshPlugins());

  if (state.healthTimer) window.clearInterval(state.healthTimer);
  state.healthTimer = window.setInterval(() => void pollHealth(), 1500);
  void pollHealth();
  connectWsThenSse();
  void refreshPlugins();
}

start();
