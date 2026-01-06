import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ScingClient, StreamEvent, ClientStatus } from '@scingos/sdk';

type ProviderProps = {
  client: ScingClient;
  children: React.ReactNode;
};

const ClientCtx = createContext<ScingClient | null>(null);

export function ScingClientProvider({ client, children }: ProviderProps) {
  return <ClientCtx.Provider value={client}>{children}</ClientCtx.Provider>;
}

export function useScingClient(): ScingClient {
  const client = useContext(ClientCtx);
  if (!client) throw new Error('useScingClient must be used within ScingClientProvider');
  return client;
}

type HealthState = {
  status: 'unknown' | 'ok' | 'down';
  data?: unknown;
  error?: string;
};

export function useServiceHealth(pollMs = 1500): HealthState {
  const client = useScingClient();
  const [state, setState] = useState<HealthState>({ status: 'unknown' });

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await client.health.check();
        if (cancelled) return;
        setState({ status: 'ok', data });
      } catch (err: any) {
        if (cancelled) return;
        setState({ status: 'down', error: err?.message ?? 'down' });
      }
    };

    const id = window.setInterval(() => void tick(), pollMs);
    void tick();

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [client, pollMs]);

  return state;
}

export function useServiceVersion(): { data?: unknown; status: 'idle' | 'loading' | 'ok' | 'down' } {
  const client = useScingClient();
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'down'>('idle');
  const [data, setData] = useState<unknown>();

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    client.version
      .get()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('ok');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('down');
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  return { data, status };
}

type NeuralStreamState = {
  status: ClientStatus | null;
  lastMessageAt: string | null;
};

let lastEvent: StreamEvent | null = null;
const listeners = new Set<() => void>();
function publishLastEvent(ev: StreamEvent) {
  lastEvent = ev;
  for (const l of listeners) l();
}

export function useNeuralStream(opts?: { transport?: 'auto' | 'ws' | 'sse' }) {
  const client = useScingClient();
  const transport = opts?.transport ?? 'auto';
  const [status, setStatus] = useState<ClientStatus | null>(null);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);

  const handleRef = useRef<{ close: () => void } | null>(null);

  useEffect(() => {
    handleRef.current?.close();
    handleRef.current = null;

    const onEvent = (ev: StreamEvent) => {
      setLastMessageAt(ev.receivedAt);
      publishLastEvent(ev);
    };

    const onStatus = (s: ClientStatus) => setStatus(s);

    try {
      if (transport === 'ws') {
        handleRef.current = client.stream.connectWs({ onEvent, onStatus, preferJson: true });
      } else if (transport === 'sse') {
        handleRef.current = client.stream.connectSse({ onEvent, onStatus, preferJson: true });
      } else {
        handleRef.current = client.stream.connectAuto({ prefer: 'ws', fallback: 'sse', onEvent, onStatus, preferJson: true });
      }
    } catch {
      setStatus({ status: 'disconnected', transport: transport === 'sse' ? 'sse' : 'ws', detail: 'transport unavailable' });
    }

    return () => {
      handleRef.current?.close();
      handleRef.current = null;
    };
  }, [client, transport]);

  return { status, lastMessageAt } satisfies NeuralStreamState;
}

export function useLastEvent(typeFilter?: string): StreamEvent | null {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const on = () => setTick((x) => x + 1);
    listeners.add(on);
    return () => {
      listeners.delete(on);
    };
  }, []);

  const current = useMemo(() => lastEvent, [tick]);
  if (!typeFilter) return current;

  const json: any = current?.json;
  if (json && typeof json === 'object' && (json as any).type === typeFilter) return current;
  return null;
}
