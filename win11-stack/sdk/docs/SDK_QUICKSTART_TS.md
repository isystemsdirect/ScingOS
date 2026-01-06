# TypeScript SDK Quickstart

## Install (local)

From repo root:

- `npm.cmd --prefix win11-stack/sdk/ts/packages/scingos-sdk install`
- `npm.cmd --prefix win11-stack/sdk/ts/packages/scingos-sdk run build`

## Use

```ts
import { createClient } from '@scingos/sdk';

const client = createClient({ baseUrl: 'http://127.0.0.1:3333' });

await client.health.check();
await client.version.get();
await client.compat.get();

await client.events.publish('system.ping', { hello: 'world' }, { source: 'my-app' });

const conn = client.stream.connectAuto({
  prefer: 'ws',
  fallback: 'sse',
  preferJson: true,
  onStatus: (s) => console.log('status', s),
  onEvent: (ev) => console.log('event', ev.json ?? ev.raw)
});

// later
conn.close();
```
