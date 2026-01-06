import React, { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@scingos/sdk';
import { ScingClientProvider, useServiceHealth, useNeuralStream, useLastEvent, useScingClient } from '@scingos/sdk-react';

function App() {
  const client = useScingClient();
  const health = useServiceHealth(1500);
  const stream = useNeuralStream({ transport: 'auto' });
  const last = useLastEvent();

  const sendPing = useCallback(async () => {
    await client.events.publish('system.ping', { hello: 'panel' }, { source: 'hello-panel' });
  }, [client]);

  return (
    <div>
      <h1 style={{ margin: 0 }}>Hello Panel</h1>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <span className="pill">health: {health.status}</span>
        <span className="pill">transport: {stream.status?.transport ?? 'n/a'} {stream.status?.status ?? ''}</span>
        <span className="pill">last: {last?.receivedAt ?? '-'}</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={() => void sendPing()}>Send system.ping</button>
      </div>

      <pre style={{ marginTop: 12 }}>{JSON.stringify(last?.json ?? null, null, 2)}</pre>
    </div>
  );
}

const client = createClient({ baseUrl: 'http://127.0.0.1:3333' });
createRoot(document.getElementById('root')!).render(
  <ScingClientProvider client={client}>
    <App />
  </ScingClientProvider>
);
