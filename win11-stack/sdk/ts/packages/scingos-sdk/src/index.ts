export type ScingEnvelope<TPayload = unknown> = {
  version: string;
  timestamp: string;
  correlationId: string;
  source: string;
  type: string;
  payload: TPayload;
  signature?: string;
};

export type ClientStatus = {
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  transport: 'ws' | 'sse';
  detail?: string;
};

export type StreamEvent = {
  raw: string;
  json?: unknown;
  receivedAt: string;
};

export type CreateClientOptions = {
  baseUrl?: string;
  adminToken?: string;
};

export type PublishOptions = {
  correlationId?: string;
  source?: string;
  signature?: string;
  timestamp?: string;
};

export class HttpError extends Error {
  public readonly status: number;
  public readonly bodyText: string;
  constructor(message: string, status: number, bodyText: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.bodyText = bodyText;
  }
}

export class TransportUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransportUnavailableError';
  }
}

export type ScingClient = {
  baseUrl: string;
  adminToken?: string;
  health: {
    check: () => Promise<unknown>;
  };
  version: {
    get: () => Promise<unknown>;
  };
  compat: {
    get: () => Promise<unknown>;
  };
  events: {
    publish: (type: string, payload: unknown, opts?: PublishOptions) => Promise<void>;
  };
  stream: {
    connectWs: (opts: {
      onEvent: (ev: StreamEvent) => void;
      onStatus?: (s: ClientStatus) => void;
      preferJson?: boolean;
    }) => { close: () => void };
    connectSse: (opts: {
      onEvent: (ev: StreamEvent) => void;
      onStatus?: (s: ClientStatus) => void;
      preferJson?: boolean;
    }) => { close: () => void };
    connectAuto: (opts: {
      prefer: 'ws';
      fallback: 'sse';
      onEvent: (ev: StreamEvent) => void;
      onStatus?: (s: ClientStatus) => void;
      preferJson?: boolean;
    }) => { close: () => void };
  };
};

import { CORE_VERSION } from './generated.js';

const DEFAULT_BASE_URL = 'http://127.0.0.1:3333';

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  const c: any = (globalThis as any).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  // fallback: not cryptographically strong, but stable enough for dev correlation IDs
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function httpJson(baseUrl: string, path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      'content-type': 'application/json'
    }
  });
  const text = await res.text();
  if (!res.ok) throw new HttpError(`HTTP ${res.status} for ${path}`, res.status, text);
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function backoffDelaysMs() {
  const delays = [250, 500, 1000, 2000, 3500, 5000];
  let i = 0;
  return () => delays[Math.min(i++, delays.length - 1)];
}

function toWsUrl(baseUrl: string) {
  return baseUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
}

