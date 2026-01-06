import React from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@scingos/sdk';
import { ScingClientProvider, useServiceHealth, useNeuralStream, useLastEvent } from '@scingos/sdk-react';

function Panel() {
  const health = useServiceHealth(1500);
  const stream = useNeuralStream({ transport: 'auto' });
  const last = useLastEvent();

  return (
    <div>
      <h1 style={{ margin: 0 }}>Panel Template</h1>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <span className="pill">health: {health.status}</span>
        <span className="pill">transport: {stream.status?.transport ?? 'n/a'} {stream.status?.status ?? ''}</span>
        <span className="pill">last: {last?.receivedAt ?? '-'}</span>
      </div>
      <pre style={{ marginTop: 12 }}>{JSON.stringify(last?.json ?? null, null, 2)}</pre>
    </div>
  );
}

const client = createClient({ baseUrl: 'http://127.0.0.1:3333' });
createRoot(document.getElementById('root')!).render(
  <ScingClientProvider client={client}>
    <Panel />
  </ScingClientProvider>
);