function parseMaybeJson(raw: string, preferJson: boolean | undefined): unknown {
  if (!preferJson) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function createClient(opts: CreateClientOptions = {}): ScingClient {
  const baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  const adminToken = opts.adminToken;

  const publish = async (type: string, payload: unknown, publishOpts?: PublishOptions) => {
    const env: ScingEnvelope = {
      version: CORE_VERSION,
      timestamp: publishOpts?.timestamp ?? nowIso(),
      correlationId: publishOpts?.correlationId ?? uuid(),
      source: publishOpts?.source ?? 'sdk.ts',
      type,
      payload,
      signature: publishOpts?.signature
    };

    await httpJson(baseUrl, '/event', {
      method: 'POST',
      body: JSON.stringify(env),
      headers: adminToken ? { 'X-Scing-Admin-Token': adminToken } : undefined
    });
  };

  const connectWs = (o: {
    onEvent: (ev: StreamEvent) => void;
    onStatus?: (s: ClientStatus) => void;
    preferJson?: boolean;
  }) => {
    const WebSocketCtor: any = (globalThis as any).WebSocket;
    if (!WebSocketCtor) throw new TransportUnavailableError('WebSocket is not available in this runtime');

    const wsUrl = `${toWsUrl(baseUrl)}/ws/neural`;
    const nextDelay = backoffDelaysMs();

    let closed = false;
    let ws: WebSocket | null = null;

    const connect = (phase: 'connecting' | 'reconnecting') => {
      if (closed) return;
      o.onStatus?.({ status: phase, transport: 'ws' });
      const socket: WebSocket = new WebSocketCtor(wsUrl);
      ws = socket;

      socket.onopen = () => {
        o.onStatus?.({ status: 'connected', transport: 'ws' });
      };

      socket.onmessage = (evt: MessageEvent) => {
        const raw = String((evt as any).data ?? '');
        o.onEvent({ raw, json: parseMaybeJson(raw, o.preferJson), receivedAt: nowIso() });
      };

      socket.onclose = () => {
        if (closed) return;
        o.onStatus?.({ status: 'disconnected', transport: 'ws' });
        const delay = nextDelay();
        o.onStatus?.({ status: 'reconnecting', transport: 'ws', detail: `retrying in ${delay}ms` });
        setTimeout(() => connect('reconnecting'), delay);
      };

      socket.onerror = () => {
        try { socket.close(); } catch { /* ignore */ }
      };
    };

    connect('connecting');

    return {
      close: () => {
        closed = true;
        try { ws?.close(); } catch { /* ignore */ }
        ws = null;
      }
    };
  };

  const connectSse = (o: {
    onEvent: (ev: StreamEvent) => void;
    onStatus?: (s: ClientStatus) => void;
    preferJson?: boolean;
  }) => {
    const EventSourceCtor: any = (globalThis as any).EventSource;
    if (!EventSourceCtor) throw new TransportUnavailableError('EventSource is not available in this runtime');

    const sseUrl = `${baseUrl}/sse/neural`;
    const nextDelay = backoffDelaysMs();

    let closed = false;
    let es: EventSource | null = null;

    const connect = (phase: 'connecting' | 'reconnecting') => {
      if (closed) return;
      o.onStatus?.({ status: phase, transport: 'sse' });
      const source: EventSource = new EventSourceCtor(sseUrl);
      es = source;

      source.onopen = () => {
        o.onStatus?.({ status: 'connected', transport: 'sse' });
      };

      source.onmessage = (evt: MessageEvent) => {
        const raw = String((evt as any).data ?? '');
        o.onEvent({ raw, json: parseMaybeJson(raw, o.preferJson), receivedAt: nowIso() });
      };

      source.onerror = () => {
        if (closed) return;
        try { es?.close(); } catch { /* ignore */ }
        es = null;
        o.onStatus?.({ status: 'disconnected', transport: 'sse' });
        const delay = nextDelay();
        o.onStatus?.({ status: 'reconnecting', transport: 'sse', detail: `retrying in ${delay}ms` });
        setTimeout(() => connect('reconnecting'), delay);
      };
    };

    connect('connecting');

    return {
      close: () => {
        closed = true;
        try { es?.close(); } catch { /* ignore */ }
        es = null;
      }
    };
  };

  const connectAuto = (o: {
    prefer: 'ws';
    fallback: 'sse';
    onEvent: (ev: StreamEvent) => void;
    onStatus?: (s: ClientStatus) => void;
    preferJson?: boolean;
  }) => {
    let primary: { close: () => void } | null = null;
    let secondary: { close: () => void } | null = null;
    let closed = false;

    const startSse = () => {
      if (closed || secondary) return;
      secondary = connectSse({
        onEvent: o.onEvent,
        onStatus: (s) => o.onStatus?.(s),
        preferJson: o.preferJson
      });
    };

    try {
      let connectedOnce = false;

      primary = connectWs({
        onEvent: o.onEvent,
        preferJson: o.preferJson,
        onStatus: (s) => {
          o.onStatus?.(s);

          if (s.transport === 'ws' && s.status === 'connected') {
            connectedOnce = true;
          }

          // If WS can't establish a stable connection (drops before first connect), fail over to SSE.
          if (s.transport === 'ws' && (s.status === 'disconnected' || s.status === 'reconnecting') && !connectedOnce) {
            try { primary?.close(); } catch { /* ignore */ }
            primary = null;
            startSse();
          }
        }
      });
    } catch {
      startSse();
    }

    return {
      close: () => {
        closed = true;
        primary?.close();
        secondary?.close();
        primary = null;
        secondary = null;
      }
    };
  };

  return {
    baseUrl,
    adminToken,
    health: { check: () => httpJson(baseUrl, '/health', { method: 'GET' }) },
    version: { get: () => httpJson(baseUrl, '/version', { method: 'GET' }) },
    compat: { get: () => httpJson(baseUrl, '/compat', { method: 'GET' }) },
    events: { publish },
    stream: { connectWs, connectSse, connectAuto }
  };
}
